from pathlib import Path
import sys

from PIL import Image


def flatten_frame(path: Path) -> Image.Image:
    frame = Image.open(path).convert("RGBA")
    return Image.alpha_composite(
        Image.new("RGBA", frame.size, (255, 255, 255, 255)),
        frame,
    ).convert("RGB")


def main() -> None:
    frames_dir = Path(sys.argv[1])
    output = Path(sys.argv[2])
    frame_delay_ms = int(sys.argv[3])

    files = sorted(frames_dir.glob("frame-*.png"))
    if not files:
        raise SystemExit("No frames captured")

    merged: list[tuple[Image.Image, int]] = []
    for path in files:
        frame = flatten_frame(path)
        if merged and frame.tobytes() == merged[-1][0].tobytes():
            image, duration = merged[-1]
            merged[-1] = (image, duration + frame_delay_ms)
        else:
            merged.append((frame, frame_delay_ms))

    images = [image for image, _ in merged]
    durations = [duration for _, duration in merged]

    palette = images[0].convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
    encoded = [image.quantize(palette=palette) for image in images]

    encoded[0].save(
        output,
        save_all=True,
        append_images=encoded[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )

    total_ms = sum(durations)
    print(
        f"Wrote {len(encoded)} frames ({total_ms} ms) from {len(files)} captures to {output}",
    )


if __name__ == "__main__":
    main()
