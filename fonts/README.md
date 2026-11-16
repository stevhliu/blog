# Web font subsets

The site uses the variable Allo font for body text and Geist Mono from the `geist` package for UI mono. Code in posts uses Paper Mono, which is built separately by `scripts/build-paper-mono.py`. Allo's source (`allo/AlloVariableFriendly.woff2`, roundness fixed at Friendly) and license are vendored from https://allo.joshpuckett.me. It is also published to npm as `allo-font`, but the Hugging Face npm mirror wasn't serving it yet when it was added. Open Graph images are drawn on the server with `allo/Allo-Light.otf` and `allo/Allo-Medium.otf`, because the image renderer can't read WOFF2 or variable fonts; web pages do not download them. The `allo-*` and `geist-mono-*` files in `public/fonts` are the web fonts.

## Regenerate by hand

After changing post text, component text, font styles, routes, the vendored Allo file, or the `geist` package version, start the site with `pnpm dev` and run:

```sh
node scripts/subset-fonts.mjs
```

The script visits the index, About page, and every post listed in `app/posts.json`, reads rendered text and styles, and writes new font files, CSS, page font profiles, and `fonts/usage.json`. It does not run during install or build. It needs Playwright with a Chromium browser and Python FontTools with Brotli support. Set `FONT_BASE_URL` or `CHROME_PATH` if the local site or browser uses a different location.

Review the new files and rerun the same visual comparison used for this change before committing them. Commit the generated files with the content or style change that required them. The generated `app/font-profile.generated.ts` maps each post to the extended faces it needs. The website preloads only the two core files. Pages that need an extended character use one complete extended face for that font family, so kerning still works across accented text. Those larger files include the core glyphs too and are enabled only on pages that need them.

`fonts/usage.json` is replaced each time the manual script runs.
