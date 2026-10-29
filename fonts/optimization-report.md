# Web font optimization report

Measured on 2026-10-29 in Chrome at 1365 × 1100 CSS pixels, device scale 1, with a fixed clock and motion disabled. The scan covered `/`, `/about`, and all seven posts in `app/posts.json`. `initial-measurement.json` keeps the original per-page character, style, preload, and network records.

## Original fonts

The site sent the package's two variable WOFF2 files on every page. These files match the source files byte for byte.

| Web font | File bytes | Glyphs | Variable axes | GSUB features | GPOS features | Hinting |
| --- | ---: | ---: | --- | --- | --- | --- |
| Geist Sans variable WOFF2 | 58,512 | 649 | `wght` 100–900, default 400 | `aalt`, `case`, `ccmp`, `dlig`, `dnom`, `frac`, `liga`, `locl`, `numr`, `ordn`, `pnum`, `sinf`, `ss01`–`ss09`, `subs`, `sups`, `tnum` | `kern`, `mark`, `mkmk` | None |
| Geist Mono variable WOFF2 | 58,092 | 652 | `wght` 100–900, default 400 | `aalt`, `case`, `ccmp`, `dnom`, `frac`, `liga`, `locl`, `numr`, `ordn`, `sinf`, `ss01`–`ss04`, `ss06`–`ss09`, `subs`, `sups` | `mark`, `mkmk` | None |

The repository also has five static TTFs used by the server to make Open Graph images. Pages do not download them. They have no variable axes and no hinting.

| Static file | File bytes | Glyphs |
| --- | ---: | ---: |
| `geist-light.ttf` | 71,364 | 649 |
| `geist-regular.ttf` | 71,112 | 649 |
| `geist-medium.ttf` | 72,132 | 649 |
| `geist-bold.ttf` | 71,804 | 649 |
| `geist-mono-regular.ttf` | 69,936 | 652 |

The four Sans TTFs have the Sans GSUB features above; Light lacks `ss05`. They have `kern`, `mark`, and `mkmk`. Mono has the Mono GSUB features above and `mark`, `mkmk`.

## What the pages use

Rendered text uses Sans weights 400, 500, 600, and 700, and Mono weights 400, 500, 600, and 650. Italic text uses browser-synthesized italics because the source has no italic face. No live page combines bold and italic; a temporary accented bold-italic sample was checked too.

The global CSS turns `liga` off. Archive dates and counts use tabular numbers, so Sans keeps `tnum`. Browser shaping also enables `ccmp`, `locl`, `kern`, `mark`, and `mkmk` where the font has matching glyphs; the subset keeps only lookups needed by its glyphs. The source fonts contain no hinting instructions. Computed `hyphens` is `manual` throughout, so there is no automatic hyphenation use of U+2010.

The text scan found 119 Sans and 106 Mono Unicode characters across the nine pages. The subsets keep the source-supported Latin-1 and Latin Extended-A glyphs as well. Unsupported CJK characters continue to use the same system fonts. The index character art uses a mixture of Geist Mono, Hiragino Sans, Menlo, and PingFang SC before and after.

The fonts still use the original `font-display: swap` behavior and fallback stacks. Sans keeps the generated Arial fallback and its `size-adjust` and metric overrides. Mono keeps its original system monospace stack.

## Generated web fonts

| File | File bytes | Glyphs | `wght` axis in file | Retained layout features | Hinting |
| --- | ---: | ---: | --- | --- | --- |
| `geist-sans-core.woff2` | 10,136 | 102 | 400–700 | GSUB `locl`, `tnum`; GPOS `kern` | None |
| `geist-sans-extended.woff2` | 18,740 | 327 | 400–700 | GSUB `locl`, `tnum`; GPOS `kern` | None |
| `geist-mono-core.woff2` | 8,144 | 102 | 400–650 | GSUB `locl` | None |
| `geist-mono-extended.woff2` | 14,856 | 314 | 400–650 | GSUB `locl` | None |

The core files contain ASCII plus curly quotes, en and em dashes, and ellipsis. The extended files contain those same core glyphs, the source-supported Latin-1 and Latin Extended-A glyphs, and characters used on the pages. Every CSS `unicode-range` lists only codepoints in that file. No Reserved Font Name is declared in the Geist OFL license, so the internal family name stays Geist. The license is included at `public/fonts/OFL.txt`.

The extended files repeat the core glyphs. A disjoint split caused kerning to stop at a boundary between an ASCII letter and an accented letter. The page profile now switches that page's text to one complete face when it needs an extended character. This keeps kerning intact; the duplicate glyphs cost about 9.7 KB across the two extended files compared with a disjoint split. The CSS family weight ranges, and the font axes themselves, are limited to the weights found on the pages.

## Bytes sent per page

Before, both full fonts were preloaded on every page, for 117,204 transferred bytes including 300 bytes of response overhead per font. After, both core files are preloaded. The extended files load only for a page and family that needs them. The table reports actual transfer bytes, including that same response overhead.

| Page | Before | After Sans | After Mono | After total | Saved |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 117,204 | 10,436 | 23,600 | 34,036 | 70.96% |
| `/about` | 117,204 | 29,476 | 23,600 | 53,076 | 54.72% |
| `/2026/how-transformers-standardize-models` | 117,204 | 29,476 | 23,600 | 53,076 | 54.72% |
| `/2026/transformers-loading-pipeline` | 117,204 | 10,436 | 23,600 | 34,036 | 70.96% |
| `/2025/attention-please` | 117,204 | 29,476 | 8,444 | 37,920 | 67.65% |
| `/2025/sonoma-in-ai` | 117,204 | 29,476 | 8,444 | 37,920 | 67.65% |
| `/2025/hf-universe` | 117,204 | 29,476 | 8,444 | 37,920 | 67.65% |
| `/2025/model-docs-design` | 117,204 | 10,436 | 8,444 | 18,880 | 83.89% |
| `/2024/redesigning-the-transformers-documentation` | 117,204 | 29,476 | 8,444 | 37,920 | 67.65% |

The core preload is Sans 10,436 bytes and Mono 8,444 bytes. Extended Sans is 19,040 transferred bytes; extended Mono is 15,156 transferred bytes.

## Pixel comparison

The original and optimized pages had the same visible text, page heights, and line counts at the test viewport. Text box vertical positions and heights matched. Horizontal text box measurements differed by at most 0.094 CSS pixels, below a tenth of a pixel. The bold-italic accented sample differed by 0.016 CSS pixels in width.

| Page | Screenshot pixels changed | Largest channel difference |
| --- | ---: | ---: |
| `/` | 14,148 | 151 |
| `/about` | 7,383 | 161 |
| `/2026/how-transformers-standardize-models` | 451,951 | 148 |
| `/2026/transformers-loading-pipeline` | 596,779 | 148 |
| `/2025/attention-please` | 331,984 | 72 |
| `/2025/sonoma-in-ai` | 331,734 | 148 |
| `/2025/hf-universe` | 240,937 | 122 |
| `/2025/model-docs-design` | 101,505 | 100 |
| `/2024/redesigning-the-transformers-documentation` | 157,194 | 151 |

The changed pixels are around letter edges. Side-by-side captures showed no changed content, wrapping, or placement. The remaining differences are sub-pixel font rasterization and rounding.
