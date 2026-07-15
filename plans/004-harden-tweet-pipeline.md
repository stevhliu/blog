# Plan 004: Harden the tweet pipeline — cache-first reads, real types, tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- app/components/tweet.tsx app/components/tweet-data.ts tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

Tweet embeds have three related weaknesses. (1) The Supabase `tweet_cache` is
consulted only when the live Twitter fetch fails, so every production build
fetches every embedded tweet live — builds are coupled to Twitter availability
and rate limits while the cache stays effectively write-only. (2) The exact
data shape that already caused a production crash ("entities is not iterable",
worked around by `withEntities`) is guarded by three `// @ts-ignore` and an
`as unknown as Tweet` cast — the compiler is overruled precisely where the
data is least trustworthy. (3) None of this logic is tested, so the crash
class can silently regress. This plan makes the cache authoritative within a
TTL, replaces the type escape hatches with a typed guard, and adds unit tests.

## Current state

- `app/components/tweet.tsx` — everything lives here today: data fetching,
  normalization, and React rendering. Key excerpts:

  Fetch-first flow with fallback-only cache (lines 34-73, comment at 36 shows
  the freshness preference is deliberate — we are changing the tradeoff to
  TTL-bounded freshness, keep a comment saying so):

```tsx
  const sb = supabase;

  // we first prioritize getting a fresh tweet
  try {
    const tweet = await getTweet(id);

    // @ts-ignore
    if (tweet && !tweet.tombstone) {
      after(async () => {
        const { error } = await sb.from("tweet_cache").upsert({
          tweet_id: id,
          data: tweet,
          cached_at: new Date().toISOString(),
        });
        if (error) console.error("tweet cache upsert error", error);
      });
      return tweet;
    }
  } catch (error) {
    console.error("tweet fetch error", error);
  }

  const { data, error } = await sb
    .from("tweet_cache")
    .select("data")
    .eq("tweet_id", id)
    .maybeSingle();
  ...
  const cachedTweet: Tweet | null =
    (data?.data as unknown as Tweet | null) ?? null;

  // @ts-ignore
  if (!cachedTweet || cachedTweet.tombstone) return undefined;
```

  There is also a no-Supabase branch at lines 20-32 (fetch live, return
  undefined on failure) — preserve its behavior exactly.

  Normalization helpers (lines 75-100), written because react-tweet's
  `enrichTweet()` iterates `entities.{hashtags,urls,user_mentions,symbols}`
  unconditionally on the tweet AND its `quoted_tweet`:

```tsx
function withEntities<T extends { entities?: Tweet["entities"] }>(t: T): T {
  return {
    ...t,
    entities: {
      hashtags: [],
      urls: [],
      user_mentions: [],
      symbols: [],
      ...t.entities,
    },
  };
}

function normalizeTweet(tweet: Tweet): Tweet {
  const normalized = withEntities(tweet);
  if (normalized.quoted_tweet) {
    normalized.quoted_tweet = withEntities(normalized.quoted_tweet);
  }
  return normalized;
}
```

- `app/supabase.ts` — exports `supabase` which is `null` when env vars are
  absent (the site must keep working with no Supabase configured).
- `next/server`'s `after()` schedules work post-response; in tests it must be
  mocked.
- `tweet.tsx` imports `./tweet.css` and react-tweet UI components — importing
  it from a node test would drag those in, which is why this plan extracts the
  data layer to a new module with no CSS/UI imports.
- Test conventions: plain vitest in node env under `tests/`, `@/` alias — see
  `tests/get-posts.test.ts` for the closest existing pattern.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `app/components/tweet-data.ts` (create — extracted data layer)
- `app/components/tweet.tsx` (slims down to rendering + re-export)
- `tests/tweet-data.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `app/supabase.ts` — the null-client contract stays as is.
- `app/components/tweet.css`, the `Tweet`/`ReactTweet` component APIs, or any
  MDX post using `<Tweet>` — rendering behavior must not change.
- The Supabase `tweet_cache` schema (`tweet_id`, `data`, `cached_at`) — reuse
  it; `cached_at` already exists for the TTL.
- Rate limiting / validation of tweet URLs — out of this plan's problem.

## Git workflow

- Branch: `advisor/004-harden-tweet-pipeline`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish"). Suggested: one commit for the extraction, one for the TTL logic + tests.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract the data layer

Create `app/components/tweet-data.ts` containing (moved from `tweet.tsx`):
`getAndCacheTweet`, `withEntities`, `normalizeTweet`, plus new type
definitions. No CSS, no react-tweet UI imports — only
`react-tweet/api` (for `getTweet` and the `Tweet` type), `next/server`
(`after`), and `@/app/supabase`.

Add the types that replace the escape hatches:

```ts
import { getTweet, type Tweet } from "react-tweet/api";

// react-tweet's Tweet type omits tombstone, but the syndication API returns
// it for deleted/withheld tweets. Model it instead of @ts-ignoring it.
type SyndicationTweet = Tweet & { tombstone?: unknown };

function isRenderableTweet(t: SyndicationTweet | null | undefined): t is Tweet {
  return t != null && t.tombstone == null;
}
```

Export `withEntities`, `normalizeTweet`, `getAndCacheTweet`, and
`isRenderableTweet` (tests import them). Remove all three `// @ts-ignore`
comments and the `as unknown as Tweet` cast — the cached row becomes
`(data?.data as SyndicationTweet | null) ?? null` funneled through
`isRenderableTweet` (one narrow, documented cast at the storage boundary
instead of compiler overrides at each use site).

In `app/components/tweet.tsx`, delete the moved code and import
`getAndCacheTweet` and `normalizeTweet` from `./tweet-data`. The rendering
components (`TweetContent`, `ReactTweet`, `Tweet`) stay byte-identical.

**Verify**: `pnpm typecheck` → exit 0; `grep -n "@ts-ignore" app/components/tweet.tsx app/components/tweet-data.ts` → no output.

### Step 2: Make reads cache-first with a TTL

In `tweet-data.ts`, restructure `getAndCacheTweet(id)` for the Supabase
branch (the no-Supabase branch keeps its current behavior: live fetch, return
`undefined` on failure/tombstone):

```ts
export const TWEET_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
```

New flow:
1. Read the cache row first: `.from("tweet_cache").select("data, cached_at").eq("tweet_id", id).maybeSingle()`.
2. If a row exists, its `data` passes `isRenderableTweet`, and
   `Date.now() - new Date(cached_at).getTime() < TWEET_CACHE_TTL_MS` → return
   the cached tweet. **No live fetch.**
3. Otherwise fetch live via `getTweet(id)`. On a renderable result, schedule
   the upsert in `after(...)` exactly as today (same columns) and return it.
4. If the live fetch fails or returns a tombstone, fall back to the cached
   tweet even if stale (better a stale embed than none) — return it if
   renderable, else `undefined`.

Log errors with the existing `console.error` message strings so log greps
still work ("tweet fetch error", "tweet cache fetch error",
"tweet cache upsert error").

Replace the old "we first prioritize getting a fresh tweet" comment with one
sentence stating the new tradeoff: cache-first within a 7-day TTL keeps builds
off the Twitter API; stale cache is the fallback when the live fetch fails.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Unit tests

Create `tests/tweet-data.test.ts`. Mock the two effectful modules with
`vi.mock` **before** importing the module under test; use a mutable holder so
each test controls behavior:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTweet: vi.fn(),
  supabase: null as unknown,
  after: vi.fn((fn: () => unknown) => fn()), // run after() callbacks inline
}));

vi.mock("react-tweet/api", async importOriginal => ({
  ...(await importOriginal<object>()),
  getTweet: mocks.getTweet,
}));
vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/app/supabase", () => ({
  get supabase() {
    return mocks.supabase;
  },
}));
```

Build a minimal chainable Supabase stub per test:
`{ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data, error: null }) }) }), upsert: async () => ({ error: null }) }) }`
(shape it to what `tweet-data.ts` actually calls; adjust if your Step 2 code
chains differently).

Cases (name them like this):
1. `normalizeTweet backfills missing entities` — tweet without `entities`
   gains all four empty arrays; same for a `quoted_tweet` missing them. This
   is the regression test for the historical "entities is not iterable" crash.
2. `normalizeTweet preserves existing entities` — provided arrays survive.
3. `no supabase: returns live tweet` / `no supabase: undefined on fetch error`.
4. `fresh cache hit skips the live fetch` — cached_at = now; assert
   `mocks.getTweet` was **not** called.
5. `stale cache triggers live fetch and upsert` — cached_at = 8 days ago;
   assert `getTweet` called and upsert data has the new tweet.
6. `live failure falls back to stale cache` — `getTweet` rejects; stale row
   returned.
7. `tombstoned cache row is not returned` — cached data has `tombstone`;
   with the live fetch also failing, result is `undefined`.

**Verify**: `pnpm test` → all pass, including 7+ new tests in `tests/tweet-data.test.ts`.

### Step 4: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

## Test plan

Covered in Step 3 — pure-logic tests for the normalizers plus branch tests for
the cache flow with mocked `react-tweet/api`, `next/server`, and the Supabase
client. Model file structure on `tests/get-posts.test.ts`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "@ts-ignore" app/components/tweet.tsx app/components/tweet-data.ts` → no matches
- [ ] `grep -n "as unknown as Tweet" app/components/` → no matches
- [ ] `pnpm test` exits 0 with the 7 new cases passing
- [ ] `pnpm build` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `tweet.tsx` no longer matches the "Current state" excerpts.
- react-tweet's `Tweet` type already includes `tombstone` in the installed
  version (then the `SyndicationTweet` extension is wrong — report and adjust
  only after confirming with `node_modules/react-tweet` type defs).
- Mocking `next/server`'s `after` breaks other imports from `next/server`
  elsewhere in the test process — report rather than partially mocking Next
  internals.
- Any change to visible rendering output would be required (this plan must be
  render-neutral).

## Maintenance notes

- The TTL constant (`TWEET_CACHE_TTL_MS`, 7 days) is the knob: raise it to pin
  embeds harder to the cache, lower it for fresher like counts. Tweets are
  effectively immutable content-wise, so long TTLs are safe.
- If a post ever embeds a *newly published* tweet and the render looks stale,
  the fix is deleting that row from `tweet_cache`, not lowering the TTL.
- Reviewer: confirm the no-Supabase branch behavior is unchanged (README
  promises the site runs with no env vars).
- Deferred deliberately: schema validation of the cached JSON blob (the
  security audit rated stored-XSS risk LOW-confidence; revisit only if
  react-tweet's URL handling ever becomes a concern).
