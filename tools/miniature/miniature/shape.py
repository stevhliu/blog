"""Stage 2: generate the object's shape from the prepared photo.

The shape model sits behind this one function so it can be swapped (for
TRELLIS.2 on a cloud GPU, say) without touching the rest of the pipeline.
Only the geometry and its UV layout matter downstream; the model's own
texture is kept as the fallback for faces the photo never saw.

Stable Fast 3D runs on the CPU here: its README recommends that for Macs
with less than 32GB of unified memory, and on a 24GB M4 Pro the GPU path
runs out of memory. A run takes well under a minute.
"""
from __future__ import annotations

import sys
from pathlib import Path

import trimesh
from PIL import Image

VENDOR = Path(__file__).resolve().parents[1] / "vendor" / "stable-fast-3d"
MODEL = "stabilityai/stable-fast-3d"
TEXTURE_SIZE = 1024


def generate(prepared: Image.Image, device: str = "cpu") -> trimesh.Trimesh:
    sys.path.insert(0, str(VENDOR))
    import torch
    from sf3d.system import SF3D

    model = SF3D.from_pretrained(MODEL, config_name="config.yaml", weight_name="model.safetensors")
    model.to(device)
    model.eval()
    with torch.no_grad():
        mesh, _ = model.run_image(prepared, bake_resolution=TEXTURE_SIZE)
    return mesh
