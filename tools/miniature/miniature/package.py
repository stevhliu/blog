"""Stage 5: turn the working model into what the site loads.

- Turn it to face +z (model-viewer's default view) and stand it on the
  ground at the origin.
- Crop the photo texture to the part the model uses and store both textures
  as JPEG; the projected photo is opaque, so nothing needs PNG.
- Simplify each part with gltfpack (the printed front much less than the
  rest), keeping a plain (unquantized) copy that the quality check can
  load, then quantize it for the site with
  KHR_mesh_quantization, which three.js and so model-viewer read natively,
  with no decoder to download.
- Write the poster model-viewer shows until the model loads.
"""
from __future__ import annotations

import io
import json
import subprocess
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image

GLTFPACK = ["npx", "--yes", "gltfpack@1.3.0"]
# Fraction of triangles kept per part. The printed front carries the text and
# catches the light, so it keeps the most; the unseen parts carry plain film.
SIMPLIFY = {"photo": 0.75, "back": 0.5, "atlas": 0.3}
TEXTURE_MARGIN = 8  # px kept round the cropped photo texture
PHOTO_QUALITY = 86
# Longest side of a photo texture. The model shows at 300px, 600 on a 2x
# screen, but readers zoom in: 2048 keeps the print sharp to about 3x zoom
# on a 2x screen, where 1280 went soft past 2x. The back carries only a
# logo, so it gets less.
MAX_PHOTO_TEXTURE = {"photo": 2048, "back": 1536}
ATLAS_QUALITY = 82
POSTER_WIDTH = 600  # twice the 300px it's shown at


def jpeg(image: Image.Image, quality: int) -> Image.Image:
    """Re-open an image as an in-memory JPEG, so the GLB embeds JPEG bytes."""
    buf = io.BytesIO()
    image.convert("RGB").save(buf, "JPEG", quality=quality, optimize=True)
    buf.seek(0)
    return Image.open(buf)


def crop_photo_texture(mesh: trimesh.Trimesh, limit: int) -> None:
    """Crop a photo part's texture to the UVs it uses, in place."""
    tex = mesh.visual.material.baseColorTexture
    w, h = tex.size
    uv = np.asarray(mesh.visual.uv)
    px = np.stack([uv[:, 0] * w, (1 - uv[:, 1]) * h], axis=1)
    x0, y0 = np.maximum(np.floor(px.min(0)).astype(int) - TEXTURE_MARGIN, 0)
    x1, y1 = np.minimum(np.ceil(px.max(0)).astype(int) + TEXTURE_MARGIN, [w, h])
    cropped = tex.crop((x0, y0, x1, y1))
    cw, ch = cropped.size
    mesh.visual.uv = np.stack([(px[:, 0] - x0) / cw, 1 - (px[:, 1] - y0) / ch], axis=1)
    # UVs are fractions of the crop, so scaling it down needs no UV change.
    scale = min(1.0, limit / max(cw, ch))
    if scale < 1:
        cropped = cropped.resize((round(cw * scale), round(ch * scale)), Image.LANCZOS)
    mesh.visual.material.baseColorTexture = jpeg(cropped, PHOTO_QUALITY)


def place(scene: trimesh.Scene) -> tuple[trimesh.Scene, np.ndarray]:
    """Face the model +z and stand it on the ground, centred. Returns the
    placed scene and the 4x4 transform applied, which the quality check
    inverts to line the model up with the photo's camera again."""
    meshes = {name: g.copy() for name, g in scene.geometry.items()}
    turn = trimesh.transformations.rotation_matrix(np.pi, [0, 1, 0])
    for g in meshes.values():
        g.apply_transform(turn)
    lo = np.min([g.bounds[0] for g in meshes.values()], axis=0)
    hi = np.max([g.bounds[1] for g in meshes.values()], axis=0)
    shift = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
    out = trimesh.Scene()
    for name, g in meshes.items():
        g.apply_translation(shift)
        out.add_geometry(g, geom_name=name)
    return out, trimesh.transformations.translation_matrix(shift) @ turn


def gltfpack(src: Path, dst: Path, *flags: str) -> None:
    subprocess.run([*GLTFPACK, "-i", str(src), "-o", str(dst), *flags], check=True, capture_output=True)


def package(scene: trimesh.Scene, prepared: Image.Image, out: Path, name: str) -> tuple[dict, np.ndarray]:
    web = out / "web"
    web.mkdir(exist_ok=True)

    placed, placement = place(scene)
    for part, limit in MAX_PHOTO_TEXTURE.items():
        if part in placed.geometry:
            crop_photo_texture(placed.geometry[part], limit)
    atlas = placed.geometry["atlas"].visual.material
    atlas.baseColorTexture = jpeg(atlas.baseColorTexture, ATLAS_QUALITY)
    placed.export(out / "placed.glb", include_normals=True)

    # Each part is simplified on its own: the printed front keeps most of its
    # triangles, the unseen surfaces lose most of theirs. The results are
    # unquantized, so the quality check can load exactly this geometry.
    simplified = trimesh.Scene()
    for part, keep in SIMPLIFY.items():
        if part not in placed.geometry:
            continue
        src, dst = out / f"placed-{part}.glb", out / f"simplified-{part}.glb"
        trimesh.Scene({part: placed.geometry[part]}).export(src, include_normals=True)
        # -slb: the parts meet along shared edges, and simplified on their own
        # each would move its side of the edge differently, opening gaps and
        # letting one part's edge poke past another's at the silhouette.
        gltfpack(src, dst, "-si", str(keep), "-slb", "-noq")
        piece = trimesh.load(dst, force="mesh", process=False)
        # Reloading hands back plain images, which trimesh would re-encode as
        # PNG on export; keep them JPEG.
        material = piece.visual.material
        quality = ATLAS_QUALITY if part == "atlas" else PHOTO_QUALITY
        material.baseColorTexture = jpeg(material.baseColorTexture, quality)
        simplified.add_geometry(piece, geom_name=part)
    simplified.export(out / "simplified.glb", include_normals=True)
    # Quantized for the site.
    model = web / f"{name}.glb"
    gltfpack(out / "simplified.glb", model, "-kn")

    alpha = np.asarray(prepared.getchannel("A"))
    ys, xs = np.nonzero(alpha > 8)
    pad = 12
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), xs.max() + pad, ys.max() + pad)
    poster = prepared.crop(box)
    poster = poster.resize((POSTER_WIDTH, round(POSTER_WIDTH * poster.height / poster.width)), Image.LANCZOS)
    poster_path = web / f"{name}-poster.webp"
    poster.save(poster_path, "WEBP", quality=85, method=6)

    simplified = trimesh.load(out / "simplified.glb", process=False)
    manifest = {
        "model": model.name,
        "poster": poster_path.name,
        "bytes": {"model": model.stat().st_size, "poster": poster_path.stat().st_size},
        "triangles": int(sum(len(g.faces) for g in simplified.geometry.values())),
        "size_m": [round(float(v), 4) for v in simplified.extents],
        "credit": "3D shape generated with Stable Fast 3D (Stability AI Community License)",
    }
    (web / f"{name}.json").write_text(json.dumps(manifest, indent=2))
    return manifest, placement
