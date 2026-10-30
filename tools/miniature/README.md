# Miniature

One product photo in, a small rotatable 3D model for the site out, with the
photo's own pixels, and so its text, on every surface the camera saw.

```sh
./setup.sh                                                   # once
.venv/bin/python -m miniature front.png --name bigface        # one photo
.venv/bin/python -m miniature front.png --extra side.png --name bigface
.venv/bin/python -m miniature front.png --extra side.png --shape pouch --name bigface
.venv/bin/python -m miniature front.png --back back.png --shape pouch --depth 0.25 --seal 0.1 --name ciao
.venv/bin/python -m miniature front.png --texture front-2x.png --name bigface   # a sharper copy for the texture
.venv/bin/python -m miniature.suite                           # the test set
```

A run takes about a minute on an M4 Pro (two and a half with an extra
photo) and ends with a pass or fail from the quality gate. The files to ship
are in `work/<name>/web/`.

## Why it works this way

Single-image 3D models are good at shape and bad at text: they repaint the
object from what they learned, so small print comes out as scribbles. Here
the model only supplies the shape. The photo is then projected back onto
every surface the camera saw, through the same camera the model assumed, so
the text is the photo's own pixels, not a guess.

## Stages

| | Module | What it does |
| --- | --- | --- |
| 1 | `prepare.py` | Cuts out the object (rembg, unless the photo is already cut out) and squares it the way the shape model frames its input, at full resolution. |
| 2 | `shape.py` | Generates the shape with [Stable Fast 3D](https://github.com/Stability-AI/stable-fast-3d) on the CPU (the GPU path runs out of memory below 32GB). The only module that knows which model is used. |
| 3 | `refine.py`, `align.py` | Smooths the surface (the model embosses print and lumps into it), recovers each photo's camera from its silhouette, and pulls the mesh's outline onto every photo's. Extra photos reshape only what the primary photo can't see. |
| 3 (`--shape pouch`) | `template.py`, `match.py` | For flat-bottom pouches, replaces the shape model's guess (a loaf with a rounded back) with the real construction: flat front and back panels leaning from the base into the seal, flat triangular gussets, built on the photo's own camera rays so the front outline is exact. Extra photos are placed by matching their print to the primary photo (SIFT, then perspective-n-point), and their outline then fits the base depth, the seal height and the photo's lens. A straight-on photo of the back shares no print with the front, so `panel.py` lines it up by outline instead (ECC on the cut-out masks) and maps it onto the back panel as its own textured part. |
| 4 | `project.py`, `back.py` | Faces the primary camera saw get the photo itself as their texture. Extra photos fill what it saw poorly, colour-matched to it. Unseen surfaces get the photo's material without its features (packaging), or the shape model's guess (textured objects); `--unseen` overrides. |
| 5 | `package.py`, `lighting.py` | Faces the model forward, crops the textures, simplifies each part with gltfpack, stores the textures as WebP (`EXT_texture_webp`; the front at up to 4096px, half the bytes of JPEG for black print on white film and no colour halo round the strokes), then renders it in headless Chrome with `<model-viewer>` from the photo's camera and picks the material (how much of the photo shows unlit, roughness, reflections) that matches the photo best. `--texture` swaps a sharper copy of the photo (same framing, a whole multiple of its size) in as the front panel's texture: the panel's UVs are fractions of the photo, so nothing else changes. |
| 6 | `qa.py` | Renders the shipped model from the photo's camera and fails the run unless the outline, the pixels and the text (read by macOS Vision) match the photo, and the shading is smooth. |

`camera.py`, `raster.py`, `render.py`, `fill.py` and `glb.py` are the shared
pieces: a pinhole camera in the shape model's conventions, a numpy
rasterizer (no GPU or OpenGL needed), an unlit renderer, a push-pull hole
filler and a GLB JSON editor. `calibrate.html` and `calibrate.mjs` are the
browser side of the lighting step; it uses the blog's Playwright and the
installed Google Chrome.

## Quality gate

| Check | Threshold | Bigface pouch |
| --- | --- | --- |
| Silhouette overlap | ≥ 0.97 | 0.999 |
| Pixel error on the object (2px blur on both) | ≤ 6 / 255 | 1.1 |
| Words matched (macOS Vision) | ≥ 95% (skipped with no text) | 21 of 21 |
| Every part has normals | all | all |
| Shading roughness under a raking light | ≤ 0.003 | 0.0010 |

Controls show each check catches what it's for: the shape model's own
texture matches 1 of 21 words; the same mesh shaded flat scores 0.020 on
roughness, and the model's raw lumpy surface 0.0065. The lit error against
the photo is reported, not gated, because its floor depends on how fine the
texture is; the lighting step already picks the best setting.

## Test set

`testset.json`, run with `python -m miniature.suite`:

| Case | What it tests | Result |
| --- | --- | --- |
| bigface | silver pouch, transparent background, plus a three-quarter view | pass |
| bigface-pouch | the same with the pouch template; depth, seal and lens fitted to the side photo (20° lens, 0.63 px print reprojection) | pass |
| bigface-front-only | the same from one photo | pass |
| iloma, el-rincon | dark bag, light metallic label, embossed wordmark, photo fills the frame | pass |
| iloma-pouch | the pouch template from one photo, depth estimated by the shape model | pass |
| santa-rosa | silver bag, dark label, embossed wordmark | pass |
| bucket-hat | fabric, no print, white background | pass |
| ciao | phone photos at 4032px of a frosted pouch lying flat, with a crimped seal down one edge; the back panel's photo placed by its outline (`--back`), depth and seal given | pass |

Lighting calibration roughly halves the lit error in every case (Bigface
17.6 → 11.4, Iloma 22.2 → 9.2, the hat 43.7 → 23.6).

## Print as curves

Text can only be as sharp as the photo, and in a photo a letter is a few
dozen pixels with a soft edge. `reprint_ciao.py` gets past that for the
Ciao bag by tracing its print into curves with potrace (installed by
`setup.sh`) and drawing them again at any size, so an edge is a fitted
curve rather than a stretched pixel. Each element of the print (the
wordmark, the small print's block, single words, the icon, the QR) names
the photo its ink comes from and how potrace should fit it: square corners
for the small print, rounded for the wordmark and icon, every corner kept
for the QR. The small print is taken from the phone photo of the real bag,
where its letters are 35px tall, rather than from the studio render, where
they are 12px; words that a bean's shadow runs through in the phone photo
come from the render instead. The script writes the pipeline's input at 3x
the studio photo and a texture master at 6x, framed alike, and the run
passes the master as `--texture`. The quality gate then reads its expected
words from the master, where OCR is surer than on the photo.

## Photos that work best

- One object, front-on, evenly lit, as large and sharp as possible. Text can
  only be as sharp as the photo.
- An extra three-quarter or side view corrects the depth a single photo has
  to guess (the Bigface gusset), and fills in the side. With `--shape pouch`
  it needs some of the front's print in view, so it can be placed exactly.
- For flat-bottom pouches, use `--shape pouch`: the shape model rounds their
  backs into a loaf; the template keeps the real A-frame.
- Surfaces no photo saw are inferred. For packaging that's the photo's own
  material; a photo of the back would be better still.

## Considered and left out

- **Surface relief from depth estimation** (Depth Anything V2): on the
  Bigface photos it finds 0.3% fine relief on the front, and the calibrated
  material shows only 20% lighting, so it changes nothing visible. Worth
  revisiting for crumpled or embossed objects photographed in raking light.
- **Hunyuan3D-2**: its licence forbids displaying its output in the EU, UK
  and South Korea, which a public site would do.

## Licences

- **Stable Fast 3D:** Stability AI Community License. Free worldwide for
  personal use and for businesses under $1M annual revenue. The manifest in
  `web/` carries a credit line to show next to the model.
