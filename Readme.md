# blog

The Next.js App Router blog behind [stevhliu.com](https://stevhliu.com). Posts are
MDX, rendered statically, and deployed on [Vercel](https://vercel.com).

## Development

```bash
pnpm install
pnpm dev      # local dev server (http://localhost:3000)
pnpm verify   # typecheck + lint + test + build
```

## Environment

Copy `.env.example` to `.env.local` and fill in the two values. Both are optional:
without them the site runs fine and view counts read `0`.

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public).
- `SUPABASE_SECRET_KEY` — Supabase service key (server-only).

## Supabase schema

The site reads and writes three things in Supabase, all optional:

- Table `views` — `post_id` (text, primary key) and `count` (bigint). Read by
  `app/get-posts.ts` to show per-post counts.
- RPC `increment_view(p_id text)` — upserts the row for `p_id` and increments its
  `count`. Called by `app/api/view/route.ts` when a post page loads.
- Table `tweet_cache` — caches fetched tweet JSON (`tweet_id`, `data`,
  `cached_at`). Read and written by `app/components/tweet.tsx`.

## Adding a post

1. Create `posts/<year>/<slug>.mdx`. The `<year>` directory must match the year of
   the post's date.
2. Add an entry to `app/posts.json`: `id` (the slug), `date` (like
   `"July 05, 2026"`), `title`, and optionally `draft` or `evergreen`.

The registry sync test (`tests/posts-registry.test.ts`) fails if the file and the
registry entry disagree, so the two always stay in step. Drafts stay out of the
home index and the feed but remain reachable by URL.

## Architecture

- `app/posts.json` is the post registry. `app/get-posts.ts` merges in Supabase view
  counts and filters drafts, feeding the home index (`app/(chrome)/page.tsx`).
- Post pages render through one dynamic segment, `app/(post)/[year]/[slug]/page.tsx`,
  which prerenders every post at build time and pulls content from `posts/`.
- The shared site frame lives in `app/site-shell.tsx`; the `(post)` and `(chrome)`
  route groups pick its variant so every page renders statically.
- The MDX component registry is `mdx-components.ts` plus `mdx-diagrams.ts`.
- OG images are generated at `app/(post)/og/[id]/route.tsx`; the feed is at
  `app/atom/route.ts`.
- `fonts/init.mjs` runs on `postinstall` and copies raw TTFs out of the `geist`
  package because the OG `ImageResponse` needs TTF/OTF data (page fonts already go
  through `next/font`).
