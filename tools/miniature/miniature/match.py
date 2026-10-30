"""Find an extra photo's camera from the print both photos share.

Silhouettes are weak evidence for an exact viewpoint: many angles give
nearly the same outline. Print is strong evidence. The primary photo is
registered to the model pixel for pixel, so every printed feature has a
known 3D position; matching those features in the extra photo pins its
camera down (the perspective-n-point problem).
"""
from __future__ import annotations

import cv2
import numpy as np
from PIL import Image

from .camera import Camera

RATIO = 0.75  # Lowe's ratio test for a distinctive match
FIELDS_OF_VIEW = (15, 20, 25, 30, 35, 40, 50)  # the extra photo's lens is unknown


def _gray(image: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    rgba = np.asarray(image.convert("RGBA"))
    gray = cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2GRAY)
    return gray, (rgba[..., 3] > 127).astype(np.uint8)


def match(primary: Image.Image, extra: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    """Pixel positions of features seen in both photos, (N, 2) each.
    SIFT finds them, the ratio test keeps distinctive ones, and a RANSAC
    homography keeps those consistent with one surface (the printed front
    is close to flat), dropping reflections that only look alike."""
    sift = cv2.SIFT_create(nfeatures=8000)
    g1, m1 = _gray(primary)
    g2, m2 = _gray(extra)
    k1, d1 = sift.detectAndCompute(g1, m1)
    k2, d2 = sift.detectAndCompute(g2, m2)
    if d1 is None or d2 is None:
        return np.empty((0, 2)), np.empty((0, 2))
    pairs = cv2.BFMatcher().knnMatch(d1, d2, k=2)
    good = [m for m, n in (p for p in pairs if len(p) == 2) if m.distance < RATIO * n.distance]
    if len(good) < 8:
        return np.empty((0, 2)), np.empty((0, 2))
    a = np.float32([k1[m.queryIdx].pt for m in good])
    b = np.float32([k2[m.trainIdx].pt for m in good])
    _, inliers = cv2.findHomography(a, b, cv2.RANSAC, 6.0)
    keep = inliers.ravel().astype(bool)
    return a[keep].astype(np.float64), b[keep].astype(np.float64)


def solve(points: np.ndarray, pixels: np.ndarray, size: int) -> list[tuple[Camera, float]]:
    """Cameras that project 3D points onto their pixels, one per field of
    view in FIELDS_OF_VIEW, each with its mean reprojection error in pixels.

    When the points lie close to one plane (a printed front), lens and angle
    trade off: a wider lens at a steeper angle reprojects the print almost
    as well as a narrower one head-on. So every plausible lens is returned
    (within 1.5x of the best error) and something that depends on the lens,
    like the outline, has to choose."""
    if len(points) < 12:
        return []
    found = []
    for fov in FIELDS_OF_VIEW:
        camera = Camera(size, fovy=fov)
        f = camera.focal
        k = np.array([[f, 0, size / 2], [0, f, size / 2], [0, 0, 1]])
        ok, rvec, tvec, inliers = cv2.solvePnPRansac(
            points, pixels, k, None, iterationsCount=1000, reprojectionError=4.0, flags=cv2.SOLVEPNP_ITERATIVE
        )
        if not ok or inliers is None or len(inliers) < 12:
            continue
        idx = inliers.ravel()
        rvec, tvec = cv2.solvePnPRefineLM(points[idx], pixels[idx], k, None, rvec, tvec)
        projected, _ = cv2.projectPoints(points[idx], rvec, tvec, k, None)
        error = float(np.linalg.norm(projected.reshape(-1, 2) - pixels[idx], axis=1).mean())
        rot, _ = cv2.Rodrigues(rvec)
        found.append((Camera(size, fovy=fov, pose=(rot.tolist(), tvec.ravel().tolist())), error))
    if not found:
        return []
    floor = min(e for _, e in found)
    return [(c, e) for c, e in found if e <= 1.5 * floor + 0.25]


def reliable(points: np.ndarray, pixels: np.ndarray, size: int, fovy: float = 30.0) -> np.ndarray:
    """Indices of matches a RANSAC camera solve agrees with. Run once, so
    every later solve uses the same matches and is deterministic."""
    cv2.setRNGSeed(0)
    f = Camera(size, fovy=fovy).focal
    k = np.array([[f, 0, size / 2], [0, f, size / 2], [0, 0, 1]])
    ok, _, _, inliers = cv2.solvePnPRansac(points, pixels, k, None, iterationsCount=2000, reprojectionError=6.0)
    return inliers.ravel() if ok and inliers is not None else np.arange(len(points))


def solve_with(points: np.ndarray, pixels: np.ndarray, size: int, fovy: float) -> tuple[Camera, float]:
    """The camera for one field of view, by deterministic least squares on
    matches already known to be reliable. Returns it and the mean
    reprojection error in pixels."""
    f = Camera(size, fovy=fovy).focal
    k = np.array([[f, 0, size / 2], [0, f, size / 2], [0, 0, 1]])
    _, rvec, tvec = cv2.solvePnP(points, pixels, k, None, flags=cv2.SOLVEPNP_ITERATIVE)
    rvec, tvec = cv2.solvePnPRefineLM(points, pixels, k, None, rvec, tvec)
    projected, _ = cv2.projectPoints(points, rvec, tvec, k, None)
    error = float(np.linalg.norm(projected.reshape(-1, 2) - pixels, axis=1).mean())
    rot, _ = cv2.Rodrigues(rvec)
    return Camera(size, fovy=fovy, pose=(rot.tolist(), tvec.ravel().tolist())), error
