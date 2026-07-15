# Plan 001: Fix image alt/caption parsing so plain alt text renders and captions appear

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- app/components/image.tsx tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

The MDX `Image` component parses the `alt` prop with a regex that only matches
strings ending in a space or a ` [N%]` size suffix. Every ordinary alt string
(`alt="Deathwing"`, `alt="Llama model doc"`) fails the match, so the image
renders with `alt=""` (a screen-reader accessibility regression) and the
`<Caption>` derived from the alt is silently dropped. This affects real images
in published posts today, not an edge case.

## Current state

- `app/components/image.tsx` — the only file with the bug. The parsing block
  as it exists today (lines 22–30):

```tsx
  if ("string" === typeof originalAlt) {
    const match = originalAlt.match(/(.*) (\[(\d+)%\])?$/);
    if (match != null) {
      alt = match[1];
      dividedBy = match[3] ? parseInt(match[3]) : 100;
    }
  } else {
    alt = originalAlt ?? null;
  }
```

  The regex has a **mandatory space** before the *optional* `[N%]` group, so
  `"My caption"` does not match at all (`match == null`), leaving `alt` as
  `null`. Downstream, `alt ?? ""` becomes the rendered alt attribute (lines
  45, 61) and `{alt && <Caption>{alt}</Caption>}` (lines 52, 67) never renders.
  Only strings like `"My caption [50%]"` (intended: render at 50% width) or
  strings with a trailing space currently parse.

- Intended behavior (from the code's structure): the alt doubles as the visible
  caption, and an optional trailing ` [N%]` token scales the image to N% width
  and must be stripped from the visible alt/caption.

- Repo conventions: pure logic is extracted into small exported functions and
  unit-tested under `tests/*.test.ts` with vitest in a node environment — see
  `app/atom/feed.ts` (exports `escapeXml`, `toRfc3339`) tested by
  `tests/atom.test.ts`. Match that pattern.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Install   | `pnpm install`   | exit 0              |
| Typecheck | `pnpm typecheck` | exit 0, no errors   |
| Tests     | `pnpm test`      | all pass            |
| Lint      | `pnpm lint`      | exit 0              |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `app/components/image.tsx`
- `tests/image-alt.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `app/components/caption.tsx` — rendering is correct; the bug is parsing only.
- Any `posts/*.mdx` content — do not "fix" alt strings to match the broken regex.
- `app/components/figure.tsx` — unrelated despite the name.

## Git workflow

- Branch: `advisor/001-fix-image-alt-caption-parsing`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish"). One commit is fine.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract and fix the parser

In `app/components/image.tsx`, add an exported pure function and use it:

```tsx
export function parseImageAlt(originalAlt: string): {
  alt: string;
  percent: number;
} {
  const match = originalAlt.match(/^(.*?)(?:\s*\[(\d+)%\])?\s*$/);
  const alt = (match?.[1] ?? originalAlt).trim();
  const percent = match?.[2] ? parseInt(match[2], 10) : 100;
  return { alt, percent };
}
```

Replace the lines 19–30 block so that:

```tsx
  let alt: string | null = null;
  let dividedBy = 100;

  if ("string" === typeof originalAlt) {
    const parsed = parseImageAlt(originalAlt);
    alt = parsed.alt || null;
    dividedBy = parsed.percent;
  } else {
    alt = originalAlt ?? null;
  }
```

Keep everything else in the file unchanged (the `isDataImage` branch, the
`factor` computation, both render branches).

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Add unit tests

Create `tests/image-alt.test.ts`, modeled structurally on `tests/atom.test.ts`
(plain `describe`/`it`/`expect` from vitest, import via the `@/` alias):

Cases to cover (exact expectations):
- `parseImageAlt("My caption")` → `{ alt: "My caption", percent: 100 }` (the regression this plan fixes)
- `parseImageAlt("My caption [50%]")` → `{ alt: "My caption", percent: 50 }`
- `parseImageAlt("Deathwing")` → `{ alt: "Deathwing", percent: 100 }`
- `parseImageAlt("trailing space ")` → `{ alt: "trailing space", percent: 100 }`
- `parseImageAlt("has [brackets] inside")` → `{ alt: "has [brackets] inside", percent: 100 }`
- `parseImageAlt("")` → `{ alt: "", percent: 100 }`

**Verify**: `pnpm test` → all pass, including 6 new assertions in `tests/image-alt.test.ts`.

### Step 3: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

## Test plan

Covered in Step 2. No component-render test is required here (the render
branches are unchanged; only the parse result feeding them changes). The
node-environment vitest setup (`vitest.config.ts`, `environment: "node"`)
supports pure-function tests without any config change.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm test` exits 0; `tests/image-alt.test.ts` exists and passes
- [ ] `node -e "const s='My caption'; const m=s.match(/^(.*?)(?:\s*\[(\d+)%\])?\s*$/); console.log(JSON.stringify(m[1]))"` prints `"My caption"` (sanity-check of the pattern used)
- [ ] `pnpm build` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The parsing block in `app/components/image.tsx` no longer matches the
  "Current state" excerpt (someone fixed or changed it already).
- Any existing test fails after Step 1 (would indicate something depends on
  the old null-alt behavior).
- You find MDX posts that rely on alt strings ending in ` [N%]` where the
  caption should *keep* the suffix — that contradicts this plan's assumption
  that the suffix is always a size directive to strip.

## Maintenance notes

- The alt string is doing double duty (accessibility text + visible caption +
  size directive). If a future change wants captions independent of alt, add a
  separate `caption` prop rather than growing this mini-syntax.
- Reviewer should eyeball one published post with images (e.g. any post using
  `<Image ... alt="...">`) in the dev server and confirm captions now appear
  under images — this is the one user-visible change.
