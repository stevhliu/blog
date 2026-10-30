"""Stage 3: find the camera that took the photo, relative to the mesh.

Stable Fast 3D builds the mesh as seen from a fixed camera, so the search
starts there and only has to absorb the small differences between where the
model put the object and where the photo has it. It scores a camera by how
well the mesh's silhouette overlaps the photo's cut-out (intersection over
union, 1.0 is a perfect match) and refines with Nelder-Mead.
"""
from __future__ import annotations

from dataclasses import replace

import numpy as np
import trimesh
from PIL import Image
from scipy.optimize import minimize

from .camera import Camera
from .raster import silhouette

SEARCH_SIZE = 256  # silhouettes are compared at this resolution


def iou(a: np.ndarray, b: np.ndarray) -> float:
    union = np.logical_or(a, b).sum()
    return float(np.logical_and(a, b).sum() / union) if union else 0.0


def _target(prepared: Image.Image, size: int = SEARCH_SIZE) -> np.ndarray:
    return np.asarray(prepared.getchannel("A").resize((size, size), Image.BILINEAR)) > 127


def _camera(params: np.ndarray, size: int = SEARCH_SIZE) -> Camera:
    yaw, pitch, roll, distance, sx, sy = params
    return Camera(size, distance=distance, yaw=yaw, pitch=pitch, roll=roll, shift_x=sx, shift_y=sy)


def _refine(mesh: trimesh.Trimesh, target: np.ndarray, start: np.ndarray) -> tuple[np.ndarray, float]:
    verts = np.asarray(mesh.vertices)
    faces = np.asarray(mesh.faces)

    def loss(params: np.ndarray) -> float:
        px, _ = _camera(params).project(verts)
        return 1 - iou(silhouette(px, faces, SEARCH_SIZE), target)

    # Step sizes: a few degrees, a tenth of the distance, a few percent shift.
    simplex = [start] + [start + np.eye(6)[i] * s for i, s in enumerate([6, 6, 3, 0.16, 0.03, 0.03])]
    result = minimize(
        loss,
        start,
        method="Nelder-Mead",
        options={"initial_simplex": np.array(simplex), "xatol": 1e-3, "fatol": 1e-4, "maxiter": 400},
    )
    return result.x, 1 - result.fun


def fit_camera(mesh: trimesh.Trimesh, prepared: Image.Image) -> tuple[Camera, float]:
    """The primary photo's camera: the shape model built the mesh as seen
    from its own fixed camera, so the search only refines from there."""
    params, score = _refine(mesh, _target(prepared), np.array([0.0, 0.0, 0.0, 1.6, 0.0, 0.0]))
    return replace(_camera(params), size=prepared.width), score


def fit_view(
    mesh: trimesh.Trimesh, prepared: Image.Image, reference: trimesh.Scene | None = None
) -> tuple[Camera, float]:
    """The camera of an extra photo, taken from anywhere in front of the
    object (turned up to 90° either way, tilted up to 40°).

    A coarse sweep scores every turn and tilt, scaling and shifting the
    silhouette onto the photo's bounding box; the best few are refined.
    Outlines alone can't tell a symmetric object's left from its right, so
    when a reference (the model already textured from the primary photo) is
    given, the finalist whose render looks most like the photo wins."""
    target = _target(prepared)
    verts = np.asarray(mesh.vertices)
    faces = np.asarray(mesh.faces)
    ty, tx = np.nonzero(target)
    t_box = np.array([tx.min(), ty.min(), tx.max(), ty.max()], dtype=float)

    candidates = []
    for yaw in range(-90, 91, 10):
        for pitch in range(-40, 41, 10):
            params = np.array([yaw, pitch, 0.0, 1.6, 0.0, 0.0])
            px, _ = _camera(params).project(verts)
            lo, hi = px.min(0), px.max(0)
            # Match the bounding box: scale via distance, centre via shift.
            scale = max((t_box[2] - t_box[0]) / (hi[0] - lo[0]), (t_box[3] - t_box[1]) / (hi[1] - lo[1]))
            params[3] = 1.6 / scale
            px, _ = _camera(params).project(verts)
            lo, hi = px.min(0), px.max(0)
            params[4] = ((t_box[0] + t_box[2]) - (lo[0] + hi[0])) / 2 / SEARCH_SIZE
            params[5] = ((t_box[1] + t_box[3]) - (lo[1] + hi[1])) / 2 / SEARCH_SIZE
            px, _ = _camera(params).project(verts)
            candidates.append((iou(silhouette(px, faces, SEARCH_SIZE), target), params))
    candidates.sort(key=lambda c: -c[0])
    finalists = [_refine(mesh, target, params) for _, params in candidates[:4]]

    if reference is None:
        params, score = max(finalists, key=lambda f: f[1])
        return replace(_camera(params), size=prepared.width), score

    from .render import render

    photo = np.asarray(prepared.convert("RGB").resize((SEARCH_SIZE, SEARCH_SIZE)), dtype=np.float64).mean(2)

    def likeness(params: np.ndarray) -> float:
        view, covered = render(reference, _camera(params))
        both = covered & target
        a, b = np.asarray(view, dtype=np.float64).mean(2)[both], photo[both]
        return float(np.corrcoef(a, b)[0, 1]) if both.sum() > 100 else -1.0

    # Only finalists whose outline fits nearly as well as the best compete.
    best_fit = max(f[1] for f in finalists)
    close = [f for f in finalists if f[1] >= best_fit - 0.02]
    params, score = max(close, key=lambda f: likeness(f[0]))
    return replace(_camera(params), size=prepared.width), score
