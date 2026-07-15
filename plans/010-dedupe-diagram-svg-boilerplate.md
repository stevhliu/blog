# Plan 010: Extract shared figure scaffolding from the attention/quantization diagrams (pixel-identical)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- app/components/attention app/components/quantization app/components/diagram-figure.tsx tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M (scoped down from the audit's L — see "Why this matters")
- **Risk**: MED — visual components with snapshot-only protection; the gate is byte-identical rendered output
- **Depends on**: plans/003-diagram-render-tests.md (hard dependency — the snapshot gate builds on its harness)
- **Category**: tech-debt
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

The 24 diagram files under `app/components/attention/` and
`app/components/quantization/` each hand-roll the same outer scaffolding — a
`<figure className="my-8">` wrapping an `<svg viewBox=... className="w-full
max-w-md mx-auto">` plus an optional `<Caption>`. A spacing or sizing tweak to
"all older diagrams" currently means editing 24 files. This plan extracts ONE
shared wrapper component and migrates all 24 files to it, with a
snapshot-equality gate proving zero rendered-output change.

Deliberately **not** in this plan (the audit initially suggested more): the
older families use a different visual language (Tailwind `sky/amber/emerald/
violet` palette classes, `max-w-md` sizing) from the newer
`transformers/flow-primitives.tsx` system (custom hex palette, full-width).
Migrating them onto flow-primitives would be a restyle, not a refactor —
that's an editorial decision, recorded as follow-up in plan 014. This plan is
mechanical extraction only.

## Current state

- The repeated scaffolding, e.g. `app/components/attention/mha-diagram.tsx:1-6`
  and `:40-42`:

```tsx
import { Caption } from "../caption";

export function MHADiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 360 90" className="w-full max-w-md mx-auto">
        {/* ...diagram content... */}
      </svg>
      <Caption>Each head has its own Q, K, and V projections.</Caption>
    </figure>
  );
}
```

  and `app/components/quantization/asymmetric-quantization-diagram.tsx:1-6`
  (same shape, `viewBox="0 0 340 240"`). Some files may vary: different
  `className` on the svg (e.g. `max-w-sm`, no `max-w-*`), no `<Caption>`, or
  extra attributes. **Survey first (Step 1); the wrapper must reproduce each
  file's exact current attributes.**

- The newer transformers family (e.g.
  `app/components/transformers/mmap-lazy-read-diagram.tsx`) uses
  `<figure className="my-10">` + `role="img"`/`aria-label` + an inline
  `fontFamily` style — a different contract. **Out of scope.**

- Plan 003's harness (`tests/diagrams-render.test.tsx`) renders every
  component whose name ends in `Diagram`/`Chart` to static markup via
  `react-dom/server`. This plan adds snapshots on top of it.

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Typecheck | `pnpm typecheck`                 | exit 0              |
| Tests     | `pnpm test`                      | all pass            |
| Snapshot update (only when told) | `pnpm vitest run -u` | snapshots rewritten |
| Build     | `pnpm build`                     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `app/components/diagram-figure.tsx` (create — the shared wrapper)
- `app/components/attention/*.tsx` (16 files — scaffolding swap only)
- `app/components/quantization/*.tsx` (8 files — scaffolding swap only)
- `tests/diagrams-snapshot.test.tsx` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `app/components/transformers/*` including `flow-primitives.tsx` — different
  visual system, already deduplicated internally.
- Any SVG *content* inside the diagrams (rects, paths, texts, colors,
  animations) — scaffolding only.
- `mdx-diagrams.ts` — component names and export shapes don't change.

## Git workflow

- Branch: `advisor/010-dedupe-diagram-svg-boilerplate`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish"). Suggested: snapshots commit, wrapper commit, then one commit per family migration.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Survey the actual scaffolding variants

For each of the 24 files, record: figure className, svg className, viewBox,
caption present or not, any extra svg attributes. Produce the variant table in
your report. Expected from planning-time reads: most are
`figure.my-8` + `svg.w-full.max-w-md.mx-auto`; variations likely in max-width
and caption presence.

**Verify**: the table covers all 24 files (`ls app/components/attention/*.tsx app/components/quantization/*.tsx | wc -l` → 24).

### Step 2: Freeze current output as snapshots

Create `tests/diagrams-snapshot.test.tsx`, reusing plan 003's discovery
pattern but scoped to the two families:

```tsx
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const modules = {
  ...import.meta.glob("../app/components/attention/*.tsx", { eager: true }),
  ...import.meta.glob("../app/components/quantization/*.tsx", { eager: true }),
} as Record<string, Record<string, unknown>>;

const diagrams: Array<[string, ComponentType]> = [];
for (const [file, mod] of Object.entries(modules)) {
  for (const [name, value] of Object.entries(mod)) {
    if (/^[A-Z].*(Diagram|Chart)$/.test(name) && typeof value === "function") {
      diagrams.push([`${file}::${name}`, value as ComponentType]);
    }
  }
}

describe("attention + quantization diagrams render identically", () => {
  it.each(diagrams)("%s", (_label, Component) => {
    expect(renderToStaticMarkup(createElement(Component))).toMatchSnapshot();
  });
});
```

Run `pnpm test` once to WRITE the snapshots (first run creates them), commit
them. These snapshots are the before-image; from here on, `-u` is forbidden
except where a STOP condition says otherwise.

**Verify**: `pnpm test` → all pass; `git status` shows a new
`tests/__snapshots__/diagrams-snapshot.test.tsx.snap` committed.

### Step 3: Create the wrapper

Create `app/components/diagram-figure.tsx` shaped by the Step 1 survey.
Target design (adjust prop surface to exactly cover the observed variants —
no speculative props):

```tsx
import type { ReactNode } from "react";
import { Caption } from "./caption";

// Shared scaffolding for the attention/ and quantization/ diagram families.
// Defaults mirror the dominant hand-written pattern (figure.my-8 +
// svg.w-full.max-w-md.mx-auto); props exist only for the variants that
// actually occur. transformers/ diagrams use their own figure contract.
export function DiagramFigure({
  viewBox,
  caption,
  svgClassName = "w-full max-w-md mx-auto",
  children,
}: {
  viewBox: string;
  caption?: ReactNode;
  svgClassName?: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-8">
      <svg viewBox={viewBox} className={svgClassName}>
        {children}
      </svg>
      {caption ? <Caption>{caption}</Caption> : null}
    </figure>
  );
}
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 4: Migrate family by family

For each file: replace the `<figure>`/`<svg>`/`<Caption>` scaffolding with
`<DiagramFigure viewBox="..." caption={...}>`, passing `svgClassName` only
when the file deviates from the default. Do not reformat or touch the SVG
children. Migrate `attention/` first, run the snapshot test, then
`quantization/`.

The snapshots MUST NOT change. If a file's snapshot diff shows only
whitespace-in-markup differences (e.g. attribute order), that still counts as
a change — match the original output instead (adjust the wrapper, not the
snapshot).

**Verify** (after each family): `pnpm test` → all pass with ZERO snapshot
updates needed.

### Step 5: Full gate

**Verify**: `pnpm verify` → exit 0. `grep -rLn "DiagramFigure" app/components/attention/*.tsx app/components/quantization/*.tsx` → no output (every file migrated).

## Test plan

Step 2's snapshot suite is the test plan — 24 byte-level before/after
equality checks. Plan 003's render harness continues covering
render-without-throw for all families.

## Done criteria

- [ ] `app/components/diagram-figure.tsx` exists; all 24 files import it
- [ ] `pnpm test` exits 0 with the Step 2 snapshots unchanged (`git diff --stat tests/__snapshots__` after Step 4 → empty)
- [ ] `grep -c "<figure" app/components/attention/*.tsx app/components/quantization/*.tsx | grep -v ":0"` → no output (no hand-rolled figures remain)
- [ ] `pnpm verify` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 003 has not landed (no `tests/diagrams-render.test.tsx` in the tree).
- Step 1 finds scaffolding variants that would need more than 2 additional
  props to cover — the wrapper is becoming a config object; report the
  variant table and stop.
- Any snapshot changes during Step 4 and you cannot make it byte-identical by
  adjusting the wrapper — never update a snapshot to make migration "pass".
- A file turns out to have logic between figure and svg (not pure scaffolding).

## Maintenance notes

- New diagrams in these two families should use `DiagramFigure` from day one.
- The deliberate style split (older families vs `flow-primitives`) is
  documented in "Why this matters" — plan 014's design spike is where
  unifying the visual languages gets decided, if ever.
- Reviewer: the whole diff should be scaffolding swaps; any hunk touching SVG
  content is out of scope and should be rejected.
