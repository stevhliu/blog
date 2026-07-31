// Captures the home page's dancing cat (pose A) plus its colored ♪ notes as
// transparent PNGs for the post OG cards. Run the dev server first, then:
//
//   node scripts/shoot-dancing-cat.mjs
//
// Satori has no system font fallback and Geist carries no ♪ glyph, so the notes
// have to arrive as images the same way the cat does.
//
// Uses the system Chrome so no Playwright browser download is needed.
import { writeFileSync } from "fs";
import { chromium } from "playwright";

const OUT_DIR = process.argv[2] ?? "public/images";
const URL = process.argv[3] ?? "http://localhost:3030/";

// Matches NOTE_COLORS in app/ascii-cat.tsx.
const NOTES = [
  { name: "note-blue", color: "#64c6ff" },
  { name: "note-green", color: "#00c978" },
  { name: "note-pink", color: "#ff58ae" },
];

// The pose puts a lone ♪ far off each side of the cat. Ink runs separated by
// more than this many pixels count as a different glyph cluster and get cropped
// away, so the saved cat tile has no wide empty margins.
const CLUSTER_GAP = 60;

// Crops a screenshot to its widest ink cluster. Runs in-page because canvas is
// the only image decoder available here.
async function cropToInk(page, shot, gap) {
  return page.evaluate(
    async ([base64, gapPx]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${base64}`;
      await img.decode();

      const src = document.createElement("canvas");
      src.width = img.naturalWidth;
      src.height = img.naturalHeight;
      const sctx = src.getContext("2d");
      sctx.drawImage(img, 0, 0);
      const { data } = sctx.getImageData(0, 0, src.width, src.height);

      const inked = (x, y) => data[(y * src.width + x) * 4 + 3] > 20;
      const cols = Array.from({ length: src.width }, (_, x) => {
        for (let y = 0; y < src.height; y++) if (inked(x, y)) return true;
        return false;
      });

      const runs = [];
      cols.forEach((on, x) => {
        if (!on) return;
        const last = runs[runs.length - 1];
        if (last && x - last[1] <= gapPx) last[1] = x;
        else runs.push([x, x]);
      });
      const [x0, x1] = runs.sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0];

      let y0 = src.height;
      let y1 = -1;
      for (let y = 0; y < src.height; y++) {
        for (let x = x0; x <= x1; x++) {
          if (inked(x, y)) {
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
            break;
          }
        }
      }

      const out = document.createElement("canvas");
      out.width = x1 - x0 + 1;
      out.height = y1 - y0 + 1;
      out
        .getContext("2d")
        .drawImage(src, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
      return {
        width: out.width,
        height: out.height,
        base64: out.toDataURL("image/png").split(",")[1],
      };
    },
    [shot.toString("base64"), gap]
  );
}

const browser = await chromium.launch({ channel: "chrome" });
// reducedMotion pins the cat on pose A, so the capture never lands mid-swap.
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 3,
  colorScheme: "light",
  reducedMotion: "reduce",
});
await page.goto(URL, { waitUntil: "networkidle" });
const cat = page.locator("pre.ascii-cat");
await cat.waitFor();
// omitBackground only yields real transparency if nothing paints a backdrop,
// and the page sets one on the html/body/wrapper chain.
await cat.evaluate(el => {
  for (let n = el; n; n = n.parentElement) {
    n.style.setProperty("background", "transparent", "important");
    n.style.setProperty("background-color", "transparent", "important");
  }
});
await page.waitForTimeout(150);

const catPng = await cropToInk(page, await cat.screenshot({ omitBackground: true }), CLUSTER_GAP);
writeFileSync(`${OUT_DIR}/dancing-cat.png`, Buffer.from(catPng.base64, "base64"));
console.log(`wrote ${OUT_DIR}/dancing-cat.png (${catPng.width}x${catPng.height})`);

// One ♪ per color, rendered big so the card can scale it down cleanly.
for (const { name, color } of NOTES) {
  await page.evaluate(
    ([noteColor]) => {
      document.querySelector("#og-note")?.remove();
      const el = document.createElement("pre");
      el.id = "og-note";
      el.className = "ascii-cat";
      el.textContent = "♪";
      el.style.setProperty("color", noteColor, "important");
      el.style.setProperty("font-size", "96px", "important");
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("position", "fixed");
      el.style.setProperty("top", "0");
      el.style.setProperty("left", "0");
      document.body.appendChild(el);
    },
    [color]
  );
  const note = page.locator("#og-note");
  await note.waitFor();
  const png = await cropToInk(page, await note.screenshot({ omitBackground: true }), CLUSTER_GAP);
  writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(png.base64, "base64"));
  console.log(`wrote ${OUT_DIR}/${name}.png (${png.width}x${png.height})`);
}

await browser.close();
