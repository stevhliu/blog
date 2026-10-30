"""Reprint the old studio photo for the Ciao bag, with the print as curves.

- Film and lighting: the studio photo's, print removed, upscaled.
- Print: traced into curves with potrace and drawn again at any size, so a
  letter's edge is a fitted curve rather than a stretched pixel. The
  wordmark comes from the studio render, which is clean but small (the
  small print there is 12px tall, too little to trace a letter's shape
  from). The small print, icon and QR come from the phone photo of the
  real bag, where the same letters are three times the size, aligned by
  the print both bags share. The phone's wordmark isn't used: the bag lay
  over its fold, so its E is creased in the photo.
- Back: the studio film mirrored and blank, with Bigface's logo artwork
  (LOGO) at the size and place the back photo shows it, found through the
  bag's outline.

Two front images come out, framed alike: the pipeline's input at SCALE
times the studio photo (shape, lighting and the quality gate run at this
size) and a texture master at MASTER times it, which --texture drops in
as the front panel's texture.

Run from tools/miniature with its venv, after running the pipeline on the
phone photos as work/ciao (it reads their prepared cut-outs):

    .venv/bin/python reprint_ciao.py
    .venv/bin/python -m miniature work/inputs/ciao-reprint-front.png \\
        --texture work/inputs/ciao-reprint-front-texture.png \\
        --back work/inputs/ciao-reprint-back.png --shape pouch --depth 0.25 --seal 0.1 \\
        --bulge 0.05 --zipper 0.877 --valve 0.212 0.472 0.053 --name ciao-reprint

The zipper and valve positions are measured on the studio render (zipper
line at y=350, valve ring centred on (345, 648) with radius 60, in its
1344px frame) as fractions of the bag's box.
"""
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, ".")

from miniature.fill import push_pull  # noqa: E402
from miniature.match import match  # noqa: E402
from miniature.panel import register  # noqa: E402

D = "work/ciao-reprint-previews/"  # checks to look at by eye
os.makedirs(D, exist_ok=True)
SCALE = 3  # the pipeline's frame: the studio photo, three times over
MASTER = 6  # the texture master's frame: twice the pipeline's (--texture)
INK_RATIO = 0.45  # phone photo: ink is darker than this share of the film around it
# The print, element by element: where it is (x0, y0, x1, y1 in studio
# px), which photo its ink is traced from, how potrace treats it (see
# trace_options) and the ink threshold its part of that photo needs (for
# the phone, a share of the film's brightness; for the studio render, a
# coverage). Later elements paint over earlier ones, so a word whose
# part of the phone photo needs its own threshold, and the icon and QR,
# sit inside the small print's block.
TEXT_BLOCK = (140, 450, 1160, 690)
ELEMENTS = [
    ((130, 850, 1220, 1070), "studio", "display", 0.5),  # BIGFACE wordmark
    (TEXT_BLOCK, "phone", "text", INK_RATIO),  # the small print
    ((145, 452, 250, 484), "phone", "text", 0.45),  # BF — IO.F
    ((312, 470, 470, 522), "phone", "text", 0.37),  # ISOLATED
    ((540, 527, 650, 560), "phone", "text", 0.55),  # (8.8OZ): thin ink here
    # Words that beans' shadows run through in the phone photo, so their
    # letters close up (an S reads as an 8). The studio render has the same
    # words; its small print is traced from 12px letters, so their shapes
    # are approximate, but every letter is the letter it should be.
    ((480, 527, 540, 560), "studio", "text", 0.5),  # 250G
    ((805, 455, 985, 500), "studio", "text", 0.5),  # CONTAINS SMILEMATTER™
    ((1035, 455, 1150, 500), "studio", "text", 0.5),  # FULL ANALYSIS
    # The icon is the phone's (the studio render draws its ring as a
    # hairline that doesn't survive thresholding, and different eyes); as
    # "display" its filled mouth isn't dropped as a blob. The QR is the
    # studio's: the phone's is warped by the bag's bulge and, through the
    # film, its modules merge.
    ((148, 486, 210, 556), "phone", "display", 0.45),  # icon
    ((1030, 610, 1145, 725), "studio", "qr", 0.5),  # QR code
]
# Not ink: the airlock valve's rim, which the studio render shows as faint
# grey lines. It stays a raster, its edges redrawn by crisp().
RASTER = [(285, 585, 405, 712)]
LETTER_AREA = 3000  # phone px; in the small print, anything bigger is a bean's shadow, not a letter
LOGO = "work/inputs/bigface-logo.png"  # commons.wikimedia.org/wiki/File:BIGFACE_logo.png


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
    h, w = coverage.shape
    c = cv2.resize(coverage.astype(np.float32), (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
    t = np.clip((c - 0.3) / 0.4, 0, 1)
    return t * t * (3 - 2 * t)


def trace_options(kind):
    """potrace's flags for one kind of print element.

    kind is "text" (the small print: a grotesque with square corners, at
    about 35px tall in the phone photo), "display" (the wordmark and the
    icon: large, rounded letterforms) or "qr" (a grid of squares, where
    every corner must stay a corner). The knobs that matter: -a/--alphamax
    is the corner threshold (0 keeps every corner, 1 is the default and
    rounds anything under about 90°, up to 4/3 rounds everything),
    -t/--turdsize drops specks up to that many pixels (the bitmaps are
    thresholded photos, so film grain survives as 1-3px dots),
    -O/--opttolerance sets how far the fitted curve may stray from the
    bitmap (0.2 default; smaller follows wobble, larger smooths it) and
    -n/--longcurve turns curve optimisation off. Returns a list of
    strings, e.g. ["-a", "0.6", "-t", "4"]."""
    # Thresholded photos leave 1-3px grain; the small print's periods and the
    # arrows' heads are about 8px across in the pipeline's frame, so 4 clears
    # the grain and keeps them.
    return {
        "text": ["-a", "0.5", "-t", "4", "-O", "0.3"],  # square corners, wobble smoothed
        "display": ["-a", "1.0", "-t", "4"],  # rounded letterforms as they are
        "qr": ["-a", "0", "-n", "-t", "2"],  # every corner a corner, no curve fitting
    }[kind]


def trace(ink, kind, scale):
    """Trace a binary ink mask into curves with potrace and draw it again
    `scale` times larger, antialiased. Returns coverage 0..1 at the new
    size, exactly scale times the mask's."""
    pbm, pgm = D + "trace.pbm", D + "trace.pgm"
    # PBM's 1 is black; PIL writes a mode "1" image that way round.
    Image.fromarray(np.where(ink, 0, 255).astype(np.uint8)).convert("1", dither=Image.Dither.NONE).save(pbm)
    subprocess.run(["potrace", pbm, "-b", "pgm", "-x", str(scale), *trace_options(kind), "-o", pgm], check=True)
    return 1 - np.asarray(Image.open(pgm), dtype=np.float32) / 255


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
# The valve's rim isn't ink, but it isn't film either: filled in too, so
# the film under the front's ring, which the back is made of, is plain.
for x0, y0, x1, y1 in RASTER:
    printed[y0:y1, x0:x1] = obj[y0:y1, x0:x1]
film = push_pull(old[..., :3].astype(np.float64), obj & ~printed)
coverage = np.clip((lum(film) - l) / np.maximum(lum(film) - ink_l, 1), 0, 1) * obj
coverage[coverage < 0.15] = 0  # film texture, not print
ink_colour = np.median(old[..., :3][coverage > 0.9], axis=0).astype(np.float32)
studio_coverage = crisp(coverage, SCALE)

# The phone photo's ink, aligned by the print features both bags share.
a, b = match(Image.fromarray(old), new_img)
H0, _ = cv2.findHomography(a, b, cv2.RANSAC, 4.0)  # studio px -> phone px
phone_bits = {}


def phone_text(ratio, kind):
    """The phone photo's ink at this threshold, as bits in the pipeline's
    frame. Only the small print drops large blobs: the icon's mouth and
    the QR's finder squares are bigger than any letter."""
    key = (ratio, kind == "text")
    if key not in phone_bits:
        phone = phone_ink(new, min_area=12, ratio=ratio, max_area=LETTER_AREA if kind == "text" else None)
        warped = cv2.warpPerspective(phone, H0 @ up, (S, S), flags=cv2.WARP_INVERSE_MAP | cv2.INTER_AREA)
        phone_bits[key] = warped > 0.5
    return phone_bits[key]


# Every element is traced in the pipeline's frame and drawn into the
# master's, MASTER / SCALE times larger. A potrace drawing is exactly that
# multiple of its input, so the boxes line up without resampling.
M = n * MASTER
master_ink = np.zeros((M, M), np.float32)
for (x0, y0, x1, y1), source, kind, ratio in ELEMENTS:
    bits = studio_coverage > ratio if source == "studio" else phone_text(ratio, kind)
    crop = bits[y0 * SCALE : y1 * SCALE, x0 * SCALE : x1 * SCALE]
    if source == "studio" and kind == "text":
        # The real bag's small print is bolder than the render's (6px
        # strokes to 2.7 at SCALE), so studio words sitting among phone
        # words are thickened to match.
        crop = cv2.dilate(crop.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    master_ink[y0 * MASTER : y1 * MASTER, x0 * MASTER : x1 * MASTER] = trace(crop, kind, MASTER // SCALE)
for x0, y0, x1, y1 in RASTER:
    master_ink[y0 * MASTER : y1 * MASTER, x0 * MASTER : x1 * MASTER] = crisp(coverage[y0:y1, x0:x1], MASTER)

# The film is smooth, so a cubic upscale loses nothing; the ink is drawn
# over it at the master's size, and the pipeline's input is the master
# averaged down, so both carry the same print at the same place.
film_master = cv2.resize(film.astype(np.float32), (M, M), interpolation=cv2.INTER_CUBIC)
master = film_master * (1 - master_ink[..., None]) + ink_colour * master_ink[..., None]
del film_master
master = np.clip(master, 0, 255).astype(np.uint8)
alpha_master = cv2.resize(old[..., 3], (M, M), interpolation=cv2.INTER_LINEAR)
Image.fromarray(np.dstack([master, alpha_master]), "RGBA").save("work/inputs/ciao-reprint-front-texture.png")
front = cv2.resize(master, (S, S), interpolation=cv2.INTER_AREA)
Image.fromarray(np.dstack([front, alpha_up]), "RGBA").save("work/inputs/ciao-reprint-front.png")
Image.fromarray(master).crop((130 * MASTER, 440 * MASTER, 700 * MASTER, 570 * MASTER)).save(D + "master-detail.png")
del master

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
# The front's own film, print filled in (the same `film` the front's print
# is drawn over), mirrored like the real back: so the back carries the
# same crimped seals, zipper line, folds and sheen the front does, rather
# than a smoothed blank that reads as a flat white card. The fill under
# the wordmark is soft, but it sits below the logo where the film is
# plain anyway.
back_film = cv2.resize(film.astype(np.float32), (S, S), interpolation=cv2.INTER_CUBIC)[:, ::-1]
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
