"""Shape templates for packaging whose construction is known.

The shape model guesses an object's depth, and for flat-bottom pouches it
guesses a loaf: a vertical front and a back that holds its depth, then rolls
over. A real flat-bottom (box) pouch is an A-frame: front and back are flat
panels leaning from the full-depth base to meet at the top seal, joined by
flat triangular gussets that fold slightly inward.

pouch() builds that shape straight from the photo:

- Every front vertex sits on the camera ray through its photo pixel, so the
  front outline is the photo's own (rounded seal corners, tear notches) and
  the projected print lands exactly.
- Depth falls in a straight line from `depth` at the base, rounding over
  into the bottom of the seal, which stays a thin flat fin; the back is the
  front mirrored through the bag's middle.
- `depth` is a fraction of the bag's width. The shape model's own estimate
  is a good start (estimate_depth); an extra photo refines it.

The mesh carries a plain atlas (a regular grid unwrap) so the projection
step can treat it like any other.
"""
from __future__ import annotations

import numpy as np
import trimesh
from PIL import Image

from .camera import Camera

ROWS = 72  # rows down the bag
COLS = 80  # columns across each panel
GUSSET_STEPS = 10  # points across each gusset
FIN = 0.0015  # half-thickness of the sealed fin, in scene units
FOLD = 0.08  # how far a gusset's middle folds in, as a fraction of the depth there
SHOULDER = 0.12  # how gradually the panels round over into the seal
ATLAS = 1024
# Outline overlap lost per pixel of mean print reprojection error (fit_pouch).
REPROJECTION_PENALTY = 0.01


def row_extents(alpha: np.ndarray, rows: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Left and right edges of the object along each image row, lightly
    smoothed so a stray pixel doesn't kink the outline.

    Each row's edge is the median over every pixel row in its band (half
    the spacing either side), not the single pixel row it sits on. A
    crimped seal along an edge is a fine sawtooth; sampled one pixel row
    per mesh row, it aliases into a zigzag that shades as ripples."""
    mask = alpha > 127
    half = max(1, int((rows[1] - rows[0]) / 2)) if len(rows) > 1 else 1
    lo, hi = [], []
    for y in range(mask.shape[0]):
        xs = np.nonzero(mask[y])[0]
        lo.append(xs.min() if len(xs) else np.nan)
        hi.append(xs.max() + 1 if len(xs) else np.nan)
    lo, hi = np.array(lo, float), np.array(hi, float)
    left, right = [], []
    for r in rows.astype(int):
        band = slice(max(r - half, 0), r + half + 1)
        left.append(np.nanmedian(lo[band]) if np.isfinite(lo[band]).any() else np.nan)
        right.append(np.nanmedian(hi[band]) if np.isfinite(hi[band]).any() else np.nan)
    left, right = np.array(left, float), np.array(right, float)
    for edge in (left, right):
        ok = ~np.isnan(edge)
        edge[~ok] = np.interp(np.nonzero(~ok)[0], np.nonzero(ok)[0], edge[ok])
    k = np.ones(3) / 3
    smooth = lambda e: np.concatenate([e[:1], np.convolve(e, k, "valid"), e[-1:]])
    return smooth(left), smooth(right)


class PouchFrame:
    """The geometry shared by the template and anything that needs a 3D
    point for a photo pixel: camera rays, the bag's extent in the photo and
    the depth profile (full at the base, nothing from the seal up)."""

    def __init__(self, prepared: Image.Image, camera: Camera, depth: float, seal: float):
        self.alpha = np.asarray(prepared.getchannel("A"))
        ys = np.nonzero((self.alpha > 127).any(1))[0]
        self.top, self.bottom = ys.min(), ys.max() + 1
        self.r, _ = camera.world_to_camera()
        self.eye = camera.eye()
        self.focal = camera.focal
        self.c = camera.size / 2
        self.seal = seal

        # Width in scene units, measured on the middle plane (z = 0).
        mid = (self.top + self.bottom) / 2
        xs = np.nonzero(self.alpha[int(mid)] > 127)[0]
        span = self.ray(np.array([xs.min(), xs.max() + 1.0]), np.array([mid, mid]))
        hits = self.eye + span * ((0 - self.eye[2]) / span[:, 2])[:, None]
        self.base_depth = depth * np.linalg.norm(hits[1] - hits[0])

    def ray(self, px: np.ndarray, py: np.ndarray) -> np.ndarray:
        d = np.stack([(px - self.c) / self.focal, (py - self.c) / self.focal, np.ones_like(px)], axis=-1)
        return d @ self.r  # camera space to world

    def half_depth(self, py: np.ndarray) -> np.ndarray:
        """Half the depth at each image row: a straight lean from the base,
        rounding over into the seal instead of meeting it at a crease (real
        film curves at that shoulder), then the thin fin."""
        h = (self.bottom - py) / (self.bottom - self.top)  # 0 at the base, 1 at the top
        rest = np.clip(1 - h / (1 - self.seal), 0, 1)  # 1 at the base, 0 at the seal
        lean = rest * (1 - np.exp(-rest / SHOULDER))
        return np.maximum(self.base_depth / 2 * lean, FIN)

    def front(self, px: np.ndarray, py: np.ndarray) -> np.ndarray:
        """The front panel's 3D point under each photo pixel."""
        d = self.ray(px, py)
        z = -self.half_depth(py)
        return self.eye + d * ((z - self.eye[2]) / d[:, 2])[:, None]


def pouch(prepared: Image.Image, camera: Camera, depth: float, seal: float) -> trimesh.Trimesh:
    """A flat-bottom pouch fitted to the photo's outline.

    depth: base depth as a fraction of the bag's width.
    seal: height of the flat sealed strip at the top, as a fraction of the
    bag's height; the gussets close to nothing where it begins."""
    frame = PouchFrame(prepared, camera, depth, seal)
    top, bottom = frame.top, frame.bottom
    rows = np.linspace(top + 0.5, bottom - 0.5, ROWS)
    left, right = row_extents(frame.alpha, rows)
    half = frame.half_depth(rows)
    eye = frame.eye

    loop = 2 * COLS + 2 * GUSSET_STEPS
    verts = np.zeros((ROWS, loop + 1, 3))
    for i, py in enumerate(rows):
        front = frame.front(np.linspace(left[i], right[i], COLS), np.full(COLS, py))
        back = front * np.array([1, 1, -1])  # mirrored through z = 0
        fold = FOLD * 2 * half[i]

        def gusset(a: np.ndarray, b: np.ndarray, inward: float) -> np.ndarray:
            s = np.linspace(0, 1, GUSSET_STEPS + 2)[1:-1, None]
            g = a * (1 - s) + b * s
            g[:, 0] += inward * np.sin(np.pi * s[:, 0]) * fold
            return g

        ring = np.concatenate(
            [front, gusset(front[-1], back[-1], -1), back[::-1], gusset(back[0], front[0], 1)], axis=0
        )
        verts[i, :loop] = ring
        verts[i, loop] = ring[0]  # duplicated so the atlas seam has its own UVs

    # Atlas: the tube unrolled into the top 88% of the texture.
    u = np.linspace(0, 1, loop + 1)
    v = np.linspace(1, 0.12, ROWS)
    uv = np.stack(np.meshgrid(u, v), axis=-1)

    faces = []
    for i in range(ROWS - 1):
        for j in range(loop):
            a = i * (loop + 1) + j
            b = a + 1
            c2 = a + loop + 1
            d2 = c2 + 1
            faces += [[a, c2, b], [b, c2, d2]]
    positions = verts.reshape(-1, 3)
    uvs = uv.reshape(-1, 2)

    # Caps: the base and the top edge, each a fan, with its own small patch
    # of the atlas.
    def cap(ring: np.ndarray, corner: float) -> None:
        nonlocal positions, uvs
        start = len(positions)
        centre = ring.mean(0)
        flat = ring[:, [0, 2]]
        lo, hi = flat.min(0), flat.max(0)
        cap_uv = corner + 0.1 * (flat - lo) / np.maximum(hi - lo, 1e-9)
        positions = np.vstack([positions, centre, ring])
        uvs = np.vstack([uvs, cap_uv.mean(0), cap_uv])
        n = len(ring)
        for j in range(n):
            faces.append([start, start + 1 + j, start + 1 + (j + 1) % n])

    cap(verts[-1, :loop], 0.0)
    cap(verts[0, :loop], 0.5)

    mesh = trimesh.Trimesh(positions, np.array(faces), process=False)
    # Face outward: the front's normals must point at the camera.
    front_face = mesh.face_normals[: 2 * COLS].mean(0)
    if front_face @ (eye - positions[: COLS].mean(0)) < 0:
        mesh.faces = mesh.faces[:, ::-1]
    # Caps were wound independently; point each away from the middle.
    centre = positions.mean(0)
    flip = np.einsum("ij,ij->i", mesh.face_normals, mesh.triangles_center - centre) < 0
    mesh.faces[flip] = mesh.faces[flip][:, ::-1]

    mesh.visual = trimesh.visual.TextureVisuals(
        uv=uvs,
        material=trimesh.visual.material.PBRMaterial(
            baseColorTexture=Image.new("RGB", (ATLAS, ATLAS), (200, 200, 200)),
            metallicFactor=0.0,
            roughnessFactor=0.5,
        ),
    )
    return mesh


def estimate_depth(shape: trimesh.Trimesh, camera: Camera) -> float:
    """The shape model's base depth as a fraction of its width: the extent
    along the camera's view axis over the bottom tenth of the object."""
    r, _ = camera.world_to_camera()
    right, down, forward = r
    v = np.asarray(shape.vertices)
    height = v @ -down
    low = height < height.min() + 0.1 * np.ptp(height)
    return float(np.ptp(v[low] @ forward) / np.ptp(v @ right))


def fit_pouch(
    prepared: Image.Image,
    camera: Camera,
    depth: float,
    extras: list[Image.Image],
    seal: float = 0.15,
) -> tuple[trimesh.Trimesh, float, float, list[Camera | None], dict]:
    """Refine depth and seal height against extra photos. Returns the mesh,
    the chosen depth and seal, and a camera per extra photo (None where the
    photo shared too little print to place).

    Each extra photo's camera comes from print matched against the primary
    photo (match.py): the front panel's points are known in 3D for any
    candidate shape, so the camera follows by solving perspective-n-point.
    Matched points on a near-flat front can't tell a wide lens at a steep
    angle from a long lens head-on, so the lens is searched along with the
    two numbers the front can't see, the base depth and the seal height.
    Each combination is scored by how well the outline then matches the
    photo, less a small penalty for reprojecting the print badly. Extra
    photos with too little shared print are skipped."""
    from .align import iou
    from .match import match, reliable, solve_with
    from .raster import silhouette

    if not extras:
        return pouch(prepared, camera, depth, seal), depth, seal, [], {}

    matches = [match(prepared, image) for image in extras]
    usable = [i for i, (a, _) in enumerate(matches) if len(a) >= 12]
    stats = {"matches": [len(a) for a, _ in matches]}
    if not usable:
        return pouch(prepared, camera, depth, seal), depth, seal, [None] * len(extras), stats

    start = PouchFrame(prepared, camera, depth, seal)
    kept = {}
    for i in usable:
        a, b = matches[i]
        idx = reliable(start.front(a[:, 0], a[:, 1]), b, extras[i].width)
        kept[i] = (a[idx], b[idx])
    targets = {i: np.asarray(extras[i].getchannel("A")) > 127 for i in usable}

    best = None
    for d in np.arange(0.15, 0.65, 0.05):
        for s in (0.1, 0.15, 0.2, 0.25):
            frame = PouchFrame(prepared, camera, d, s)
            mesh = pouch(prepared, camera, d, s)
            verts, faces = np.asarray(mesh.vertices), np.asarray(mesh.faces)
            score, cams, fits, errors = 0.0, [], [], []
            for i in usable:
                a, b = kept[i]
                points = frame.front(a[:, 0], a[:, 1])
                options = []
                for fov in (15, 20, 25, 30, 35, 40, 50):
                    cam, error = solve_with(points, b, extras[i].width, fov)
                    fit = iou(silhouette(cam.project(verts)[0], faces, cam.size), targets[i])
                    options.append((fit - REPROJECTION_PENALTY * error, fit, cam, error))
                value, fit, cam, error = max(options, key=lambda o: o[0])
                score += value
                cams.append(cam)
                fits.append(fit)
                errors.append(error)
            if best is None or score > best[0]:
                best = (score, d, s, cams, fits, errors)
    _, d, s, found, fits, errors = best
    cams: list[Camera | None] = [None] * len(extras)
    for i, cam in zip(usable, found):
        cams[i] = cam
    stats.update(
        silhouette_iou=[round(f, 4) for f in fits],
        reprojection_px=[round(e, 2) for e in errors],
        field_of_view=[c.fovy for c in found],
    )
    return pouch(prepared, camera, d, s), float(d), float(s), cams, stats
