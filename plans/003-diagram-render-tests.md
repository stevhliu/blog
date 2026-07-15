# Plan 003: Add a render-test harness covering every diagram component

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- mdx-diagrams.ts app/components/attention app/components/quantization app/components/transformers tests/ vitest.config.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

The ~38 bespoke SVG diagram components are the signature feature of this blog,
and none of them has any test. A diagram that throws on render surfaces only
during `next build` or in production, and any refactor of shared diagram code
(see plan 010) is flying blind. This plan adds a cheap, table-driven "every
diagram renders to SVG" harness that runs in `pnpm test` in milliseconds, with
no new dependencies and no DOM environment — `react-dom/server` renders these
server components to strings under plain node.

## Current state

- `mdx-diagrams.ts` — registers 38 diagram components via `next/dynamic`
  wrappers in an exported `diagramComponents` object. The *wrappers* are not
  directly renderable outside Next, so the harness imports the underlying
  component modules instead.
- Diagram component files live in exactly three directories:
  - `app/components/attention/*.tsx` (16 files)
  - `app/components/quantization/*.tsx` (8 files)
  - `app/components/transformers/*.tsx` (diagrams plus shared helpers)
- Every diagram/chart component is an exported function whose name ends in
  `Diagram` or `Chart` (e.g. `MHADiagram`, `WorkersVsLoadTimeChart`,
  `MixtralConversionDiagram`). Shared non-diagram exports exist in the same
  directories and must NOT be rendered standalone: e.g.
  `app/components/transformers/flow-primitives.tsx` exports `FlowNode`,
  `FlowArrow`, `GroupRegion`, `StepCounter` (SVG fragments, not full figures),
  and `app/components/transformers/loading-benchmark-data.ts` exports data.
  The `Diagram|Chart` name suffix cleanly separates the two groups.
- Diagrams are React server components (no `"use client"` in any diagram
  file); some wrap content in `FreezeSmilOnReducedMotion` from
  `app/components/freeze-smil.tsx`, which IS a client component using
  `useEffect`/`useRef` — `renderToStaticMarkup` handles that fine (hooks run,
  effects don't).
- `vitest.config.ts` (complete file):

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
});
```

  Note `include` only matches `*.test.ts` — the harness needs `.tsx` (it
  creates React elements), so the glob must be widened.
- Existing tests (`tests/atom.test.ts`, `tests/get-posts.test.ts`, etc.) are
  plain vitest `describe`/`it` with `@/` alias imports. Match that style.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `vitest.config.ts` (widen the include glob only)
- `tests/diagrams-render.test.tsx` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- Any diagram component file — if one fails to render, that is a FINDING to
  report, not something to fix in this plan.
- `mdx-diagrams.ts`, `mdx-components.ts` — plan 009 restructures the registry;
  this harness deliberately does not depend on it.
- No new dependencies. Do not add jsdom/happy-dom/testing-library.

## Git workflow

- Branch: `advisor/003-diagram-render-tests`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Widen the vitest include glob

In `vitest.config.ts`, change:

```ts
    include: ["tests/**/*.test.ts"],
```

to:

```ts
    include: ["tests/**/*.test.{ts,tsx}"],
```

**Verify**: `pnpm test` → existing 21 tests still pass.

### Step 2: Create the harness

Create `tests/diagrams-render.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Eagerly import every module in the three diagram directories and pick out
// the components whose names end in Diagram or Chart — that suffix is the
// repo's naming contract for full-figure diagram components (shared SVG
// fragments like FlowNode deliberately don't carry it).
const modules = {
  ...import.meta.glob("../app/components/attention/*.tsx", { eager: true }),
  ...import.meta.glob("../app/components/quantization/*.tsx", { eager: true }),
  ...import.meta.glob("../app/components/transformers/*.tsx", { eager: true }),
} as Record<string, Record<string, unknown>>;

const diagrams: Array<[string, ComponentType]> = [];
for (const [file, mod] of Object.entries(modules)) {
  for (const [name, value] of Object.entries(mod)) {
    if (/^[A-Z].*(Diagram|Chart)$/.test(name) && typeof value === "function") {
      diagrams.push([`${file} :: ${name}`, value as ComponentType]);
    }
  }
}

describe("diagram components", () => {
  it("discovers the full diagram set", () => {
    // 38 registered in mdx-diagrams.ts at the time this harness was written.
    // If you intentionally add/remove diagrams, this floor moves with you —
    // it exists to catch the glob silently matching nothing.
    expect(diagrams.length).toBeGreaterThanOrEqual(38);
  });

  it.each(diagrams)("%s renders to SVG markup", (_label, Component) => {
    const html = renderToStaticMarkup(createElement(Component));
    expect(html).toContain("<svg");
    expect(html.length).toBeGreaterThan(200);
  });
});
```

Notes for the executor:
- `import.meta.glob` is supported by vitest natively.
- If a component render throws, `it.each` reports that diagram by name — that
  is the harness working. Report the failing diagram; do not patch it here.
- If TypeScript complains about `import.meta.glob` types, add
  `/// <reference types="vite/client" />` at the top of the test file.

**Verify**: `pnpm test` → all pass; the run output shows ≥ 38 diagram render
cases plus the discovery test.

### Step 3: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

## Test plan

This plan IS the test plan. Structure: table-driven `it.each` over discovered
components, following the plain-vitest style of `tests/atom.test.ts`. Cases:
discovery floor (≥38), per-diagram render-without-throw + `<svg` presence +
non-trivial output length.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm test` exits 0 and the output lists ≥ 38 passing diagram render cases
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm build` exits 0
- [ ] `git status --porcelain` shows changes only to `vitest.config.ts`, `tests/diagrams-render.test.tsx`, `plans/README.md`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any diagram fails to render — report the component name and error verbatim.
  (That's a real bug this harness just found; it gets its own fix, not an
  in-plan patch.)
- `renderToStaticMarkup` errors on the `FreezeSmilOnReducedMotion` wrapper
  (client-component boundary issue) — report rather than adding a DOM shim.
- Fewer than 38 components are discovered — the naming-contract assumption
  (`Diagram|Chart` suffix) is wrong; list what the glob found and stop.

## Maintenance notes

- New diagrams are covered automatically as long as they live in one of the
  three directories and end in `Diagram`/`Chart` — keep that contract.
- Plan 010 (SVG boilerplate dedup) builds directly on this harness by
  snapshotting the rendered markup before/after its refactor.
- The `toBeGreaterThanOrEqual(38)` floor should be bumped as the collection
  grows; it's a tripwire, not a census.
