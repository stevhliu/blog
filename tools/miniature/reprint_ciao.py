"""Reprint the old studio photo for the Ciao bag, at SCALE times the
resolution.

- Film and lighting: the studio photo's, print removed, upscaled.
- Print the two bags share (wordmark, most of the small text, QR, icon):
  the studio photo's own, with its edges rebuilt at the higher resolution
  (coverage upscaled, then re-thresholded with a soft ramp) so it stays
  crisp when zoomed rather than going soft like a plain upscale. The small
  text is emboldened to the real bag's weight.
- Words that differ (REPLACE boxes): ink from the phone photo, aligned by
  print features. The phone's wordmark isn't used: the bag lay over its
  fold, so its E is creased in the photo, and its small text is only taken
  where it differs, since the beans behind the film make the rest uneven.
- Back: the studio film mirrored and blank, with Bigface's logo artwork
  (LOGO) at the size and place the back photo shows it, found through the
  bag's outline.

Run from tools/miniature with its venv, after running the pipeline on the
phone photos as work/ciao (it reads their prepared cut-outs):

    .venv/bin/python reprint_ciao.py
    .venv/bin/python -m miniature work/inputs/ciao-reprint-front.png \\
        --back work/inputs/ciao-reprint-back.png --shape pouch --depth 0.25 --seal 0.1 --name ciao-reprint
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, ".")
from miniature.back import INTERIOR_BLUR, blank  # noqa: E402
from miniature.fill import box_blur, push_pull  # noqa: E402
from miniature.match import match  # noqa: E402
from miniature.panel import register  # noqa: E402

D = "work/ciao-reprint-previews/"  # checks to look at by eye
os.makedirs(D, exist_ok=True)
SCALE = 3
INK_RATIO = 0.4  # phone photo: ink is darker than this share of the film around it
# The small text block in the studio photo (x0, y0, x1, y1). The real bag's
# small print is bolder than the studio render's (6px strokes at SCALE in
# the phone photo, 2.7 in the studio's), so the studio's text is
# emboldened to match. KEEP boxes inside it (icon, QR code) are left as is.
TEXT_BLOCK = (140, 450, 1160, 690)
KEEP = [(148, 486, 210, 556), (1030, 610, 1145, 725), (285, 585, 405, 712)]  # icon, QR, airlock ring
BOLDEN = 2.2  # px added to each side of a stroke; matches by eye better than the medians
# Words that differ on the Ciao bag, from the phone photo, each with the
# ink threshold its part of the photo needs.
REPLACE = [
    ((145, 452, 250, 484), 0.45),  # BF — X        -> BF — IO.F
    ((312, 470, 470, 522), 0.37),  # MULTI         -> ISOLATED
    ((312, 527, 470, 560), 0.45),  # OMNI          -> FILTER
    ((540, 527, 650, 560), 0.55),  # (after 250G)  -> (8.8OZ); 250G itself is the studio's
]
LETTER_AREA = 3000  # phone px; anything bigger is a bean's shadow, not a letter
LOGO = "work/inputs/bigface-logo.png"  # commons.wikimedia.org/wiki/File:BIGFACE_logo.png
STROKE = 2.7  # px at SCALE: the studio's small text, measured


def lum(rgb):
    return rgb[..., :3].astype(np.float64) @ [0.299, 0.587, 0.114]


def phone_ink(rgba, min_area, ratio=INK_RATIO, max_area=None):
    """Binary ink in a phone photo, judged against the film around it so
    uneven light doesn't change the letters' weight, with specks removed."""
    l = lum(rgba)
    size = rgba.shape[0]
    bg = cv2.dilate(cv2.GaussianBlur(l, (0, 0), size / 400), np.ones((int(size / 20),) * 2))
    ink = ((l < ratio * bg) & (rgba[..., 3] > 127)).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(ink, 8)
    keep = np.zeros(count, bool)
    area = stats[1:, cv2.CC_STAT_AREA]
    keep[1:] = (area >= min_area) & (area <= (max_area or area.max()))
    return keep[labels].astype(np.float32)


def thin(ink, width):
    """Redraw binary strokes at a fixed width: reduce them to centre lines
    (skeletonize), then draw every pixel within width/2 of a centre line,
    with a one-pixel ramp at the edge for antialiasing. The phone photo's
    print comes out bolder than the studio's, and unevenly so."""
    from skimage.morphology import skeletonize

    centre = skeletonize(ink)
    if not centre.any():
        return np.zeros(ink.shape, np.float32)
    dist = cv2.distanceTransform((~centre).astype(np.uint8), cv2.DIST_L2, 5)
    return np.clip(width / 2 + 0.5 - dist, 0, 1).astype(np.float32)


def crisp(coverage, scale):
    """Upscale ink coverage with sharp edges: cubic upscale, then a narrow
    ramp around half coverage, which redraws each edge at the new
    resolution instead of stretching the old one's blur."""
    n = coverage.shape[0] * scale
    c = cv2.resize(coverage.astype(np.float32), (n, n), interpolation=cv2.INTER_CUBIC)
    t = np.clip((c - 0.3) / 0.4, 0, 1)
    return t * t * (3 - 2 * t)


old = np.asarray(Image.open("work/bigface-pouch/prepared.png"))
new_img = Image.open("work/ciao/prepared.png")
new = np.asarray(new_img)
n = old.shape[0]
S = n * SCALE
up = np.diag([1 / SCALE, 1 / SCALE, 1.0])
obj = old[..., 3] > 127
alpha_up = cv2.resize(old[..., 3], (S, S), interpolation=cv2.INTER_LINEAR)

# The studio print as coverage (0 film, 1 ink), against the film filled in
# under it.
l = lum(old)
ink_l = np.percentile(l[obj], 1)
printed = obj & (l < 140)
printed = cv2.dilate(printed.astype(np.uint8), np.ones((5, 5))) > 0
film = push_pull(old[..., :3].astype(np.float64), obj & ~printed)
coverage = np.clip((lum(film) - l) / np.maximum(lum(film) - ink_l, 1), 0, 1) * obj
coverage[coverage < 0.15] = 0  # film texture, not print
film_up = cv2.resize(film, (S, S), interpolation=cv2.INTER_CUBIC)
ink = crisp(coverage, SCALE)
ink_colour = np.median(old[..., :3][coverage > 0.9], axis=0)

# The differing words from the phone photo, aligned by the print features
# both bags share.
a, b = match(Image.fromarray(old), new_img)
H0, _ = cv2.findHomography(a, b, cv2.RANSAC, 4.0)  # studio px -> phone px
def phone_text(ratio):
    phone = phone_ink(new, min_area=12, ratio=ratio, max_area=LETTER_AREA)
    return cv2.warpPerspective(phone, H0 @ up, (S, S), flags=cv2.WARP_INVERSE_MAP | cv2.INTER_AREA)


def bolden(ink, extra):
    """Thicken strokes by `extra` px a side, with an antialiased edge."""
    core = (ink > 0.5).astype(np.uint8)
    dist = cv2.distanceTransform(1 - core, cv2.DIST_L2, 5)
    return np.maximum(ink, np.clip(extra + 0.5 - dist, 0, 1))


x0, y0, x1, y1 = (v * SCALE for v in TEXT_BLOCK)
original = ink.copy()
ink[y0:y1, x0:x1] = bolden(ink[y0:y1, x0:x1], BOLDEN * 1.0)
for kx0, ky0, kx1, ky1 in KEEP:
    box = (slice(ky0 * SCALE, ky1 * SCALE), slice(kx0 * SCALE, kx1 * SCALE))
    ink[box] = original[box]
for (rx0, ry0, rx1, ry1), ratio in REPLACE:
    box = (slice(ry0 * SCALE, ry1 * SCALE), slice(rx0 * SCALE, rx1 * SCALE))
    ink[box] = phone_text(ratio)[box]

front = film_up * (1 - ink[..., None]) + ink_colour * ink[..., None]
Image.fromarray(np.dstack([np.clip(front, 0, 255), alpha_up]).astype(np.uint8), "RGBA").save(
    "work/inputs/ciao-reprint-front.png"
)

# Back: mirrored blank film plus the logo, placed by the back photo.
back_photo = Image.open("work/ciao/prepared-back.png")
H, score = register(Image.fromarray(old), back_photo)  # flipped studio px -> back px
print("back outline ecc", round(score, 4))
back_rgba = np.asarray(back_photo)
logo = phone_ink(back_rgba, min_area=2000)
# Only ink well inside the panel: the photo's edges carry fold lines.
inner = cv2.erode((back_rgba[..., 3] > 127).astype(np.uint8), np.ones((int(0.06 * back_rgba.shape[0]),) * 2))
count, labels, stats, _ = cv2.connectedComponentsWithStats(logo.astype(np.uint8), 8)
inside = np.array([True] + [inner[labels == i].mean() > 0.99 for i in range(1, count)])
logo = (inside[labels] & (logo > 0)).astype(np.float32)
placed = cv2.warpPerspective(logo, H @ up, (S, S), flags=cv2.WARP_INVERSE_MAP | cv2.INTER_AREA)
# The photo only decides where the logo goes and how big it is. The artwork
# is Bigface's own (Wikimedia Commons, BIGFACE_logo.png): ink detected in
# the photo hollows out large solid shapes like the mouth, since their
# middles have no film nearby to compare against.
ys, xs = np.nonzero(placed > 0.5)
bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
art = np.asarray(Image.open(LOGO).convert("RGB"))
art_ink = np.clip((255 - lum(art)) / (255 - np.percentile(lum(art), 1)), 0, 1)
fit = min((bx1 - bx0) / art.shape[1], (by1 - by0) / art.shape[0])
w, h = round(art.shape[1] * fit), round(art.shape[0] * fit)
cx, cy = (bx0 + bx1) // 2, (by0 + by1) // 2
logo_up = np.zeros((S, S), np.float32)
logo_up[cy - h // 2 : cy - h // 2 + h, cx - w // 2 : cx - w // 2 + w] = cv2.resize(
    art_ink.astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC
)
# Redraw the enlarged edges sharp, as crisp() does for the front's print.
t = np.clip((logo_up - 0.3) / 0.4, 0, 1)
logo_up = t * t * (3 - 2 * t)
# The pipeline's own blank film (print gone, interior smoothed so no
# letter-shaped ghosts survive), mirrored like the real back. Its outline
# band is smoothed too: blank() keeps the side seals' crimp sharp, and seen
# nearly edge-on as the back turns past the side, those fine ridges alias
# into streaks.
plain = blank(old)
ys, xs = np.nonzero(obj)
radius = max(1, int(INTERIOR_BLUR * max(np.ptp(xs), np.ptp(ys))))
plain = np.stack([box_blur(plain[..., c], radius) for c in range(3)], axis=-1)
back_film = cv2.resize(plain, (S, S), interpolation=cv2.INTER_CUBIC)[:, ::-1]
rgb = back_film * (1 - logo_up[..., None]) + ink_colour * logo_up[..., None]
Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha_up[:, ::-1]]).astype(np.uint8), "RGBA").save(
    "work/inputs/ciao-reprint-back.png"
)

for f in ("front", "back"):
    im = Image.open(f"work/inputs/ciao-reprint-{f}.png")
    bg = Image.new("RGB", im.size, (255, 255, 255))
    bg.paste(im, (0, 0), im)
    bg.resize((1344, 1344)).save(D + f"reprint-{f}.jpg")
    if f == "front":
        bg.crop((130 * SCALE, 440 * SCALE, 700 * SCALE, 570 * SCALE)).save(D + "reprint-front-detail.png")
        bg.crop((130 * SCALE, 440 * SCALE, 1170 * SCALE, 730 * SCALE)).resize((1560, 435)).save(D + "reprint-front-block.png")
