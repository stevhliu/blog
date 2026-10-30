"""Stage 4: put the photo's own pixels on every surface the camera saw.

The mesh is split in two:

- Faces the camera saw clearly (unoccluded, and facing it within FRONT_ANGLE)
  get their own material whose texture IS the prepared photo. Their UVs are
  simply where each vertex lands in the photo, so nothing is resampled and
  text keeps the photo's full resolution.
- Every other face keeps the shape model's texture atlas. Texels the camera
  saw at a glancing angle are blended toward the photo, fading out by
  FADE_ANGLE, so the seam between the two materials has no colour step.
  Texels the camera never saw take the front's material without its print
  (see back.py), or the shape model's own guess with unseen="model".
"""
from __future__ import annotations

import numpy as np
import trimesh
from PIL import Image

from .back import INTERIOR_BLUR, TEXTURED_SHARE, blank, print_share
from .camera import Camera
from .fill import box_blur, push_pull
from .raster import rasterize

FRONT_ANGLE = 70.0  # degrees from head-on; steeper faces would smear the photo
FADE_ANGLE = 84.0  # photo blends into the atlas up to this angle
DEPTH_TOLERANCE = 0.004  # fraction of camera distance; absorbs rasterizer error
# Extra photos count for less than the primary where both saw a texel, since
# their colours are only matched to it, not taken from it.
EXTRA_WEIGHT = 0.9


def smoothstep(a: float, b: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def bleed(rgba: np.ndarray) -> np.ndarray:
    """Extend the object's colours outward over the transparent background,
    so texture filtering at the silhouette never pulls in background.
    Returns RGB."""
    return push_pull(rgba[..., :3].astype(np.float64), rgba[..., 3] > 127)


def sample(image: np.ndarray, px: np.ndarray) -> np.ndarray:
    """Bilinear lookup of image (H, W, C) at pixel coordinates (N, 2)."""
    h, w = image.shape[:2]
    x = np.clip(px[:, 0] - 0.5, 0, w - 1.001)
    y = np.clip(px[:, 1] - 0.5, 0, h - 1.001)
    x0, y0 = x.astype(int), y.astype(int)
    fx, fy = (x - x0)[:, None], (y - y0)[:, None]
    return (
        image[y0, x0] * (1 - fx) * (1 - fy)
        + image[y0, x0 + 1] * fx * (1 - fy)
        + image[y0 + 1, x0] * (1 - fx) * fy
        + image[y0 + 1, x0 + 1] * fx * fy
    )


class View:
    """One photo and its camera, with what that camera can see of the mesh:
    a depth buffer at the photo's resolution, for occlusion tests."""

    def __init__(self, prepared: Image.Image, camera: Camera, verts: np.ndarray, faces: np.ndarray):
        self.rgba = np.asarray(prepared.convert("RGBA"))
        self.photo = bleed(self.rgba)
        self.alpha = self.rgba[..., 3] / 255.0
        self.camera = camera
        px, depth = camera.project(verts)
        self.frags = rasterize(px, depth, faces, camera.size)
        self.tolerance = DEPTH_TOLERANCE * camera.distance

    def visible(self, points: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Which points this camera saw unoccluded, on the object, and where
        they land in the photo."""
        size = self.camera.size
        px, depth = self.camera.project(points)
        inside = (px >= 0).all(1) & (px < size).all(1)
        ix = np.clip(px.astype(int), 0, size - 1)
        seen = depth <= self.frags.depth[ix[:, 1], ix[:, 0]] + self.tolerance
        return inside & seen & (self.alpha[ix[:, 1], ix[:, 0]] > 0.5), px

    def weight(self, points: np.ndarray, normals: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """How much to trust this photo at each point: 1 when seen head-on,
        fading to 0 by FADE_ANGLE, 0 where unseen. Plus the photo pixels."""
        seen, px = self.visible(points)
        cos = np.einsum("ij,ij->i", normals, self.camera.view_dirs(points))
        return seen * smoothstep(np.cos(np.radians(FADE_ANGLE)), np.cos(np.radians(FRONT_ANGLE)), cos), px


def harmonize(source: np.ndarray, reference: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Per-channel gain and offset that map source colours onto reference
    colours, fitted on pixels both photos saw. Photos taken under different
    light disagree on the same surface; without this, each photo's region
    would show as a patch of different brightness. The middle 80% of the
    residuals are kept, so reflections only one photo caught don't skew it."""
    gain, offset = np.ones(3), np.zeros(3)
    for c in range(3):
        x, y = source[:, c], reference[:, c]
        for _ in range(2):
            g, o = np.polyfit(x, y, 1)
            residual = np.abs(y - (g * x + o))
            keep = residual <= np.quantile(residual, 0.8)
            x, y = x[keep], y[keep]
        gain[c], offset[c] = np.clip(g, 0.4, 2.5), o
    return gain, offset


def project(
    mesh: trimesh.Trimesh,
    prepared: Image.Image,
    camera: Camera,
    unseen: str = "auto",
    extra: list[tuple[Image.Image, Camera]] = (),
    back: tuple[Image.Image, np.ndarray] | None = None,
) -> tuple[trimesh.Scene, dict]:
    """back: a photo of the back panel and every vertex's UV in it
    (panel.py). Faces turned away from the camera then take that photo as
    their texture, the way front faces take the primary photo."""
    verts = np.asarray(mesh.vertices)
    faces = np.asarray(mesh.faces)
    primary = View(prepared, camera, verts, faces)
    rgba, photo, size = primary.rgba, primary.photo, camera.size
    px, _ = camera.project(verts)

    # Front faces: all three corners seen, and facing the camera.
    vert_seen, _ = primary.visible(verts)
    centroids = verts[faces].mean(1)
    facing = np.einsum("ij,ij->i", mesh.face_normals, camera.view_dirs(centroids))
    front = vert_seen[faces].all(1) & (facing > np.cos(np.radians(FRONT_ANGLE)))
    behind = np.zeros(len(faces), bool)
    if back is not None:
        behind = facing < -np.cos(np.radians(FRONT_ANGLE))

    # Every texel of the atlas, as a point on the surface.
    atlas = np.asarray(mesh.visual.material.baseColorTexture.convert("RGB")).astype(np.float64)
    t = atlas.shape[0]
    uv = np.asarray(mesh.visual.uv)
    uv_px = np.stack([uv[:, 0] * t, (1 - uv[:, 1]) * t], axis=1)  # trimesh v points up
    texels = rasterize(uv_px, np.ones(len(uv_px)), faces, t)
    covered = texels.face >= 0
    tf = texels.face[covered]
    b = texels.bary[covered]
    pos = (verts[faces[tf]] * b[..., None]).sum(1)
    normal = mesh.face_normals[tf]

    weight, tpx = primary.weight(pos, normal)
    primary_rgb = sample(photo, tpx)
    # What the camera didn't see: by default the photo's own material with the
    # print removed (back.py), mapped on triplanar-style. Each texel samples
    # the blank photo from three directions, weighted by how much its normal
    # points along each of the camera's axes:
    #   along the view axis (backs): mirrored through the object's middle;
    #   along image-right (sides): turned 90° about the vertical axis;
    #   along image-down (top, base): turned 90° about the horizontal axis.
    # Each turn lands the texel on the front, where the photo has material at
    # the same scale. The blank photo is bled past the silhouette, so texels
    # that land just off the object still get the nearest material.
    # With unseen="model" they keep the shape model's own guess instead, and
    # "auto" picks: blank for packaging, the model's guess when most of the
    # surface is fine texture rather than print (see back.TEXTURED_SHARE).
    if unseen == "auto":
        unseen = "model" if print_share(rgba) > TEXTURED_SHARE else "blank"
    if unseen == "blank":
        r, _ = camera.world_to_camera()
        right, down, forward = r
        centre = verts.mean(0)
        rel = pos - centre

        def turned(into: np.ndarray) -> np.ndarray:
            # Turn a side (or top) quarter round onto the front: the texel's
            # depth becomes its offset along `into`, and it lands on the
            # object's mid-plane so perspective doesn't rescale it.
            along = rel @ into
            depth = rel @ forward
            return centre + rel + (depth - along)[:, None] * into - depth[:, None] * forward

        mirrored = pos - 2 * (rel @ forward)[:, None] * forward
        plain = blank(rgba)
        # Sides land on the front's outline band, which blank() keeps sharp
        # for the seals there. A seal's crimp is fine ridges across it, and
        # stretched over a whole gusset they read as streaks, so the sides
        # sample a copy with the band smoothed like the interior.
        ys, xs = np.nonzero(rgba[..., 3] > 127)
        radius = max(1, int(INTERIOR_BLUR * max(np.ptp(xs), np.ptp(ys))))
        smooth = np.stack([box_blur(plain[..., c], radius) for c in range(3)], axis=-1)
        sources = [plain, smooth, plain]
        views = [mirrored, turned(right), turned(down)]
        axis_weights = np.stack([(normal @ a) ** 2 for a in (forward, right, down)], axis=1) + 1e-9
        base = sum(
            sample(src, camera.project(p)[0]) * axis_weights[:, i : i + 1]
            for i, (src, p) in enumerate(zip(sources, views))
        )
        base /= axis_weights.sum(1, keepdims=True)
    else:
        base = atlas[covered]

    # Extra photos fill what the primary saw poorly or not at all (a side, a
    # back). Their colours are matched to the primary's first, on texels both
    # saw well, and the primary still wins wherever it saw clearly.
    total = weight.copy()
    mixed = primary_rgb * weight[:, None]
    extra_texels = 0
    for extra_prepared, extra_camera in extra:
        view = View(extra_prepared, extra_camera, verts, faces)
        w, epx = view.weight(pos, normal)
        rgb = sample(view.photo, epx)
        both = (weight > 0.6) & (w > 0.6)
        if both.sum() > 500:
            gain, offset = harmonize(rgb[both], primary_rgb[both])
            rgb = np.clip(rgb * gain + offset, 0, 255)
        w = w * EXTRA_WEIGHT * (1 - weight)
        total += w
        mixed += rgb * w[:, None]
        extra_texels += int((w > 0.05).sum())
    seen_rgb = mixed / np.maximum(total, 1e-9)[:, None]
    coverage = np.clip(total, 0, 1)[:, None]

    blended = atlas.copy()
    blended[covered] = np.nan_to_num(base) * (1 - coverage) + seen_rgb * coverage
    # The atlas has gaps between its charts. Fill them from the charts' own
    # edges, or texture filtering at a chart's border pulls in whatever the
    # gap held and draws a dark seam.
    blended = push_pull(blended, covered)

    material = mesh.visual.material
    # Smooth normals from the whole mesh, carried into both parts. Splitting
    # first and letting each part work out its own would bend the normals
    # along the cut, and a GLB without normals is shaded flat, one facet per
    # triangle.
    normals = np.asarray(mesh.vertex_normals)

    def part(face_ids: np.ndarray, uv: np.ndarray, name: str, texture: np.ndarray) -> trimesh.Trimesh:
        used, inverse = np.unique(faces[face_ids], return_inverse=True)
        piece = trimesh.Trimesh(
            verts[used], inverse.reshape(-1, 3), vertex_normals=normals[used], process=False
        )
        piece.visual = trimesh.visual.TextureVisuals(
            uv=uv[used],
            material=trimesh.visual.material.PBRMaterial(
                name=name,
                baseColorTexture=Image.fromarray(texture.astype(np.uint8)),
                metallicFactor=material.metallicFactor,
                roughnessFactor=material.roughnessFactor,
            ),
        )
        return piece

    photo_uv = np.stack([px[:, 0] / size, 1 - px[:, 1] / size], axis=1)  # trimesh v points up
    scene = trimesh.Scene()
    scene.add_geometry(part(np.nonzero(front)[0], photo_uv, "photo", photo), geom_name="photo")
    if back is not None:
        back_photo, back_uv = back
        rgb = bleed(np.asarray(back_photo.convert("RGBA")))
        scene.add_geometry(part(np.nonzero(behind)[0], back_uv, "back", rgb), geom_name="back")
    scene.add_geometry(part(np.nonzero(~front & ~behind)[0], uv, "atlas", blended), geom_name="atlas")

    stats = {
        "front_faces": int(front.sum()),
        "back_faces": int(behind.sum()),
        "rest_faces": int((~front & ~behind).sum()),
        "atlas_texels_blended": int((weight > 0).sum()),
        "atlas_texels_from_extra_photos": extra_texels,
        "unseen": unseen,
    }
    return scene, stats
