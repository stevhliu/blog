"""A photo of the pouch's back panel, for the template (--back).

Extra photos are placed by matching print they share with the primary
photo (match.py), but a straight-on photo of the back shares none: it's the
other side of the bag. What it does share is the outline. Both panels are
the same cut of film, so a photo of the bag lying face down has the front
photo's outline, mirrored left to right (it's seen from behind).

register() lines the two outlines up with a homography, found by ECC
(enhanced correlation) on the blurred cut-out masks, so the whole outline
counts rather than four corners, which are rounded and ill-defined on a
pouch. The template's back is the front mirrored through z = 0, so each
back vertex has a front twin with a known photo pixel; flipping that pixel
and mapping it through the homography gives the vertex's place in the back
photo (back_uv).
"""
from __future__ import annotations

import cv2
import numpy as np
from PIL import Image

from .back import print_mask
from .camera import Camera

WORK_SIZE = 800  # px; the masks are registered at this size
BLUR = 9  # px at WORK_SIZE; gives ECC a slope to follow at the edges


def _mask(image: Image.Image) -> tuple[np.ndarray, float]:
    alpha = np.asarray(image.getchannel("A"))
    scale = WORK_SIZE / alpha.shape[0]
    small = cv2.resize((alpha > 127).astype(np.float32), (WORK_SIZE, WORK_SIZE), interpolation=cv2.INTER_AREA)
    return cv2.GaussianBlur(small, (0, 0), BLUR), scale


def register(front: Image.Image, back: Image.Image) -> tuple[np.ndarray, float]:
    """Homography from the front photo's pixels, flipped left to right, to
    the back photo's pixels. Returns it and the masks' correlation after
    alignment (1 is a perfect fit)."""
    f, fs = _mask(front.transpose(Image.FLIP_LEFT_RIGHT))
    b, bs = _mask(back)

    # Start from the bounding boxes, so ECC only has to find the perspective.
    def box(m):
        ys, xs = np.nonzero(m > 0.5)
        return xs.min(), ys.min(), xs.max(), ys.max()

    fx0, fy0, fx1, fy1 = box(f)
    bx0, by0, bx1, by1 = box(b)
    sx, sy = (bx1 - bx0) / (fx1 - fx0), (by1 - by0) / (fy1 - fy0)
    warp = np.array([[sx, 0, bx0 - sx * fx0], [0, sy, by0 - sy * fy0], [0, 0, 1]], np.float32)
    # ECC's warp maps the template's coordinates into the input image: with
    # f as the template, it takes front (flipped) pixels to back pixels.
    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)
    score, warp = cv2.findTransformECC(f, b, warp, cv2.MOTION_HOMOGRAPHY, criteria, None, 5)

    # Back to full resolution: flipped-front pixels -> small -> back pixels.
    to_small = np.diag([fs, fs, 1.0])
    to_full = np.diag([1 / bs, 1 / bs, 1.0])
    return to_full @ warp.astype(np.float64) @ to_small, float(score)


def back_uv(verts: np.ndarray, camera: Camera, front_width: int, homography: np.ndarray, back_size: int) -> np.ndarray:
    """UVs into the back photo for every vertex (only the back's are used)."""
    twin = verts * np.array([1.0, 1.0, -1.0])
    px, _ = camera.project(twin)
    flipped = np.stack([front_width - px[:, 0], px[:, 1], np.ones(len(px))], axis=1)
    mapped = flipped @ homography.T
    mapped = mapped[:, :2] / mapped[:, 2:]
    return np.stack([mapped[:, 0] / back_size, 1 - mapped[:, 1] / back_size], axis=1)  # trimesh v points up


def match_material(back: Image.Image, front: Image.Image) -> Image.Image:
    """The back photo with its film's colour matched to the front's. The two
    photos were taken under different light, and without this the back
    would turn a different white as the model rotates. Only film counts,
    not print, and each channel is scaled so the medians agree."""
    b = np.asarray(back.convert("RGBA")).astype(np.float64)
    f = np.asarray(front.convert("RGBA"))

    def film(rgba):
        keep = (rgba[..., 3] > 127) & ~print_mask(rgba.astype(np.uint8))
        return np.median(rgba[..., :3][keep], axis=0)

    gain = film(f.astype(np.float64)) / film(b)
    rgb = np.clip(b[..., :3] * gain, 0, 255)
    return Image.fromarray(np.dstack([rgb, b[..., 3:]]).astype(np.uint8), "RGBA")
