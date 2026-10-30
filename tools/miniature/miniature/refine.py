"""Shape clean-up between the shape model and the projection.

- smooth(): the shape model leaves small lumps on surfaces that should be
  flat, which wobble reflections. Taubin smoothing removes them without
  shrinking the object.
- snap_to_outline(): the mesh's silhouette never quite matches the photo's,
  so a thin rim of mesh catches background (or misses the object's edge).
  The silhouette is pulled onto the photo's outline.

Both work on the welded surface. The shape model splits vertices along its
texture seams (same position, different UVs); moving those copies apart
would tear the surface open, so each operation runs on one vertex per
position and copies the result back to every duplicate.
"""
from __future__ import annotations

import numpy as np
import trimesh
from PIL import Image

from .camera import Camera

SMOOTH_ITERATIONS = 20
SNAP_FALLOFF = 6  # rings of neighbours a silhouette correction spreads over


def weld(mesh: trimesh.Trimesh) -> tuple[trimesh.Trimesh, np.ndarray]:
    """One vertex per position. Returns the welded mesh and, for every
    original vertex, the index of its welded vertex."""
    key = np.round(np.asarray(mesh.vertices), 6)
    _, first, inverse = np.unique(key, axis=0, return_index=True, return_inverse=True)
    inverse = inverse.reshape(-1)
    welded = trimesh.Trimesh(mesh.vertices[first], inverse[mesh.faces], process=False)
    return welded, inverse


def with_positions(mesh: trimesh.Trimesh, welded: trimesh.Trimesh, inverse: np.ndarray) -> trimesh.Trimesh:
    """The original mesh (same vertex order, UVs and texture) moved to the
    welded mesh's positions, with smooth normals computed across seams."""
    out = mesh.copy()
    out.vertices = welded.vertices[inverse]
    out.vertex_normals = welded.vertex_normals[inverse]
    return out


def smooth(mesh: trimesh.Trimesh, iterations: int = SMOOTH_ITERATIONS) -> trimesh.Trimesh:
    welded, inverse = weld(mesh)
    trimesh.smoothing.filter_taubin(welded, lamb=0.5, nu=-0.53, iterations=iterations)
    return with_positions(mesh, welded, inverse)


def snap_to_outline(
    mesh: trimesh.Trimesh,
    prepared: Image.Image,
    camera: Camera,
    max_shift: float = 0.03,
    falloff: int = SNAP_FALLOFF,
    protect: tuple[Image.Image, Camera] | None = None,
) -> tuple[trimesh.Trimesh, int]:
    """Pull the mesh's outline (as the camera sees it) onto the photo's.

    Vertices on the outer edge of the mesh's silhouette move, sideways in
    the image plane at their own depth, to the nearest point on the photo's
    outline. Their neighbours follow with a falloff over `falloff` rings, so
    the edge moves without creasing the surface. Corrections bigger than
    max_shift (a fraction of the image) are left alone: past that the shapes
    disagree, which snapping shouldn't paper over. With `protect` (the primary
    photo and its camera), vertices that photo controls stay put: those
    facing its camera and those on its outline. Returns the moved mesh and
    how many outline vertices were snapped."""
    from scipy import ndimage, sparse

    from .raster import silhouette

    welded, inverse = weld(mesh)
    verts = np.asarray(welded.vertices)
    size = camera.size
    px, depth = camera.project(verts)

    target = np.asarray(prepared.getchannel("A")) > 127
    ours = silhouette(px, np.asarray(welded.faces), size)

    def outline(mask: np.ndarray) -> np.ndarray:
        return mask & ~ndimage.binary_erosion(mask)

    # For every pixel, the nearest pixel on the photo's outline.
    _, nearest = ndimage.distance_transform_edt(~outline(target), return_indices=True)
    # Outline vertices: those within a pixel of our silhouette's outer edge.
    near_edge = ndimage.binary_dilation(outline(ours), iterations=1)
    ix = np.clip(np.round(px - 0.5).astype(int), 0, size - 1)
    on_edge = near_edge[ix[:, 1], ix[:, 0]]

    to_y = nearest[0][ix[:, 1], ix[:, 0]] + 0.5
    to_x = nearest[1][ix[:, 1], ix[:, 0]] + 0.5
    shift_px = np.stack([to_x - px[:, 0], to_y - px[:, 1]], axis=1)
    on_edge &= np.linalg.norm(shift_px, axis=1) < max_shift * size

    r, _ = camera.world_to_camera()
    right, down = r[0], r[1]
    world = (shift_px[:, :1] * right + shift_px[:, 1:] * down) * (depth / camera.focal)[:, None]

    frozen = np.zeros(len(verts), dtype=bool)
    if protect is not None:
        p_image, p_camera = protect
        p_px, _ = p_camera.project(verts)
        p_ours = silhouette(p_px, np.asarray(welded.faces), p_camera.size)
        p_edge = ndimage.binary_dilation(outline(p_ours), iterations=3)
        p_ix = np.clip(np.round(p_px - 0.5).astype(int), 0, p_camera.size - 1)
        facing = np.einsum("ij,ij->i", welded.vertex_normals, p_camera.view_dirs(verts)) > 0.3
        frozen = facing | p_edge[p_ix[:, 1], p_ix[:, 0]]
        on_edge &= ~frozen

    # Spread each correction to its neighbours, fading ring by ring.
    edges = welded.edges_unique
    n = len(verts)
    adjacency = sparse.coo_matrix((np.ones(len(edges) * 2), (edges.ravel(), edges[:, ::-1].ravel())), (n, n)).tocsr()
    degree = np.asarray(adjacency.sum(1)).ravel()
    moved = np.where(on_edge[:, None], world, 0.0)
    for _ in range(falloff):
        spread = (adjacency @ moved) / np.maximum(degree, 1)[:, None]
        moved = np.where(on_edge[:, None], world, spread * 0.85)
        moved[frozen] = 0
    welded.vertices = verts + moved
    return with_positions(mesh, welded, inverse), int(on_edge.sum())


def fit_outlines(
    mesh: trimesh.Trimesh,
    primary: tuple[Image.Image, Camera],
    extra: list[tuple[Image.Image, Camera]],
    rounds: int = 3,
    extra_falloff: int = 12,
) -> tuple[trimesh.Trimesh, list[Camera]]:
    """Snap the mesh's outline to every photo's, the primary photo last.

    Extra photos usually disagree with the shape model by more than the
    primary does (it built the mesh from the primary), so they get larger
    corrections spread over more rings, but only where the primary has no
    say: they never move what faces the primary camera or sits on its
    outline, so the two can't pull the same edge in different directions
    and crumple it. Each round refits their cameras to
    the corrected mesh first, so the snapping doesn't chase camera error.
    The primary carries the text, so it gets the final word."""
    from dataclasses import replace

    from .align import _camera, _refine, _target

    image, camera = primary
    mesh, _ = snap_to_outline(mesh, image, camera)
    cameras = [c for _, c in extra]
    for _ in range(rounds if extra else 0):
        for i, (extra_image, _) in enumerate(extra):
            c = cameras[i]
            start = np.array([c.yaw, c.pitch, c.roll, c.distance, c.shift_x, c.shift_y])
            params, _ = _refine(mesh, _target(extra_image), start)
            cameras[i] = replace(_camera(params), size=extra_image.width)
            mesh, _ = snap_to_outline(
                mesh, extra_image, cameras[i], max_shift=0.06, falloff=extra_falloff, protect=primary
            )
        mesh, _ = snap_to_outline(mesh, image, camera, max_shift=0.06)
    if extra:
        mesh, _ = snap_to_outline(mesh, image, camera, max_shift=0.06)
    return mesh, cameras
