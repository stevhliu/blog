"""The surfaces the photo never saw.

A single photo shows one side, and the shape model invents the rest. Its
invention is plausible in shape but not in surface: on the Bigface pouch the
back came out as a lumpy quilt. Packaging and most products are made of one
material all the way round, so the back is better covered with the front's
own material, minus its features:

- blank() removes the print, keeps only broad shading in the interior and
  keeps the seams along the edges sharp.
- The projection step then gives each back-facing texel the blank photo
  sampled at its mirror image on the front (reflected through the object's
  middle along the camera axis), so the back matches the front's film at
  the same scale, mirrored like the real back would be.
"""
from __future__ import annotations

import numpy as np

from .fill import box_blur, push_pull

PRINT_CONTRAST = 40  # levels away from the local average that count as print
PRINT_DARK = 140  # on a light object, anything darker than this is print
PRINT_LIGHT = 30  # on a dark object, this much lighter than its median is print
LOCAL_RADIUS = 12  # px; the "local average" print is compared against
GROW = 5  # px the mask is grown past anti-aliased edges
# Seams, seals and rims run along an object's outline and are fine, dark,
# repeating texture that would otherwise read as print. A band this deep
# (fraction of the object's longer side) inside the silhouette is kept.
EDGE_BAND = 0.035
SOLID_INK = 70  # levels; what still counts as print inside that band (light objects)
SOLID_LIGHT_INK = 90  # above the median; the same for light print on dark objects
# Above this share of the surface counting as print, the "print" is really
# the material's own texture (denim, a pattern), and blanking it would erase
# the material: unseen surfaces keep the shape model's guess instead.
TEXTURED_SHARE = 0.6
INTERIOR_BLUR = 0.04  # of the object's size; see blank()


def print_mask(rgba: np.ndarray) -> np.ndarray:
    """Pixels that are print rather than material. The material's own
    shading is soft, so it stays close to a local average; type, logos and
    codes don't. Light objects carry dark print and dark objects light
    print, decided by the object's median brightness."""
    rgb = rgba[..., :3].astype(np.float64)
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    obj = rgba[..., 3] > 127
    local = box_blur(lum, LOCAL_RADIUS)
    median = np.median(lum[obj])
    if median >= 128:
        mask = (lum < PRINT_DARK) | (local - lum > PRINT_CONTRAST)
        solid = lum < SOLID_INK
    else:
        mask = (lum > median + PRINT_LIGHT) | (lum - local > PRINT_CONTRAST)
        solid = lum > median + SOLID_LIGHT_INK
    ys, xs = np.nonzero(obj)
    band = max(1, int(EDGE_BAND * max(np.ptp(xs), np.ptp(ys)) / 2))
    interior = box_blur(obj.astype(np.float64), band) > 0.999
    # In the edge band only solid ink counts, so print running to the edge
    # (the bottom of a big wordmark, say) still goes but seal texture stays.
    mask &= interior | solid
    mask = box_blur(mask.astype(np.float64), GROW) > 0.01
    return mask & obj


def blank(rgba: np.ndarray) -> np.ndarray:
    """The photo's material without its features, as RGB, bled past the
    silhouette.

    Print is removed and filled from the material around it. That alone
    misses marks that aren't ink, like embossing, so away from the edges
    only the broad shading survives: the interior is blurred by
    INTERIOR_BLUR of the object's size, which keeps reflections and
    gradients but erases anything letter-shaped (mirrored onto the back,
    letters would read backwards). The band along the outline, where seals
    and rims are, stays sharp, with a soft transition between the two."""
    obj = rgba[..., 3] > 127
    keep = obj & ~print_mask(rgba)
    filled = push_pull(rgba[..., :3].astype(np.float64), keep)

    ys, xs = np.nonzero(obj)
    extent = max(np.ptp(xs), np.ptp(ys))
    radius = max(1, int(INTERIOR_BLUR * extent))
    smooth = np.stack([box_blur(filled[..., c], radius) for c in range(3)], axis=-1)

    band = max(1, int(EDGE_BAND * extent / 2))
    interior = box_blur(obj.astype(np.float64), band) > 0.999
    weight = box_blur(interior.astype(np.float64), band)[..., None]
    return np.clip(filled * (1 - weight) + smooth * weight, 0, 255)


def print_share(rgba: np.ndarray) -> float:
    """How much of the object's surface counts as print."""
    obj = rgba[..., 3] > 127
    return float(print_mask(rgba).sum() / max(obj.sum(), 1))
