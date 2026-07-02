import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const CYCLE_SECONDS = 10;
const FPS = 12;
const FRAME_COUNT = CYCLE_SECONDS * FPS;
const FRAME_DELAY_MS = 1000 / FPS;
const OUTPUT = "/Users/steven/Desktop/cuda-allocator-diagram.gif";
const FRAMES_DIR = join("/tmp", "cuda-allocator-gif-frames");
const URL =
  "http://localhost:3000/2026/transformers-compendium-2#CUDA-caching-allocator-warmup";

rmSync(FRAMES_DIR, { recursive: true, force: true });
mkdirSync(FRAMES_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 960, height: 720 },
  deviceScaleFactor: 2,
});

await page.emulateMedia({ colorScheme: "light" });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector('svg[aria-label*="CUDA allocator"]');
await page.evaluate(() => document.fonts.ready);

const diagram = page.locator('svg[aria-label*="CUDA allocator"]');
await diagram.scrollIntoViewIfNeeded();

// Reload so SMIL animations start at t = 0 for a clean loop.
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector('svg[aria-label*="CUDA allocator"]');
await page.evaluate(() => document.fonts.ready);
await diagram.scrollIntoViewIfNeeded();

const start = Date.now();
for (let i = 0; i < FRAME_COUNT; i++) {
  const target = start + i * FRAME_DELAY_MS;
  const wait = target - Date.now();
  if (wait > 0) {
    await page.waitForTimeout(wait);
  }

  const framePath = join(
    FRAMES_DIR,
    `frame-${String(i).padStart(4, "0")}.png`,
  );
  await diagram.screenshot({ path: framePath });
}

await browser.close();

execFileSync(
  "python3",
  [
    join(import.meta.dirname, "assemble-gif.py"),
    FRAMES_DIR,
    OUTPUT,
    String(Math.round(FRAME_DELAY_MS)),
  ],
  { stdio: "inherit" },
);

rmSync(FRAMES_DIR, { recursive: true, force: true });
