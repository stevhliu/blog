# Plan 005: Test the view-count API route

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- app/api/view/route.ts tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

`POST /api/view` is the only data-mutation endpoint in the app: it validates a
post id against the published registry and calls the Supabase
`increment_view` RPC. Its three behaviors — reject unknown/draft ids, succeed
silently with no Supabase configured, surface RPC errors — have zero test
coverage, so a regression in any of them (especially the draft filter) ships
undetected. The route is small; the tests are cheap insurance on the one
write path.

## Current state

- `app/api/view/route.ts` — the complete route:

```ts
import postsData from "@/app/posts.json";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/app/supabase";

const validIds = new Set(
  postsData.posts.filter((p) => !("draft" in p && p.draft)).map((p) => p.id)
);

export async function POST(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");

  if (!id || !validIds.has(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.rpc("increment_view", { p_id: id });
  if (error) {
    console.error("increment_view error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- `validIds` is computed at module load from `app/posts.json`, which currently
  contains at least one entry with `"draft": true` and several published
  entries. Derive test ids from `postsData` at runtime — do not hardcode
  slugs.
- The handler only uses `req.url`, so a plain `new Request(url, { method: "POST" })`
  cast to `NextRequest` is sufficient in tests.
- `supabase` is imported from `@/app/supabase` and is `null` without env vars.
  Because `supabase` is read at request time (not module load), a `vi.mock`
  with a getter lets each test flip it.
- Test conventions: plain vitest, node env, `@/` alias — see
  `tests/get-posts.test.ts` and `tests/atom.test.ts` (the latter already calls
  a route handler's `GET` directly).

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |

## Scope

**In scope** (the only files you should modify/create):
- `tests/view-route.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `app/api/view/route.ts` itself — this plan adds tests around current
  behavior; behavior changes (e.g. rate limiting) belong to plan 011.
- `app/(post)/view-counter.tsx` — the client caller is fire-and-forget;
  not worth testing.

## Git workflow

- Branch: `advisor/005-view-api-route-tests`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish"). One commit.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write the tests

Create `tests/view-route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import postsData from "@/app/posts.json";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  supabase: null as null | { rpc: ReturnType<typeof vi.fn> },
}));

vi.mock("@/app/supabase", () => ({
  get supabase() {
    return mocks.supabase;
  },
}));

import { POST } from "@/app/api/view/route";

const publishedId = postsData.posts.find(
  p => !("draft" in p && (p as { draft?: boolean }).draft)
)!.id;
const draftId = postsData.posts.find(
  p => "draft" in p && (p as { draft?: boolean }).draft
)?.id;

function post(id?: string) {
  const url = `http://localhost/api/view${id ? `?id=${encodeURIComponent(id)}` : ""}`;
  return POST(new Request(url, { method: "POST" }) as unknown as NextRequest);
}

beforeEach(() => {
  mocks.supabase = null;
});

describe("POST /api/view", () => {
  it("rejects a missing id", async () => {
    const res = await post();
    expect(res.status).toBe(400);
  });

  it("rejects an unknown id", async () => {
    const res = await post("not-a-real-post");
    expect(res.status).toBe(400);
  });

  it("rejects a draft id", async () => {
    if (!draftId) return; // registry has no draft right now — skip, don't fail
    const res = await post(draftId);
    expect(res.status).toBe(400);
  });

  it("returns ok without Supabase configured", async () => {
    const res = await post(publishedId);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("calls increment_view with the post id", async () => {
    const rpc = vi.fn(async () => ({ error: null }));
    mocks.supabase = { rpc };
    const res = await post(publishedId);
    expect(res.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("increment_view", { p_id: publishedId });
  });

  it("returns 500 when the RPC errors", async () => {
    mocks.supabase = { rpc: vi.fn(async () => ({ error: { message: "boom" } })) };
    const res = await post(publishedId);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false });
  });
});
```

Adjust mock shapes only if typecheck demands it; the route calls exactly
`supabase.rpc(name, args)`.

**Verify**: `pnpm test` → all pass, including 6 new tests.

### Step 2: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test` → all exit 0.

## Test plan

Step 1 is the test plan: 400 on missing/unknown/draft id, 200 no-op without
Supabase, RPC called with `p_id`, 500 on RPC error. Pattern:
`tests/atom.test.ts` (route handler invoked directly) +
`tests/get-posts.test.ts` (registry-derived expectations).

## Done criteria

- [ ] `pnpm test` exits 0; `tests/view-route.test.ts` exists with the 6 cases
- [ ] `pnpm typecheck` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The route no longer matches the "Current state" excerpt (e.g. plan 011's
  rate limiting landed first — then coordinate: these tests still apply but
  may need limiter-aware setup).
- The `vi.mock` getter approach fails because `route.ts` starts destructuring
  `supabase` at module load.

## Maintenance notes

- Plan 011 (rate limiting) will extend this file — its limiter cases belong
  next to these.
- If posts.json someday has no draft entry, the draft test self-skips; that's
  intentional (don't manufacture registry entries in tests).
