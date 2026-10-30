"""Command line: python -m miniature PHOTO [--extra PHOTO ...] --name NAME

PHOTO is the primary photo: the one whose print must come through exactly,
usually the front. Each --extra photo (a side, a three-quarter view) helps
correct the shape and fills in surfaces the primary never saw. With the
pouch template, --back takes a straight-on photo of the back panel, which
shares no print with the front and is placed by its outline instead
(panel.py), and --depth and --seal fix the template's two numbers when they
are already known, skipping the shape model.

Writes work/NAME/:

- prepared.png    stage 1, the square cut-out the model saw
- shape.glb       stage 2, the shape model's raw output
- refined.glb     stage 3, smoothed and snapped to every photo's outline
- miniature.glb   stage 4, the photos projected onto it
- web/            stage 5, what the site loads: NAME.glb, NAME-poster.webp
                  and NAME.json (sizes, triangle count, viewer settings)
- qa-view.png     stage 6, the shipped model rendered from the photo's camera
- qa-lit.png      the same, lit, to judge shading by eye
- report.json     every measurement, and whether the quality gate passed

Exits with status 1 if the quality gate fails, so a model whose text
doesn't match the photo never looks like a success.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image

from .align import fit_camera, fit_view, iou
from .lighting import bake, calibrate, choose
from .package import package
from .prepare import prepare, prepare_texture
from .project import project
from .qa import check, load_for_check
from .raster import silhouette
from .refine import fit_outlines, smooth

WORK = Path(__file__).resolve().parents[1] / "work"


def main() -> None:
    parser = argparse.ArgumentParser(prog="miniature", description=__doc__.splitlines()[0])
    parser.add_argument("photo", type=Path, help="primary photo, usually the front")
    parser.add_argument("--extra", type=Path, nargs="*", default=[], help="more photos of the same object")
    parser.add_argument("--name", required=True, help="output folder under work/, and the shipped file name")
    parser.add_argument("--back", type=Path, help="pouch template only: a straight-on photo of the back, seal at the top")
    parser.add_argument("--depth", type=float, help="pouch template only: base depth as a fraction of the width")
    parser.add_argument("--seal", type=float, default=0.15, help="pouch template only: seal height as a fraction of the height")
    parser.add_argument("--bulge", type=float, default=0.0, help="pouch template only: how far the panels swell, as a fraction of the width")
    parser.add_argument("--zipper", type=float, help="pouch template only: height of the zipper's lip up the bag, as a fraction of the height")
    parser.add_argument(
        "--valve",
        type=float,
        nargs=3,
        metavar=("CX", "CY", "R"),
        help="pouch template only: the airlock valve's centre across and down the bag's box and its radius, as fractions of the width (height for CY)",
    )
    parser.add_argument(
        "--texture",
        type=Path,
        help="a sharper copy of the primary photo, framed the same and a whole multiple of its size, "
        "used as the front panel's texture in place of the photo",
    )
    parser.add_argument("--reuse-shape", action="store_true", help="skip stage 2 if shape.glb exists")
    parser.add_argument(
        "--shape",
        choices=["model", "pouch"],
        default="model",
        help="the shape model's own shape, or a flat-bottom pouch template fitted to the photos",
    )
    parser.add_argument(
        "--unseen",
        choices=["auto", "blank", "model"],
        default="auto",
        help="surfaces no photo saw: the photo's material without its features, the shape model's guess, "
        "or auto (blank for packaging, the model's guess for textured objects)",
    )
    args = parser.parse_args()

    out = WORK / args.name
    out.mkdir(parents=True, exist_ok=True)
    timings = {}

    def stage(name, fn):
        start = time.time()
        result = fn()
        timings[name] = round(time.time() - start, 1)
        print(f"{name}: {timings[name]}s", flush=True)
        return result

    prepared = stage("prepare", lambda: prepare(Image.open(args.photo)))
    prepared.save(out / "prepared.png")
    texture = prepare_texture(Image.open(args.texture), Image.open(args.photo)) if args.texture else None
    extras = [prepare(Image.open(p)) for p in args.extra]
    for i, image in enumerate(extras):
        image.save(out / f"prepared-extra-{i}.png")

    if (args.back or args.depth) and args.shape != "pouch":
        parser.error("--back and --depth need --shape pouch")
    back_photo = None
    if args.back:
        back_photo = prepare(Image.open(args.back))
        back_photo.save(out / "prepared-back.png")

    shape_path = out / "shape.glb"
    if args.depth is not None:
        mesh = None  # the template's depth is given; the shape model isn't needed
    elif args.reuse_shape and shape_path.exists():
        mesh = trimesh.load(shape_path, force="mesh", process=False)
    else:
        from .shape import generate

        mesh = stage("shape", lambda: generate(prepared))
        mesh.export(shape_path, include_normals=True)

    def refine():
        smoothed = smooth(mesh)
        camera, _ = fit_camera(smoothed, prepared)
        extra_cameras = []
        if extras:
            # Extra cameras are found against the model already textured
            # from the primary photo, which settles left-or-right ambiguity.
            reference, _ = project(smoothed, prepared, camera)
            extra_cameras = [fit_view(smoothed, image, reference)[0] for image in extras]
        refined, extra_cameras = fit_outlines(smoothed, (prepared, camera), list(zip(extras, extra_cameras)))
        return refined, camera, extra_cameras

    def fit_template():
        from .camera import Camera
        from .template import Relief, estimate_depth, fit_pouch

        # The template is built through the shape model's own camera, so the
        # front outline is the photo's; the shape model only estimates depth.
        camera = Camera(size=prepared.width)
        depth = args.depth if args.depth is not None else estimate_depth(mesh, camera)
        relief = Relief(args.bulge, args.zipper, tuple(args.valve) if args.valve else None)
        fitted, d, s, cameras, stats = fit_pouch(prepared, camera, depth, extras, args.seal, relief)
        timings["template"] = {"depth": round(d, 3), "seal": s, **stats}
        return fitted, camera, cameras

    mesh, camera, extra_cameras = stage("refine", fit_template if args.shape == "pouch" else refine)
    # Extra photos that couldn't be placed are left out of the projection.
    placed = [(image, cam) for image, cam in zip(extras, extra_cameras) if cam is not None]
    mesh.export(out / "refined.glb", include_normals=True)
    px, _ = camera.project(np.asarray(mesh.vertices))
    fit = iou(silhouette(px, np.asarray(mesh.faces), camera.size), np.asarray(prepared.getchannel("A")) > 127)

    back = None
    if back_photo is not None:
        from .panel import back_uv, match_material, register

        homography, score = register(prepared, back_photo)
        timings["back_registration"] = round(score, 4)
        back = (
            match_material(back_photo, prepared),
            back_uv(np.asarray(mesh.vertices), camera, prepared.width, homography, back_photo.width),
        )
    scene, stats = stage(
        "project",
        lambda: project(mesh, prepared, camera, unseen=args.unseen, extra=placed, back=back),
    )
    scene.export(out / "miniature.glb", include_normals=True)

    manifest, placement = stage("package", lambda: package(scene, prepared, out, args.name, texture))
    model = out / "web" / f"{args.name}.glb"

    def light():
        results = calibrate(model, out / "prepared.png", camera, placement)
        setting = choose(results)
        bake(model, setting)
        return results, setting

    lighting, setting = stage("lighting", light)
    manifest["material"] = {k: setting[k] for k in ("emissive", "roughness", "specular")}
    manifest["viewer"] = {"environment-image": "neutral", "exposure": 1, "tone-mapping": setting["tone_mapping"]}
    manifest["bytes"]["model"] = model.stat().st_size
    (out / "web" / f"{args.name}.json").write_text(json.dumps(manifest, indent=2))

    shipped = load_for_check(out / "simplified.glb", placement)
    qa, view, lit = stage("qa", lambda: check(shipped, prepared, camera, fit, model, texture))
    # Reported, not gated: the lighting step already picks the best setting by
    # measurement, and the error's floor depends on how fine the texture is
    # (resampling noise), so no single threshold is fair to every object.
    # Shading problems that matter are gated by shading_roughness.
    default = next(r for r in lighting if r["emissive"] == 0.0 and r["roughness"] == 0.35 and r["specular"] == 1.0)
    qa["lit_error"] = setting["error"]
    qa["lit_error_default_material"] = default["error"]
    view.save(out / "qa-view.png")
    lit.save(out / "qa-lit.png")

    report = {
        "qa": qa,
        "web": manifest,
        "camera": vars(camera),
        "extra_cameras": [vars(c) if c else None for c in extra_cameras],
        "lighting": lighting,
        **stats,
        "seconds": timings,
    }
    (out / "report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps({"qa": qa, "web": manifest, "seconds": timings}, indent=2))
    if not qa["passed"]:
        print(f"quality gate FAILED; see {out / 'report.json'}", file=sys.stderr)
        sys.exit(1)
    print(f"quality gate passed; ship {out / 'web'}")


if __name__ == "__main__":
    main()
