# Plan 008: Hygiene sweep — unused dep, dead CSS, README accuracy, discarded query

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- package.json app/globals.css Readme.md "app/(post)/[year]/[slug]/page.tsx"`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (coordinates with 002 — see Step 3 note)
- **Category**: tech-debt
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

Four small, verified pieces of drift, batched because each is minutes of work:
an unused heavyweight devDependency (`playwright`), three dead CSS rule blocks
left over from a deleted archive/TOC design, a README section that overstates
what the registry test guarantees and omits a required step, and a post-page
Supabase query whose result is discarded on every build. None is urgent;
together they cut install weight, kill misleading signals, and make the docs
true.

## Current state

1. **Unused dependency** — `package.json` devDependencies contains
   `"playwright": "^1.61.1"`. Grep across `app/`, `tests/`, `scripts/`,
   `vitest.config.ts` finds zero imports, zero `playwright.config.*`, zero
   E2E specs.

2. **Dead CSS** — `app/globals.css` defines three rule blocks with no usages
   anywhere in `*.tsx/*.ts/*.mdx` (the archive index and floating TOC that
   used them were deleted; see git history for `app/components/floating-toc.tsx`):

```css
/* around line 104 */
.archive-serif {
  font-family: "Times New Roman", Times, serif;
}

.archive-mono {
  font-family: var(--font-geist-mono), "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

/* around line 237, inside @layer utilities */
  .scrollbar-hidden {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
```

   NOTE: `.archive-title` (adjacent, ~line 113) IS used — do not remove it.

3. **README inaccuracies** — `Readme.md`, "Adding a post" section, currently:

```markdown
1. Create `posts/<year>/<slug>.mdx`. The `<year>` directory must match the year of
   the post's date.
2. Add an entry to `app/posts.json`: `id` (the slug), `date` (like
   `"July 05, 2026"`), `title`, and optionally `draft` or `evergreen`.

The registry sync test (`tests/posts-registry.test.ts`) fails if the file and the
registry entry disagree, so the two always stay in step. Drafts stay out of the
home index and the feed but remain reachable by URL.
```

   Problems: (a) the test only checks file↔entry existence and unique ids —
   "always stay in step" overstates it (titles can drift); (b) the steps omit
   the `export const metadata = { title, description }` block every post
   carries and which plan 002 makes load-bearing (meta description, feed
   summary, and a title-sync test).

4. **Discarded query** — `app/(post)/[year]/[slug]/page.tsx:38-41` calls
   `getPosts()` (which issues a full `views` table select against Supabase,
   see `app/get-posts.ts:53-55`) but the page's only consumer, `PostChrome`
   (`app/(post)/post-chrome.tsx`), reads just `post.title`, `post.date`,
   `post.id` — the fetched view counts are never rendered on post pages:

```tsx
  const posts = await getPosts();
  const post =
    posts.find(p => p.id === slug) ??
    { ...registryEntry, views: 0, viewsFormatted: "0" }; // drafts: not in getPosts()
```

   The draft fallback on line 41 already builds a complete `Post` object from
   the registry entry alone — that is the pattern to use unconditionally.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Install   | `pnpm install`   | exit 0              |
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `package.json` + `pnpm-lock.yaml` (remove playwright)
- `app/globals.css` (the three dead blocks only)
- `Readme.md` ("Adding a post" section only)
- `app/(post)/[year]/[slug]/page.tsx` (the `getPosts()` block only)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `.archive-title` and every other rule in `globals.css`.
- `app/get-posts.ts` — the homepage and OG routes legitimately use it.
- `generateMetadata` in the post page — plan 002 owns it.
- Any other README section (Supabase schema, Architecture).

## Git workflow

- Branch: `advisor/008-hygiene-sweep`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish"). One commit per numbered item is ideal.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove playwright

`pnpm remove playwright` (updates `package.json` + lockfile).

**Verify**: `grep playwright package.json` → no output; `pnpm test` → all pass.

### Step 2: Delete the dead CSS blocks

Before deleting, re-confirm no dynamic construction sneaks past static grep:

```
grep -rn "archive-serif\|archive-mono\|scrollbar-hidden" app posts --include="*.tsx" --include="*.ts" --include="*.mdx"
```

Expected: matches only inside `app/globals.css`. Then delete the
`.archive-serif`, `.archive-mono`, `.scrollbar-hidden`, and
`.scrollbar-hidden::-webkit-scrollbar` rule blocks (and the now-empty
`@layer utilities { }` wrapper if nothing else remains inside it — check
before deleting the wrapper).

**Verify**: `pnpm build` → exit 0; re-run the grep → no matches anywhere.

### Step 3: Correct the README

Rewrite the "Adding a post" section to (adjust step 2/3 wording if plan 002
has NOT landed yet — see note):

```markdown
## Adding a post

1. Create `posts/<year>/<slug>.mdx`. The `<year>` directory must match the year of
   the post's date. Start the file with the metadata block:

   ```js
   export const metadata = {
     title: 'Post title',
     description: 'One-sentence summary used for meta tags and the feed.',
   };
   ```

2. Add an entry to `app/posts.json`: `id` (the slug), `date` (like
   `"July 05, 2026"`), `title`, and optionally `draft` or `evergreen`.

The registry test (`tests/posts-registry.test.ts`) checks that every registry
entry has a matching MDX file (and vice versa) and that ids are unique. Drafts
stay out of the home index and the feed but remain reachable by URL.
```

Coordination note: if plan 002 landed first, extend the last paragraph with
"It also checks the MDX `metadata.title` matches the registry title and that a
description is present." If 002 has not landed, keep the paragraph as written
above (claim only what the test does today).

**Verify**: `grep -n "always stay in step" Readme.md` → no output.

### Step 4: Drop the discarded views query from the post page

In `app/(post)/[year]/[slug]/page.tsx`, replace lines 38-41 with:

```tsx
  // Post pages don't render view counts (see PostChrome) — build the post
  // from the registry alone and skip the Supabase views query entirely.
  const post = { ...registryEntry, views: 0, viewsFormatted: "0" };
```

Remove the now-unused `import { getPosts } from "@/app/get-posts";`. Keep the
`Post` type compatibility (the object shape matches the existing draft
fallback; `PostChrome` accepts `Post | null`).

**Verify**: `pnpm typecheck` → exit 0; `grep -n "getPosts" "app/(post)/[year]/[slug]/page.tsx"` → no output.

### Step 5: Full gate

**Verify**: `pnpm verify` → exit 0 (typecheck + lint + test + build).

## Test plan

No new tests. Existing suite must stay green — in particular
`tests/posts-registry.test.ts` (README claims now match it) and the build
(dead CSS removal can't break Tailwind since the classes were unreferenced).

## Done criteria

- [ ] `grep playwright package.json pnpm-lock.yaml | grep -v "^pnpm-lock.yaml.*resolution"` → no `"playwright"` dependency entry in package.json
- [ ] `grep -rn "archive-serif\|archive-mono\|scrollbar-hidden" app posts` → no matches
- [ ] `grep -n "always stay in step" Readme.md` → no matches; metadata block documented
- [ ] `grep -n "getPosts" "app/(post)/[year]/[slug]/page.tsx"` → no matches
- [ ] `pnpm verify` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The Step 2 pre-delete grep finds a usage of any of the three classes outside
  `globals.css`.
- Removing playwright breaks `pnpm install` or any script (would mean a hidden
  consumer — find and report it).
- `PostChrome` or anything else on the post page turns out to consume
  `post.views` (contradicts the audit — report, don't refactor around it).

## Maintenance notes

- If view counts are ever added to post pages (e.g. under the title), reinstate
  a *narrow* fetch (single row by id), not the full-table `getPosts()`.
- If E2E testing is ever wanted (see plan 003's maintenance notes and plan
  012's gallery), re-adding playwright should come with a config and at least
  one spec in the same commit.
