// Run by hand after changing visible site text or typography. Start the site
// first, then run: node scripts/subset-fonts.mjs
// Set FONT_BASE_URL and CHROME_PATH when using different local settings.
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = process.env.FONT_BASE_URL ?? "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH;
const posts = JSON.parse(fs.readFileSync(path.join(root, "app/posts.json"), "utf8")).posts;
const routes = ["/", "/about", ...posts.map(post => `/${new Date(`${post.date} UTC`).getUTCFullYear()}/${post.id}`)];

const browser = await chromium.launch({ headless: true, ...(chromePath ? { executablePath: chromePath } : {}) });
const usage = { pages: [], fonts: { sans: { chars: [], weights: [] }, mono: { chars: [], weights: [] } } };

for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 1365, height: 1100 }, deviceScaleFactor: 1 });
  const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle" });
  if (!response?.ok()) throw new Error(`Could not load ${route}: ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => {
    const familyUsage = { sans: { chars: new Set(), weights: new Set() }, mono: { chars: new Set(), weights: new Set() } };
    const preloads = [...document.querySelectorAll('link[rel="preload"][as="font"]')].map(link => new URL(link.href).pathname);
    const hyphens = new Set();
    const features = new Set();
    const styles = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const element = node.parentElement;
      if (!element || element.closest("script,style")) continue;
      const style = getComputedStyle(element);
      hyphens.add(style.hyphens);
      const family = style.fontFamily.toLowerCase();
      const firstFamily = family.split(",")[0].trim().replace(/[\"']/g, "");
      const key = firstFamily.startsWith("geistmono") ? "mono" : firstFamily.startsWith("geistsans") ? "sans" : null;
      if (!key) continue;
      for (const character of node.textContent ?? "") familyUsage[key].chars.add(character.codePointAt(0));
      familyUsage[key].weights.add(Number(style.fontWeight));
      styles.add(`${key}: font-style ${style.fontStyle}, weight ${style.fontWeight}`);
      features.add(`${style.fontFeatureSettings}; font-variant-numeric ${style.fontVariantNumeric}`);
    }
    return {
      title: document.title,
      preloads,
      fontResources: performance.getEntriesByType("resource")
        .filter(entry => /\.woff2(?:$|\?)/.test(entry.name))
        .map(entry => ({ url: new URL(entry.name).pathname, bytes: entry.transferSize, decodedBytes: entry.decodedBodySize })),
      usage: Object.fromEntries(Object.entries(familyUsage).map(([key, value]) => [key, {
        chars: [...value.chars].sort((a, b) => a - b), weights: [...value.weights].sort((a, b) => a - b),
      }])),
      hyphens: [...hyphens], features: [...features], styles: [...styles].sort(),
    };
  });
  usage.pages.push({ route, ...result });
  for (const family of ["sans", "mono"]) {
    usage.fonts[family].chars.push(...result.usage[family].chars);
    usage.fonts[family].weights.push(...result.usage[family].weights);
  }
  await page.close();
}

await browser.close();
for (const family of ["sans", "mono"]) {
  usage.fonts[family].chars = [...new Set(usage.fonts[family].chars)].sort((a, b) => a - b);
  usage.fonts[family].weights = [...new Set(usage.fonts[family].weights)].sort((a, b) => a - b);
}

fs.writeFileSync(path.join(root, "fonts/usage.json"), `${JSON.stringify(usage, null, 2)}\n`);
const result = spawnSync("python3", [path.join(root, "scripts/subset-fonts.py"), path.join(root, "fonts/usage.json")], {
  cwd: root, stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);
