# Plan 009: Collapse the diagram registry boilerplate to one entry per diagram

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- mdx-diagrams.ts mdx-components.ts tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/003-diagram-render-tests.md (recommended — its harness verifies the underlying components independently of this registry)
- **Category**: dx
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

`mdx-diagrams.ts` is ~190 lines of the same pattern repeated 38 times: a
`const X = dynamic(() => import("...").then(mod => mod.X), { ssr: true })`
declaration plus a matching key in the exported `diagramComponents` object.
Every new diagram needs two hand-synced edits in this file, and forgetting one
half produces a silent gap (component defined but not exported, or vice
versa). Collapsing to a single loader map makes it one line per diagram and
impossible to half-register.

## Current state

- `mdx-diagrams.ts` — the repeated pattern (2 of 38 shown):

```ts
import dynamic from "next/dynamic";

const CausalDiagram = dynamic(
  () => import("./app/components/attention/causal-diagram").then(mod => mod.CausalDiagram),
  { ssr: true }
);
const MHADiagram = dynamic(
  () => import("./app/components/attention/mha-diagram").then(mod => mod.MHADiagram),
  { ssr: true }
);
// ... 36 more ...

export const diagramComponents = {
  CausalDiagram,
  MHADiagram,
  // ... 36 more keys ...
};
```

- Invariant that makes the collapse safe: **every registry key equals the
  named export in its module** (e.g. key `MLAAbsorbDiagram` ↔
  `export function MLAAbsorbDiagram` in `mla-wcombined-diagram.tsx`; the
  four `*ConversionDiagram` keys all come from
  `conversion-pipeline-diagrams.tsx`, each matching its export name). Verify
  this invariant while migrating — it held at planning time.

- `mdx-components.ts` consumes only the object: `...diagramComponents` spread
  into `useMDXComponents`. Its type expectation is
  `{ [component: string]: ComponentType }`-compatible. No per-diagram code
  there — it needs no changes.

- A build-verified fact (recorded in the audit): these diagrams are server
  components; `dynamic({ ssr: true })` provides no client code-splitting here.
  Keeping `dynamic()` is still fine (it's the current behavior; this plan
  changes shape, not semantics).

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `mdx-diagrams.ts`
- `tests/diagram-registry.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `mdx-components.ts` — the spread keeps working; don't restructure it.
- Any diagram component file.
- Do not switch to eager `import` statements (behavior change out of scope;
  see the audit's "considered and rejected" note).

## Git workflow

- Branch: `advisor/009-collapse-diagram-registry`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish"). One commit.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Snapshot the current key set

Before editing, extract the exact key list of `diagramComponents` (e.g.
`node --input-type=module -e "import('./mdx-diagrams.ts')..."` won't run on TS —
instead copy the keys manually from the object literal, or run
`grep -oE '^  [A-Za-z0-9]+,' mdx-diagrams.ts | tr -d ' ,' | sort`). Save the
sorted list — it becomes the test fixture in Step 3.

### Step 2: Rewrite `mdx-diagrams.ts`

Target shape (complete file structure; fill in all 38 entries with the same
paths currently in the `import()` calls):

```ts
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// One line per diagram: key = the module's named export (enforced by
// tests/diagram-registry.test.ts and the render harness).
const DIAGRAM_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {
  CausalDiagram: () => import("./app/components/attention/causal-diagram"),
  MHADiagram: () => import("./app/components/attention/mha-diagram"),
  // ... every current entry, key for key ...
  DeepSeekV3ConversionDiagram: () => import("./app/components/transformers/conversion-pipeline-diagrams"),
};

export const diagramComponents: Record<string, ComponentType> =
  Object.fromEntries(
    Object.entries(DIAGRAM_LOADERS).map(([name, load]) => [
      name,
      dynamic(async () => (await load())[name] as ComponentType, { ssr: true }),
    ])
  );
```

Every key from Step 1 must appear exactly once. Multi-export files (the four
conversion diagrams) simply repeat the same import path under different keys.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Registry test

Create `tests/diagram-registry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { diagramComponents } from "@/mdx-diagrams";

// The exact key set at migration time (from Step 1). Update deliberately when
// adding/removing diagrams — this test exists to catch accidental drops.
const EXPECTED_KEYS = [
  "AsymmetricQuantizationDiagram",
  // ... full sorted list from Step 1 ...
].sort();

describe("diagram registry", () => {
  it("exposes exactly the expected diagram set", () => {
    expect(Object.keys(diagramComponents).sort()).toEqual(EXPECTED_KEYS);
  });

  it("every entry is a component", () => {
    for (const [name, component] of Object.entries(diagramComponents)) {
      expect(component, name).toBeTypeOf("function");
    }
  });
});
```

Note: importing `mdx-diagrams.ts` pulls `next/dynamic` into a node test —
this works (dynamic returns a loadable component object without rendering).
If vitest fails on the import, see STOP conditions.

**Verify**: `pnpm test` → all pass, key count 38.

### Step 4: Render one post per family through the build

**Verify**: `pnpm build` → exit 0. Then confirm built HTML still contains
diagram SVGs: `grep -c "<svg" .next/server/app/2025/attention-please.html`
→ a number ≥ 10 (that post embeds many attention diagrams; exact path may
vary — any built post page with diagrams works).

## Test plan

Step 3's registry test (exact key set + all-functions) plus plan 003's render
harness (which tests the underlying components without the registry). Together
they cover both halves: components render, registry exposes them.

## Done criteria

- [ ] `grep -c "dynamic(" mdx-diagrams.ts` → `1` (the single factory call)
- [ ] `pnpm test` exits 0 including `tests/diagram-registry.test.ts` with all 38 keys
- [ ] `pnpm build` exits 0 and a built diagram-heavy post page contains `<svg`
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any registry key does NOT match a named export in its module (the invariant
  is broken — list the mismatches).
- `pnpm build` fails or a built post page loses its `<svg>` content after the
  rewrite (the `dynamic(async () => ...)` return shape may need
  `{ default: Component }` instead — try that one adjustment; if it still
  fails, stop).
- Turbopack rejects the computed-loader pattern (error mentioning module
  context or critical dependency) — the current per-const pattern exists in a
  turbopack-sensitive repo (see the comment in
  `app/(post)/[year]/[slug]/page.tsx` about import handling); report rather
  than fighting the bundler.

## Maintenance notes

- Adding a diagram is now: create the component (name ending in
  `Diagram`/`Chart` — plan 003's harness contract), add ONE line to
  `DIAGRAM_LOADERS`, add the key to `EXPECTED_KEYS` in the registry test.
- Plan 012 (gallery) may want family grouping; the import paths inside
  `DIAGRAM_LOADERS` carry that information if it ever needs deriving.
