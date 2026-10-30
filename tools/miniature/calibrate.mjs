// Lighting calibration: renders the shipped model in headless Chromium with
// <model-viewer> (the renderer the site uses) from the photo's camera, and
// scores each material setting against the photo. Called by
// miniature/lighting.py with one JSON argument:
//
//   {"root": dir to serve, "view": {...}, "models": [GLB paths under root]}
//
// with one GLB per material setting, and prints one score per model as JSON. Uses the blog's own Playwright install.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.resolve(import.meta.dirname, "../../package.json"));
const { chromium } = require("playwright");

const { root, view, models } = JSON.parse(process.argv[2]);
const types = { ".html": "text/html", ".glb": "model/gltf-binary", ".png": "image/png", ".js": "text/javascript" };

const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(root) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// The installed Google Chrome, so no separate browser download is needed.
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal", "--enable-gpu"] });
try {
  const page = await browser.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/calibrate.html`);
  await page.waitForFunction(() => window.ready === true);
  const results = await page.evaluate(
    ([v, g]) => window.calibrate(v, g),
    [{ ...view, photo: `${base}/${view.photo}` }, models.map(m => `${base}/${m}`)],
  );
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
  server.close();
}
