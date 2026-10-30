"""Image helpers shared by the projection and back-fill steps."""
from __future__ import annotations

import numpy as np


def push_pull(rgb: np.ndarray, keep: np.ndarray) -> np.ndarray:
    """Fill every pixel where keep is False from the kept pixels around it.
    Pull halves the image until every hole is covered at some scale; push
    walks back up filling each level's holes from the level below. A hole
    takes its colour from the nearest kept pixels at whatever scale first
    spans it, so large holes match their own edges rather than an average
    of the whole image."""
    keep = keep.astype(np.float64)
    levels = [(rgb * keep[..., None], keep)]
    while min(levels[-1][1].shape) > 1:
        c, w = levels[-1]
        h, wd = w.shape[0] // 2 * 2, w.shape[1] // 2 * 2
        down = lambda a: a[0:h:2, 0:wd:2] + a[1:h:2, 0:wd:2] + a[0:h:2, 1:wd:2] + a[1:h:2, 1:wd:2]
        levels.append((down(c[:h, :wd]), down(w[:h, :wd])))
    c, w = levels[-1]
    value = c / np.maximum(w, 1e-9)[..., None]
    for c, w in reversed(levels[:-1]):
        up = np.repeat(np.repeat(value, 2, 0), 2, 1)
        up = np.pad(up, ((0, c.shape[0] - up.shape[0]), (0, c.shape[1] - up.shape[1]), (0, 0)), mode="edge")
        # Soften the 2x2 blocks the upsample leaves behind.
        up = np.stack([box_blur(up[..., i], 1) for i in range(up.shape[-1])], axis=-1)
        a = np.clip(w, 0, 1)[..., None]
        value = c / np.maximum(w, 1e-9)[..., None] * a + up * (1 - a)
    return np.clip(value, 0, 255)


def box_blur(a: np.ndarray, r: int) -> np.ndarray:
    """Three passes of a (2r+1) box blur along each axis, close to Gaussian."""
    out = a.astype(np.float64)
    for axis in (0, 1):
        for _ in range(3):
            pad = [(0, 0)] * out.ndim
            pad[axis] = (r + 1, r)
            c = np.cumsum(np.pad(out, pad, mode="edge"), axis=axis)
            n = c.shape[axis]
            out = (np.take(c, range(2 * r + 1, n), axis=axis) - np.take(c, range(0, n - 2 * r - 1), axis=axis)) / (
                2 * r + 1
            )
    return out
