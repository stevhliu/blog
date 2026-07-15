# Plan 007: Load Shiki fine-grained (three grammars, not the full bundle)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- app/components/snippet.tsx package.json tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

`app/components/snippet.tsx` imports `codeToHtml` from the top-level `shiki`
entry, which registers every bundled grammar and theme — multi-megabytes of
grammar JSON/WASM in the server/build bundle — while the site only ever
highlights `python`, `yaml`, and `json` with two locally committed themes.
Switching to Shiki's fine-grained core API keeps highlighting identical and
drops the unused grammars from the bundle.

## Current state

- `app/components/snippet.tsx` (lines 1-22) — the only Shiki usage in the repo
  (`grep -rn "shiki" app/ --include="*.tsx" --include="*.ts"` confirms):

```tsx
import { cache } from "react";
import { codeToHtml } from "shiki";
import type { ThemeRegistration } from "shiki";
import pierreLight from "./themes/pierre-light.json";
import pierreDark from "./themes/pierre-dark.json";

type SupportedLanguage = "python" | "yaml" | "json";

const THEMES = {
  light: pierreLight as unknown as ThemeRegistration,
  dark: pierreDark as unknown as ThemeRegistration,
};

export const highlightCode = cache(async function highlightCode(
  code: string,
  lang: SupportedLanguage = "python"
) {
  return codeToHtml(code, { lang, themes: THEMES, defaultColor: false });
});
```

  The rest of the file (`Snippet` component) consumes `highlightCode` and must
  not change. Dual-theme output relies on `themes: {light, dark}` +
  `defaultColor: false` emitting `--shiki-light`/`--shiki-dark` CSS variables
  that `app/globals.css` switches on — preserve those options exactly.

- `package.json` has `"shiki": "^3.23.0"` in dependencies. pnpm uses isolated
  `node_modules`, so **transitive** packages (`@shikijs/langs`,
  `@shikijs/engine-oniguruma`, etc.) cannot be imported without declaring them
  as direct dependencies.

- Shiki v3 fine-grained API shape:

```ts
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import langPython from "@shikijs/langs/python";
import langYaml from "@shikijs/langs/yaml";
import langJson from "@shikijs/langs/json";

const highlighter = await createHighlighterCore({
  themes: [lightTheme, darkTheme],
  langs: [langPython, langYaml, langJson],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
highlighter.codeToHtml(code, { lang, themes: { light, dark }, defaultColor: false });
```

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Install   | `pnpm install`   | exit 0              |
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `app/components/snippet.tsx` (the import/highlighter block only)
- `package.json` + `pnpm-lock.yaml` (add `@shikijs/langs` and `@shikijs/engine-oniguruma` as direct dependencies, versions aligned with the installed shiki 3.x)
- `tests/snippet-highlight.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `app/components/themes/pierre-light.json` / `pierre-dark.json` — themes are
  correct as committed.
- `app/globals.css` — the `--shiki-light`/`--shiki-dark` switching is correct.
- `app/components/code.tsx` (inline code, no Shiki) and any MDX content.

## Git workflow

- Branch: `advisor/007-shiki-fine-grained-bundle`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish"). One commit.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Capture a before-output sample

Write a throwaway script (do not commit it) that imports `highlightCode` and
prints `await highlightCode("x = 1", "python")`. Run with
`pnpm exec tsx` if available, otherwise inline the equivalent through vitest
by writing Step 3's test first against the OLD code. Save the output string —
it is the parity target for Step 3. (If neither path is workable, skip this
step and rely on Step 3's structural assertions plus a visual check.)

### Step 2: Switch to the fine-grained highlighter

- `pnpm add @shikijs/langs @shikijs/engine-oniguruma` (they will resolve to
  the 3.x line matching the installed shiki).
- In `app/components/snippet.tsx`, replace the import/highlighter block with:

```tsx
import { cache } from "react";
import { createHighlighterCore, type HighlighterCore, type ThemeRegistration } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import langPython from "@shikijs/langs/python";
import langYaml from "@shikijs/langs/yaml";
import langJson from "@shikijs/langs/json";
import pierreLight from "./themes/pierre-light.json";
import pierreDark from "./themes/pierre-dark.json";

type SupportedLanguage = "python" | "yaml" | "json";

const THEMES = {
  light: pierreLight as unknown as ThemeRegistration,
  dark: pierreDark as unknown as ThemeRegistration,
};

let highlighterPromise: Promise<HighlighterCore> | null = null;
function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [THEMES.light, THEMES.dark],
    langs: [langPython, langYaml, langJson],
    engine: createOnigurumaEngine(import("shiki/wasm")),
  });
  return highlighterPromise;
}

export const highlightCode = cache(async function highlightCode(
  code: string,
  lang: SupportedLanguage = "python"
) {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
  });
});
```

Keep the module-level singleton (`highlighterPromise`) — `react.cache` scopes
per-request, the singleton scopes per-process.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Parity test

Create `tests/snippet-highlight.test.ts` (plain vitest, node env — the
highlighter runs fine in node):

```ts
import { describe, expect, it } from "vitest";
import { highlightCode } from "@/app/components/snippet";

describe("highlightCode", () => {
  it("emits dual-theme shiki markup for python", async () => {
    const html = await highlightCode("x = 1", "python");
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  });

  it("highlights yaml and json", async () => {
    expect(await highlightCode("a: 1", "yaml")).toContain("<pre");
    expect(await highlightCode('{"a":1}', "json")).toContain("<pre");
  });
});
```

If Step 1 captured a before-string, also compare: the after-output for the
same input should be byte-identical (same tokens, same CSS vars). If it
differs only in class ordering/attribute noise, report the diff — do not
weaken the structural assertions.

Note: `tests/**/*.test.ts` is already matched by the vitest `include` glob.
Importing `snippet.tsx` pulls React but renders nothing — fine under node.

**Verify**: `pnpm test` → all pass.

### Step 4: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

Optional (report-only): compare `du -sh .next` before/after this plan for the
bundle-size delta.

## Test plan

Step 3: structural assertions on the highlighter output for all three
languages plus dual-theme CSS variables — this is what globals.css depends on.
Pattern: plain vitest like `tests/atom.test.ts`.

## Done criteria

- [ ] `grep -n 'from "shiki"' app/components/snippet.tsx` → no match (only `shiki/core`, `shiki/engine/oniguruma`, `shiki/wasm` subpaths remain)
- [ ] `pnpm test` exits 0 including `tests/snippet-highlight.test.ts`
- [ ] `pnpm build` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `@shikijs/langs` / `@shikijs/engine-oniguruma` resolve to a major version
  different from the installed `shiki` 3.x line.
- The output HTML for `highlightCode("x = 1", "python")` loses the
  `--shiki-light`/`--shiki-dark` variables (theme switching would silently
  break site-wide).
- `pnpm build` fails on the `import("shiki/wasm")` dynamic import (bundler
  handling differs) — report; a known alternative is the JavaScript regex
  engine (`shiki/engine/javascript`), but switching engines changes
  correctness characteristics and needs operator sign-off.

## Maintenance notes

- Adding a new snippet language = one `@shikijs/langs/<lang>` import + adding
  it to `SupportedLanguage` and the `langs` array. The type union keeps MDX
  authors honest.
- If a future Next/Turbopack version complains about the wasm import, the
  JavaScript engine (`createJavaScriptRegexEngine`) is the documented fallback.
