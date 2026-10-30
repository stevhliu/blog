"""Render a textured scene from a camera, without lighting.

Unlit on purpose: the quality check compares what the model's surfaces carry
against the photo, so shading would only add differences that aren't errors.
"""
from __future__ import annotations

import numpy as np
import trimesh
from PIL import Image

from .camera import Camera
from .project import sample
from .raster import rasterize


def shading(scene: trimesh.Scene, camera: Camera, light: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Diffuse shading (n·l, 0–1) from the scene's own vertex normals,
    interpolated across each triangle the way a viewer would, plus the face
    id under each pixel (-1 where empty). Used to spot faceting: smooth
    normals change gradually across triangle edges, flat ones jump."""
    meshes = scene.dump() if isinstance(scene, trimesh.Scene) else [scene]
    verts, faces, normals = [], [], []
    offset = 0
    for m in meshes:
        verts.append(np.asarray(m.vertices))
        faces.append(np.asarray(m.faces) + offset)
        normals.append(np.asarray(m.vertex_normals))
        offset += len(m.vertices)
    verts, faces, normals = map(np.concatenate, (verts, faces, normals))
    px, depth = camera.project(verts)
    frags = rasterize(px, depth, faces, camera.size)
    out = np.zeros((camera.size, camera.size))
    covered = frags.face >= 0
    n = (normals[faces[frags.face[covered]]] * frags.bary[covered][..., None]).sum(1)
    n /= np.linalg.norm(n, axis=1, keepdims=True)
    out[covered] = np.clip(n @ (light / np.linalg.norm(light)), 0, 1)
    return out, frags.face


def render(scene: trimesh.Scene, camera: Camera, background=(255, 255, 255)) -> tuple[Image.Image, np.ndarray]:
    """Returns the rendered RGB image and the coverage mask."""
    meshes = [g for g in scene.dump()] if isinstance(scene, trimesh.Scene) else [scene]
    verts, faces, uvs, owner = [], [], [], []
    offset = 0
    for i, m in enumerate(meshes):
        verts.append(np.asarray(m.vertices))
        faces.append(np.asarray(m.faces) + offset)
        uvs.append(np.asarray(m.visual.uv))
        owner.append(np.full(len(m.faces), i))
        offset += len(m.vertices)
    verts, faces, uvs, owner = map(np.concatenate, (verts, faces, uvs, owner))

    px, depth = camera.project(verts)
    frags = rasterize(px, depth, faces, camera.size)
    out = np.tile(np.array(background, dtype=np.float64), (camera.size, camera.size, 1))
    covered = frags.face >= 0
    for i, m in enumerate(meshes):
        mine = covered & (owner[np.maximum(frags.face, 0)] == i)
        if not mine.any():
            continue
        f = frags.face[mine]
        uv = (uvs[faces[f]] * frags.bary[mine][..., None]).sum(1)
        tex = np.asarray(m.visual.material.baseColorTexture.convert("RGB")).astype(np.float64)
        t_h, t_w = tex.shape[:2]
        out[mine] = sample(tex, np.stack([uv[:, 0] * t_w, (1 - uv[:, 1]) * t_h], axis=1))
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), covered
