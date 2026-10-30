"""Stage 1: turn the source photo into the square, centred, cut-out image the
shape model expects, kept at full resolution so the projection step has every
pixel of the original to work with."""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageOps

# Stable Fast 3D frames its input so the object's longer side fills this
# fraction of a square. Matching it exactly is what lets the projection step
# reuse the model's own camera.
FOREGROUND_RATIO = 0.85
CUT_OUT_SHARE = 0.01  # at least this much of the image transparent to skip rembg


def cut_out(photo: Image.Image) -> Image.Image:
    """The photo as RGBA with a transparent background. A photo that is
    already cut out is used as is; otherwise rembg removes the background.
    "Cut out" means a real share of transparent pixels: some opaque PNGs
    carry an alpha channel with a stray translucent pixel or two."""
    photo = photo.convert("RGBA")
    if (np.asarray(photo.getchannel("A")) < 128).mean() > CUT_OUT_SHARE:
        return photo
    import rembg  # slow to import and only needed for opaque photos

    return rembg.remove(photo)


def square(photo: Image.Image) -> Image.Image:
    """Crop and pad to a square around the object, the way Stable Fast 3D's
    resize_foreground does, but without shrinking it."""
    alpha = np.asarray(photo)[:, :, 3]
    ys, xs = np.nonzero(alpha > 127)
    x1, x2, y1, y2 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    side = int(max(x2 - x1, y2 - y1) / FOREGROUND_RATIO)
    left = int((x1 + x2) / 2 - side / 2)
    top = int((y1 + y2) / 2 - side / 2)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(photo.crop((left, top, left + side, top + side)), (0, 0))
    return out


def prepare(photo: Image.Image) -> Image.Image:
    # Phone photos store their rotation as a tag rather than in the pixels.
    return square(cut_out(ImageOps.exif_transpose(photo)))
