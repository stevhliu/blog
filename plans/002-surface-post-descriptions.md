# Plan 002: Surface per-post descriptions in page metadata and the Atom feed

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- "app/(post)/[year]/[slug]/page.tsx" app/atom/ tests/posts-registry.test.ts tests/atom.test.ts posts/`
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

Every post MDX file exports a hand-written `metadata.description`, but nothing
consumes it: post pages emit no `<meta name="description">`, no OG/Twitter
description, and the Atom feed entries have no `<summary>`. Search engines,
link unfurlers, and feed readers all fall back to nothing. The copy already
exists — this plan delivers it, and adds a registry test so the MDX metadata
and `app/posts.json` can't silently drift apart.

## Current state

- Every post exports metadata at the top of its MDX file, e.g.
  `posts/2026/transformers-loading-pipeline.mdx:1-4`:

```js
export const metadata = {
  title: 'The Transformers loading pipeline',
  description: 'Transformers lowers peak memory by building models on the meta device, ...',
};
```

- `app/(post)/[year]/[slug]/page.tsx:18-29` — `generateMetadata` reads only
  `app/posts.json` and sets no description:

```tsx
export async function generateMetadata(props: {
  params: Promise<{ year: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = postsData.posts.find(p => p.id === slug);
  if (!post) return {};
  return {
    title: post.title,
    openGraph: { title: post.title, images: [{ url: `/og/${slug}` }] },
    twitter: { card: "summary_large_image", images: [`/og/${slug}`] },
  };
}
```

- The page component (same file, line 45) already dynamically imports the MDX
  module with a **relative** path — this is a deliberate turbopack workaround,
  preserved by a comment at lines 43-44 ("Relative (not \"@/...\") so turbopack
  builds a module context from the static prefix"):

```tsx
  const { default: Content } = await import(`../../../../posts/${year}/${slug}.mdx`);
```

  MDX modules also expose their `metadata` export the same way:
  `const mod = await import(...); mod.metadata.description`.

- `app/atom/route.ts:10-19` — feed entries have `id`, `title`, `link`,
  `updated`, no `<summary>`:

```tsx
  const entries = posts.map(post => {
    const year = new Date(`${post.date} UTC`).getUTCFullYear();
    const url = `${SITE}/${year}/${post.id}`;
    return `<entry>
      <id>${escapeXml(url)}</id>
      <title>${escapeXml(post.title)}</title>
      <link href="${escapeXml(url)}"/>
      <updated>${toRfc3339(post.date)}</updated>
    </entry>`;
  });
```

  `escapeXml` is exported from `app/atom/feed.ts` — use it for the summary.

- `tests/posts-registry.test.ts` — checks file↔registry existence and unique
  ids only; it does not compare titles or require descriptions.
  `tests/atom.test.ts` — calls the real `GET()` and asserts entry count and
  IRI shape; model new feed assertions on it.

- Source-of-truth decision (made by the advisor, follow it): the MDX
  `metadata` export is the source of truth for `description`; `app/posts.json`
  remains the source of truth for `title` and `date`. The new registry test
  asserts the MDX `metadata.title` matches the registry title so the two
  cannot drift.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `app/(post)/[year]/[slug]/page.tsx`
- `app/atom/route.ts`
- `tests/posts-registry.test.ts`
- `tests/atom.test.ts`
- `posts/*/*.mdx` — ONLY the `export const metadata` block, and ONLY if Step 1's
  audit finds a title mismatch or a missing/empty description
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `app/posts.json` — titles there are the display source of truth; fix the MDX
  side on mismatch, not the registry.
- `app/(post)/og/[id]/route.tsx` and other OG routes — image generation is a
  separate surface; adding description text to OG images is not this plan.
- `app/atom/feed.ts` — `escapeXml`/`toRfc3339` already do what's needed.

## Git workflow

- Branch: `advisor/002-surface-post-descriptions`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Audit existing MDX metadata

For each entry in `app/posts.json`, open `posts/<year>/<id>.mdx` (year =
`new Date(date + " UTC").getUTCFullYear()`) and record whether (a)
`metadata.title` equals the registry `title` exactly, and (b)
`metadata.description` is a non-empty string. Fix any mismatch by editing the
MDX metadata block (registry wins for titles; write a sensible one-sentence
description only if one is entirely missing — if you must write one, flag it
in your report for editorial review).

**Verify**: `grep -L "export const metadata" posts/*/*.mdx` → no output (every post has the block).

### Step 2: Extend the registry test

In `tests/posts-registry.test.ts`, add a test that for every registry entry
dynamically imports the MDX module and asserts:

- `mod.metadata.title === post.title`
- `typeof mod.metadata.description === "string" && mod.metadata.description.length > 0`

Vitest resolves `.mdx` imports only if configured — it is NOT currently, so do
this without importing MDX through the bundler: read the file with `fs` and
extract the metadata with a regex, OR import via `@mdx-js/*` — do neither.
Simplest robust approach: `fs.readFileSync` the MDX file and parse the
`export const metadata = { ... };` block by locating the first `{` after
`export const metadata` and its matching close brace, then `new Function` —
**no**: avoid executing post content. Use two targeted regexes instead:

```ts
const title = source.match(/export const metadata = \{[\s\S]*?title:\s*(['"])([\s\S]*?)\1/)?.[2];
const description = source.match(/description:\s*(['"])([\s\S]*?)\1/)?.[2];
```

Assert both are defined, `title === post.title`, and `description.length > 0`.
(The metadata blocks are simple literal objects — see the excerpt in "Current
state" — so this is reliable here. If any post's metadata block is not a plain
object literal with quoted strings, STOP.)

**Verify**: `pnpm test` → all pass (if this new test fails, Step 1 was incomplete — fix the MDX, don't weaken the test).

### Step 3: Emit the description from `generateMetadata`

In `app/(post)/[year]/[slug]/page.tsx`, extend `generateMetadata` to import
the MDX module with the same relative-path pattern the page component uses
(preserve that pattern and its comment — do not switch to `@/`):

```tsx
export async function generateMetadata(props: {
  params: Promise<{ year: string; slug: string }>;
}): Promise<Metadata> {
  const { year, slug } = await props.params;
  const post = postsData.posts.find(p => p.id === slug);
  if (!post) return {};
  let description: string | undefined;
  try {
    const mod = await import(`../../../../posts/${year}/${slug}.mdx`);
    description = mod.metadata?.description;
  } catch {
    // metadata stays title-only if the module can't be loaded here
  }
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, images: [{ url: `/og/${slug}` }] },
    twitter: { card: "summary_large_image", description, images: [`/og/${slug}`] },
  };
}
```

**Verify**: `pnpm build` → exit 0, then
`grep -o '<meta name="description"[^>]*>' .next/server/app/2026/transformers-loading-pipeline.html | head -1`
→ prints a description meta tag (path may vary slightly by Next version; any
built post page HTML containing the description satisfies this).

### Step 4: Add `<summary>` to feed entries

In `app/atom/route.ts`, load each post's description and emit a summary line.
Route handlers can use the same dynamic-import pattern; compute year as the
entries already do:

```tsx
  const entries = await Promise.all(
    posts.map(async post => {
      const year = new Date(`${post.date} UTC`).getUTCFullYear();
      const url = `${SITE}/${year}/${post.id}`;
      let summary = "";
      try {
        const mod = await import(`../../posts/${year}/${post.id}.mdx`);
        if (mod.metadata?.description) {
          summary = `\n      <summary>${escapeXml(mod.metadata.description)}</summary>`;
        }
      } catch {}
      return `<entry>
      <id>${escapeXml(url)}</id>
      <title>${escapeXml(post.title)}</title>
      <link href="${escapeXml(url)}"/>
      <updated>${toRfc3339(post.date)}</updated>${summary}
    </entry>`;
    })
  );
```

Note the relative prefix from `app/atom/` is `../../posts/` (two levels up).
Keep `entries.join("\n")` usage below unchanged.

In `tests/atom.test.ts`, extend the `GET /atom` test: assert the number of
`<summary>` occurrences equals the entry count, and that summaries contain no
raw `<` from the source text (escaping worked): every `<summary>` match should
be followed by text without `<` until `</summary>`.

**Verify**: `pnpm test` → all pass, including the new summary assertions.

### Step 5: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

## Test plan

- `tests/posts-registry.test.ts`: title-sync + description-present assertions
  (Step 2) — this is the drift guard that makes the metadata trustworthy.
- `tests/atom.test.ts`: one `<summary>` per entry, XML-escaped (Step 4).
- Pattern to follow: both files already exist; extend them in their existing
  style (plain vitest, `@/` alias imports, real data — no mocks).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm test` exits 0, including new assertions in `tests/posts-registry.test.ts` and `tests/atom.test.ts`
- [ ] `pnpm build` exits 0 and a built post page contains `<meta name="description"`
- [ ] `curl`-free check: `pnpm test` includes the summary-count assertion (feed verified by test, not by hand)
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The dynamic `import(\`../../../../posts/...\`)` pattern inside
  `generateMetadata` fails to resolve under `pnpm build` (turbopack module
  context issue) — report the exact error; do NOT switch to `@/`-alias imports
  (known to collide with package export maps under turbopack, per the comment
  in the page file).
- Any MDX metadata block is not a plain object literal parseable by the Step 2
  regexes.
- A registry title and MDX title disagree in a way that looks intentional
  (e.g. a deliberately shortened display title) — report the pair instead of
  overwriting.

## Maintenance notes

- New posts must now ship a `description` (the registry test enforces it).
  The README's "Adding a post" section is updated by plan 008 to say so.
- If a future refactor moves post metadata into `posts.json` wholesale, delete
  the Step 2 regex parsing in favor of direct JSON comparison.
- Reviewer: check one unfurl (paste a post URL into a Slack/Discord preview)
  after deploy — description should appear under the title.
