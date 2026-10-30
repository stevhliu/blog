"""Stage 5b: decide how the photo is lit in the viewer, by measuring.

The photo already holds its studio's lighting. Lit again by <model-viewer>,
the print washes out and the material reads milky. Each material therefore
shows part of the photo directly, through glTF's emissive channel (unaffected
by scene lighting), and keeps the rest as an ordinary lit surface for shape
cues as the model turns:

    colour = emissive * photo + (1 - emissive) * photo * lighting + reflection

calibrate() renders the shipped GLB in headless Chromium with <model-viewer>,
the site's own renderer, from the photo's camera, tries a grid of emissive
shares and roughnesses, and returns the setting closest to the photo.
bake() writes it into the GLB.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

from .camera import Camera
from .glb import read_glb, write_glb

ROOT = Path(__file__).resolve().parents[1]
GRID = [
    {"emissive": e, "roughness": r, "specular": s}
    for e in (0.0, 0.25, 0.5, 0.65, 0.8, 1.0)
    for r in (0.35, 0.6, 0.9)
    for s in (1.0, 0.5, 0.0)
]
# Some lighting is kept for shape cues even if pure emissive matches the
# photo a little better head-on: a fully unlit model looks flat as it turns.
MAX_EMISSIVE = 0.8


def viewer_camera(camera: Camera, placement: np.ndarray) -> dict:
    """The photo's camera in the packaged model's coordinates, expressed the
    way <model-viewer> takes it: a target point and an orbit around it."""
    eye = placement @ np.append(camera.eye(), 1)
    target = placement @ np.array([0.0, 0.0, 0.0, 1.0])
    offset = (eye - target)[:3]
    radius = float(np.linalg.norm(offset))
    theta = float(np.arctan2(offset[0], offset[2]))
    phi = float(np.arccos(np.clip(offset[1] / radius, -1, 1)))
    return {"target": target[:3].tolist(), "orbit": [theta, phi, radius], "fov": camera.fovy}


def calibrate(
    model: Path, photo: Path, camera: Camera, placement: np.ndarray, tone_mapping: str = "neutral"
) -> list[dict]:
    """Bake every setting in GRID into its own copy of the model and score
    each against the photo. Baking first means the renderer sees exactly
    the bytes that would ship."""
    variants = model.parent.parent / "lighting"
    variants.mkdir(exist_ok=True)
    paths = []
    for i, setting in enumerate(GRID):
        path = variants / f"variant-{i:02d}.glb"
        path.write_bytes(model.read_bytes())
        bake(path, setting)
        paths.append(str(path.resolve().relative_to(ROOT)))
    view = {
        **viewer_camera(camera, placement),
        "photo": str(photo.resolve().relative_to(ROOT)),
        "toneMapping": tone_mapping,
    }
    payload = json.dumps({"root": str(ROOT), "view": view, "models": paths})
    out = subprocess.run(
        ["node", str(ROOT / "calibrate.mjs"), payload], capture_output=True, text=True, timeout=900
    )
    if out.returncode != 0:
        raise RuntimeError(f"calibration failed:\n{out.stderr}")
    errors = json.loads(out.stdout.strip().splitlines()[-1])
    return [{**setting, "tone_mapping": tone_mapping, "error": round(e, 2)} for setting, e in zip(GRID, errors)]


def choose(results: list[dict]) -> dict:
    allowed = [r for r in results if r["emissive"] <= MAX_EMISSIVE]
    return min(allowed, key=lambda r: r["error"])


def bake(model: Path, setting: dict) -> None:
    """Write the chosen setting into every material of the GLB: the base
    colour texture doubles as the emissive texture."""
    gltf, binary = read_glb(model)
    k = setting["emissive"]
    for material in gltf["materials"]:
        pbr = material.setdefault("pbrMetallicRoughness", {})
        texture = pbr.get("baseColorTexture")
        if texture is None:
            continue
        pbr["baseColorFactor"] = [1 - k, 1 - k, 1 - k, 1]
        pbr["metallicFactor"] = 0
        pbr["roughnessFactor"] = setting["roughness"]
        material["emissiveTexture"] = dict(texture)
        material["emissiveFactor"] = [k, k, k]
        # Even a matte dielectric reflects ~4% of the environment, a faint
        # white sheen that lifts black print; this scales it.
        material.setdefault("extensions", {})["KHR_materials_specular"] = {"specularFactor": setting["specular"]}
    used = gltf.setdefault("extensionsUsed", [])
    if "KHR_materials_specular" not in used:
        used.append("KHR_materials_specular")
    write_glb(model, gltf, binary)
