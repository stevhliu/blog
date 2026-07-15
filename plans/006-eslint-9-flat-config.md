# Plan 006: Migrate lint to ESLint 9 flat config and off deprecated `next lint`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- .eslintrc.json eslint.config.mjs package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — flat-config migration can change which rules fire; the gate is that lint stays green with no rule-set surprises
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

The lint leg of `pnpm verify` runs ESLint 8 (end-of-life, no fixes) through
`next lint` (deprecated in Next 15, removed in Next 16). Left alone, the next
Next.js major upgrade breaks the verify gate and forces this migration under
pressure. Doing it now is a contained, low-stakes change: the current config
is two lines of overrides on `next/core-web-vitals`.

## Current state

- `.eslintrc.json` — the entire current config:

```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/jsx-no-target-blank": "off"
  }
}
```

- `package.json` (relevant lines): `"eslint": "^8.56.0"`,
  `"eslint-config-next": "15.5.19"`, script `"lint": "next lint"`.
  `eslint-config-next@15.5.19` declares peer support for
  `eslint ^8.57.0 || ^9.0.0`, so ESLint 9 is supported without bumping Next.
- The repo is `next@15.5.19`, TypeScript, App Router, pnpm (`pnpm@10.14.0`).
- `pnpm verify` = `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
- There is no `eslint.config.*` file yet.

## Commands you will need

| Purpose        | Command                     | Expected on success        |
|----------------|-----------------------------|----------------------------|
| Install        | `pnpm install`              | exit 0                     |
| Lint           | `pnpm lint`                 | exit 0                     |
| Full gate      | `pnpm verify`               | exit 0                     |
| Baseline count | `pnpm lint 2>&1 | tail -5`  | see Step 1                 |

## Scope

**In scope** (the only files you should modify/create/delete):
- `package.json` (eslint version, lint script, possibly `@eslint/eslintrc` devDep)
- `pnpm-lock.yaml` (via `pnpm install` only)
- `eslint.config.mjs` (create)
- `.eslintrc.json` (delete at the end)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- Any source file, UNLESS the new setup surfaces ≤5 mechanical errors (see
  Step 4's rule). More than that → STOP condition.
- `eslint-config-next` version — stay on 15.5.19 to match `next`.
- Prettier — formatting is a separate concern (deliberately not planned).

## Git workflow

- Branch: `advisor/006-eslint-9-flat-config`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Record the baseline

Run `pnpm lint` on the unmodified tree. Expected today: exit 0 with
"✔ No ESLint warnings or errors" (or similar). Save the exact output — it is
the parity target.

**Verify**: `pnpm lint` → exit 0. If it does NOT exit 0 today, STOP (the
baseline assumption is wrong).

### Step 2: Bump ESLint and add the flat config

- `package.json`: change `"eslint": "^8.56.0"` → `"eslint": "^9"`, and add
  `"@eslint/eslintrc": "^3"` to devDependencies (provides `FlatCompat` for
  consuming the legacy-format `next/core-web-vitals` shareable config —
  this is Next's documented migration path for 15.x).
- Run `pnpm install`.
- Create `eslint.config.mjs`:

```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  {
    ignores: [".next/**", "node_modules/**", "plans/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/jsx-no-target-blank": "off",
    },
  },
];
```

**Verify**: `pnpm install` → exit 0; `node -e "import('./eslint.config.mjs').then(()=>console.log('ok'))"` → prints `ok`.

### Step 3: Switch the lint script

In `package.json`, change `"lint": "next lint"` → `"lint": "eslint ."`.

**Verify**: `pnpm lint` → runs ESLint 9 (confirm with `pnpm exec eslint --version` → `v9.x`).

### Step 4: Reach parity with the baseline

Run `pnpm lint`. Expected: exit 0, no errors — matching Step 1.

If new errors appear:
- ≤5 errors that are mechanical (unused eslint-disable comments, rules renamed
  between v8/v9): fix them minimally and list each in your report.
- Anything else (many errors, plugin resolution failures, rules behaving
  differently on JSX): STOP and report the full output.

**Verify**: `pnpm lint` → exit 0.

### Step 5: Remove the legacy config and run the full gate

Delete `.eslintrc.json`. Run the full verification chain.

**Verify**: `pnpm verify` → exit 0. `ls .eslintrc.json` → No such file.

## Test plan

No new unit tests (config-only change). The gates are: `pnpm lint` parity with
the Step 1 baseline, and `pnpm verify` fully green.

## Done criteria

- [ ] `pnpm exec eslint --version` prints `v9.*`
- [ ] `pnpm lint` exits 0 and no longer invokes `next lint` (`grep '"lint"' package.json` shows `eslint .`)
- [ ] `.eslintrc.json` is deleted; `eslint.config.mjs` exists
- [ ] `pnpm verify` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 baseline is not green.
- `FlatCompat` cannot load `next/core-web-vitals` (peer/plugin resolution
  errors under pnpm) — report the error; do not start adding plugin packages
  one by one without direction.
- Step 4 surfaces more than 5 new lint errors, or any error whose fix would
  change runtime behavior.
- `pnpm verify`'s build step fails after the switch (would indicate Next
  still expects its own lint wiring).

## Maintenance notes

- When Next is upgraded to 16, `eslint-config-next` should be bumped in
  lockstep; the flat config itself should carry over unchanged.
- The `ignores` block replaces `.eslintignore` semantics — new build dirs must
  be added there.
- Reviewer: diff the rule behavior by scanning the Step 4 report, not the
  config file; the config is intentionally minimal.
