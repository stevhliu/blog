# Web font subsets

The site uses variable Geist Sans and Geist Mono fonts from the `geist` package. The `.ttf` files beside this README are used to make Open Graph images on the server; web pages do not download them. The four files in `public/fonts` are the web fonts.

## Regenerate by hand

After changing post text, component text, font styles, routes, or the `geist` package version, start the site with `pnpm dev` and run:

```sh
node scripts/subset-fonts.mjs
```

The script visits the index, About page, and every post listed in `app/posts.json`, reads rendered text and styles, and writes new font files, CSS, page font profiles, and `fonts/usage.json`. It does not run during install or build. It needs Playwright with a Chromium browser and Python FontTools with Brotli support. Set `FONT_BASE_URL` or `CHROME_PATH` if the local site or browser uses a different location.

Review the new files and rerun the same visual comparison used for this change before committing them. Commit the generated files with the content or style change that required them. The generated `app/font-profile.generated.ts` maps each post to the extended faces it needs. The website preloads only the two core files. Pages that need an extended character use one complete extended face for that font family, so kerning still works across accented text. Those larger files include the core glyphs too and are enabled only on pages that need them.

`fonts/usage.json` is replaced each time the manual script runs.
