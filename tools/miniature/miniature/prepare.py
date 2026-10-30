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


def frame(photo: Image.Image) -> tuple[int, int, int]:
    """The square (left, top, side) around the object, the way Stable Fast
    3D's resize_foreground frames it, but without shrinking it."""
    alpha = np.asarray(photo)[:, :, 3]
    ys, xs = np.nonzero(alpha > 127)
    x1, x2, y1, y2 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    side = int(max(x2 - x1, y2 - y1) / FOREGROUND_RATIO)
    return int((x1 + x2) / 2 - side / 2), int((y1 + y2) / 2 - side / 2), side


def square(photo: Image.Image, box: tuple[int, int, int] | None = None) -> Image.Image:
    """Crop and pad to the square frame() finds, or to the one given."""
    left, top, side = box or frame(photo)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(photo.crop((left, top, left + side, top + side)), (0, 0))
    return out


def prepare(photo: Image.Image) -> Image.Image:
    # Phone photos store their rotation as a tag rather than in the pixels.
    return square(cut_out(ImageOps.exif_transpose(photo)))


def prepare_texture(texture: Image.Image, photo: Image.Image) -> Image.Image:
    """A sharper copy of the photo, framed exactly as prepare() framed the
    photo, so the front panel's UVs (fractions of the photo) land on the same
    print. Its sides must be a whole multiple of the photo's: the frame is
    scaled, never re-found, so the two can't drift by a pixel. The photo's
    cut-out is recomputed here, which costs nothing for a photo that is
    already cut out."""
    photo = cut_out(ImageOps.exif_transpose(photo))
    texture = ImageOps.exif_transpose(texture).convert("RGBA")
    k = texture.width // photo.width
    if (texture.width, texture.height) != (photo.width * k, photo.height * k):
        raise ValueError(f"texture {texture.size} is not a whole multiple of the photo {photo.size}")
    left, top, side = frame(photo)
    return square(texture, (left * k, top * k, side * k))
