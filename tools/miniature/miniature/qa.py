"""Stage 6: prove the packaged model reproduces the photo before it ships.

The model as the site will load it (simplified, textures recompressed) is
rendered from the photo's own camera and compared with the photo three ways.
Every check must pass:

- silhouette: the shape's outline overlaps the photo's (from stage 3);
- pixels: the colours on the object match, on average, within a few levels;
- text: macOS's Vision text recogniser reads the same words off the render
  as off the photo. This is the check that matters most for packaging, and
  the one a generated texture fails;
- shading: every part carries normals, and under a raking light the surface
  shades smoothly, without facets or lumps, which an unlit comparison
  can't see.
"""
from __future__ import annotations

import json
import re
import struct
import tempfile
from collections import Counter
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image

from .camera import Camera
from .fill import box_blur
from .render import render, shading

MIN_IOU = 0.97
MAX_PIXEL_ERROR = 6.0  # mean absolute error on object pixels, out of 255, after PIXEL_BLUR
PIXEL_BLUR = 2  # px
MIN_TEXT_RECALL = 0.95  # share of the photo's words found on the render
# Shading roughness on the Bigface pouch: shaded flat 0.020, the shape
# model's raw lumpy surface 0.0065, after smoothing 0.0008.
MAX_SHADING_ROUGHNESS = 0.003


def words(image: Image.Image) -> Counter:
    from ocrmac import ocrmac

    with tempfile.NamedTemporaryFile(suffix=".png") as f:
        image.convert("RGB").save(f.name)
        found = ocrmac.OCR(f.name, recognition_level="accurate").recognize()
    tokens = []
    for text, _, _ in found:
        tokens += [re.sub(r"[^A-Z0-9]", "", w.upper()) for w in text.split()]
    return Counter(t for t in tokens if t)


def glb_primitives_missing_normals(path: Path) -> int:
    """How many primitives in a GLB have no NORMAL attribute. Viewers shade
    those flat, one visible facet per triangle."""
    data = path.read_bytes()
    length = struct.unpack("<I", data[12:16])[0]
    gltf = json.loads(data[20 : 20 + length])
    return sum("NORMAL" not in p["attributes"] for m in gltf["meshes"] for p in m["primitives"])


def shading_roughness(scene: trimesh.Scene, camera: Camera, shade_out: np.ndarray | None = None) -> float:
    """Fine-scale brightness variation under a raking light: the RMS of the
    shading minus a blurred copy of itself, measured away from the
    silhouette. Facets (missing or broken normals) and lumps (the shape
    model's surface noise, or print it embossed into the geometry) both
    raise it; a clean surface leaves only gentle, broad shading."""
    r, _ = camera.world_to_camera()
    right, down, forward = r
    light = -forward - 0.6 * right - 0.6 * down  # from the upper left, toward the object
    shade, face = shading(scene, camera, light)
    if shade_out is not None:
        shade_out[...] = shade
    inside = box_blur((face >= 0).astype(np.float64), 10) > 0.999
    return float(np.sqrt(((shade - box_blur(shade, 6))[inside] ** 2).mean()))


def check(
    scene: trimesh.Scene,
    prepared: Image.Image,
    camera: Camera,
    iou: float,
    shipped: Path,
    texture: Image.Image | None = None,
) -> tuple[dict, Image.Image, Image.Image]:
    """texture: the sharper copy of the photo shipped as the front's texture
    (--texture). The words expected on the render are read from it rather
    than from the photo: at the photo's size OCR misreads a letter here and
    there ("250Q"), and the render would be marked wrong for showing the
    right one."""
    view, _ = render(scene, camera)
    rgba = np.asarray(prepared.convert("RGBA")).astype(np.float64)
    obj = rgba[..., 3] > 250
    # Compared at the scale people see: a slight blur on both drops the
    # resampling and compression noise that fine texture (denim, grain) turns
    # into large per-pixel differences, while misplaced or wrong colours
    # still show. Sharpness is the text check's job.
    blurred = lambda a: np.stack([box_blur(a[..., c], PIXEL_BLUR) for c in range(3)], axis=-1)
    error = float(np.abs(blurred(rgba[..., :3]) - blurred(np.asarray(view, dtype=np.float64)))[obj].mean())

    # Compare text on white, the way the photo would be printed.
    source = np.asarray((texture or prepared).convert("RGBA")).astype(np.float64)
    photo = Image.fromarray(
        (source[..., :3] * (source[..., 3:] / 255) + 255 * (1 - source[..., 3:] / 255)).astype(np.uint8)
    )
    expected = words(photo)
    found = words(view)
    matched = sum((expected & found).values())
    # No readable text in the photo means nothing to check, not a failure.
    recall = matched / sum(expected.values()) if expected else 1.0

    # Lit: catch what an unlit comparison can't, like missing or broken
    # normals, and keep a lit preview for a human to look at.
    shade = np.zeros((camera.size, camera.size))
    roughness = shading_roughness(scene, camera, shade)
    missing_normals = glb_primitives_missing_normals(shipped)
    lit = np.asarray(view, dtype=np.float64) * (0.3 + 0.7 * shade[..., None])
    lit[shade == 0] = 255
    lit_view = Image.fromarray(np.clip(lit, 0, 255).astype(np.uint8))

    result = {
        "silhouette_iou": round(iou, 4),
        "pixel_error": round(error, 2),
        "text_recall": round(recall, 3),
        "text_words": sum(expected.values()),
        "text_missing": sorted((expected - found).elements()),
        "text_extra": sorted((found - expected).elements()),
        "shading_roughness": round(roughness, 4),
        "primitives_missing_normals": missing_normals,
    }
    result["passed"] = bool(
        iou >= MIN_IOU
        and error <= MAX_PIXEL_ERROR
        and recall >= MIN_TEXT_RECALL
        and roughness <= MAX_SHADING_ROUGHNESS
        and missing_normals == 0
    )
    return result, view, lit_view


def load_for_check(path: Path, placement: np.ndarray) -> trimesh.Scene:
    """Load a packaged GLB and undo its placement, so it lines up with the
    camera found in stage 3 again."""
    # process=False keeps the vertices and normals exactly as stored.
    scene = trimesh.load(path, process=False)
    undo = np.linalg.inv(placement)
    out = trimesh.Scene()
    for i, g in enumerate(scene.dump()):
        g = g.copy()
        g.apply_transform(undo)
        out.add_geometry(g, geom_name=f"part{i}")
    return out
