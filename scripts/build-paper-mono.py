#!/usr/bin/env python3
"""Build the self-hosted Paper Mono WOFF2 used by code blocks.

Paper Mono (https://github.com/paper-design/paper-mono) is not on npm, so the
source TTF is passed in by path:

    python3 scripts/build-paper-mono.py ~/Library/Fonts/PaperMono[wght].ttf

The output keeps the weight axis between 400 and 700 (code blocks only use
regular and bold) and the characters code tends to contain: ASCII, Latin-1,
common punctuation, arrows and box drawing.
"""
import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "fonts" / "paper-mono.woff2"

UNICODES = (
    set(range(0x0020, 0x007F))  # ASCII
    | set(range(0x00A0, 0x0100))  # Latin-1
    | set(range(0x2010, 0x2028))  # dashes, quotes, ellipsis
    | set(range(0x2190, 0x2200))  # arrows
    | set(range(0x2500, 0x2580))  # box drawing
)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    # Subset before limiting the axis: the instancer leaves gvar in a state
    # the subsetter can't read.
    font = TTFont(sys.argv[1], lazy=False)

    options = Options()
    options.layout_features = ["*"]
    options.drop_tables += ["meta"]
    subsetter = Subsetter(options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)

    font = instantiateVariableFont(font, {"wght": (400, 400, 700)})

    font.flavor = "woff2"
    font.save(OUT)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
