"""A small z-buffered triangle rasterizer in numpy.

Nothing here needs a GPU or OpenGL, which keeps the pipeline running the same
way on any Mac. It is fast enough for the sizes the pipeline uses: tens of
thousands of triangles into a 1–2k image in a few seconds.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageDraw


@dataclass
class Fragments:
    """Per-pixel result of rasterizing: which triangle covers the pixel (-1 for
    none), the barycentric weights inside it and the interpolated depth."""

    face: np.ndarray  # (H, W) int
    bary: np.ndarray  # (H, W, 3) float
    depth: np.ndarray  # (H, W) float, inf where empty


def rasterize(px: np.ndarray, depth: np.ndarray, faces: np.ndarray, size: int) -> Fragments:
    """Rasterize triangles given per-vertex pixel positions and depths.
    Pixel centres sit at integer + 0.5. Only triangles in front of the camera
    (all three depths positive) are drawn; nearer fragments win."""
    face_buf = np.full((size, size), -1, dtype=np.int64)
    bary_buf = np.zeros((size, size, 3))
    z_buf = np.full((size, size), np.inf)

    tri = px[faces]  # (F, 3, 2)
    tri_z = depth[faces]  # (F, 3)
    lo = np.floor(tri.min(axis=1) - 0.5).astype(int)
    hi = np.ceil(tri.max(axis=1) - 0.5).astype(int)
    lo = np.clip(lo, 0, size - 1)
    hi = np.clip(hi, 0, size - 1)
    ok = (tri_z > 0).all(axis=1) & (hi >= lo).all(axis=1)

    for f in np.nonzero(ok)[0]:
        (x0, y0), (x1, y1) = lo[f], hi[f]
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        (ax, ay), (bx, by), (cx, cy) = tri[f]
        area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
        if abs(area) < 1e-12:
            continue
        w0 = ((bx - xs) * (cy - ys) - (by - ys) * (cx - xs)) / area
        w1 = ((cx - xs) * (ay - ys) - (cy - ys) * (ax - xs)) / area
        w2 = 1 - w0 - w1
        inside = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        if not inside.any():
            continue
        # Perspective-correct depth: interpolate 1/z linearly in screen space.
        inv_z = w0 / tri_z[f, 0] + w1 / tri_z[f, 1] + w2 / tri_z[f, 2]
        z = 1 / inv_z
        region = (slice(y0, y1 + 1), slice(x0, x1 + 1))
        nearer = inside & (z < z_buf[region])
        if not nearer.any():
            continue
        z_buf[region][nearer] = z[nearer]
        face_buf[region][nearer] = f
        # Perspective-correct barycentrics, for sampling attributes.
        b = np.stack([w0 / tri_z[f, 0], w1 / tri_z[f, 1], w2 / tri_z[f, 2]], axis=-1) / inv_z[..., None]
        bary_buf[region][nearer] = b[nearer]

    return Fragments(face_buf, bary_buf, z_buf)


def silhouette(px: np.ndarray, faces: np.ndarray, size: int) -> np.ndarray:
    """Fast coverage mask (no depth): every triangle filled with PIL. Used by
    the camera search, which needs hundreds of masks and no visibility."""
    img = Image.new("1", (size, size), 0)
    draw = ImageDraw.Draw(img)
    for tri in px[faces]:
        draw.polygon([tuple(p) for p in tri], fill=1)
    return np.asarray(img, dtype=bool)
