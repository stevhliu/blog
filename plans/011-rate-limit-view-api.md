# Plan 011: Rate-limit the view-count endpoint

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e137d21..HEAD -- app/api/view/ tests/view-route.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: plans/005-view-api-route-tests.md (its test file is extended here)
- **Category**: security
- **Planned at**: commit `4e137d21`, 2026-07-15

## Why this matters

`POST /api/view` is unauthenticated and unthrottled: each request triggers a
Supabase RPC, so anyone replaying requests can inflate counts and generate
unbounded Supabase usage. The id allowlist already blocks injection, and view
counters are inherently spoofable — so the goal is *damping*, not
authentication: a cheap per-instance rate limiter plus an origin check that
turns a trivially scriptable endpoint into an annoying one, with zero effect
on real readers.

Honest framing: on Vercel serverless, an in-memory limiter is per-instance
(cold starts reset it, parallel instances don't share it). That is accepted
here — the alternative (durable store) adds infrastructure this site doesn't
otherwise need. This is defensive maintenance for a personal blog, not a
hard guarantee.

## Current state

- `app/api/view/route.ts` — full current handler (14 effective lines; see
  plan 005's "Current state" for the complete listing). Flow: parse `id` from
  the query string → 400 if not in the published-post allowlist → 200 no-op if
  Supabase unconfigured → `supabase.rpc("increment_view", { p_id: id })` →
  500 on error, else 200.
- The only legitimate caller is `app/(post)/view-counter.tsx` — a client
  component that fires **once per page load** (guarded by a ref) via
  `fetch("/api/view?id=...", { method: "POST", keepalive: true })`, and skips
  entirely in development. Same-origin, so an Origin/Referer check won't
  affect it.
- `tests/view-route.test.ts` exists if plan 005 landed (dependency); its
  mock scaffolding (`mocks.supabase` getter) is reused here.
- Deploy target is Vercel (README). No middleware file exists in the repo.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Tests     | `pnpm test`      | all pass            |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `app/api/view/rate-limit.ts` (create — pure limiter logic)
- `app/api/view/route.ts`
- `tests/view-route.test.ts` (extend)
- `tests/rate-limit.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- No new dependencies (no upstash/redis/kv). No `middleware.ts`.
- `app/(post)/view-counter.tsx` — the client stays fire-and-forget.
- The Supabase RPC or schema.

## Git workflow

- Branch: `advisor/011-rate-limit-view-api`
- Commit style: short lowercase imperative subject (repo examples: "add animations", "polish").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Pure limiter module

Create `app/api/view/rate-limit.ts` — a dependency-free fixed-window limiter
factory (factory so tests can create isolated instances and control time):

```ts
// Fixed-window in-memory rate limiter. Per serverless instance by design:
// cold starts reset it and parallel instances don't share state. That's
// accepted damping for a spoofable view counter, not a security boundary.
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
  now?: () => number;
}) {
  const hits = new Map<string, { count: number; windowStart: number }>();

  return function allow(key: string): boolean {
    const t = now();
    const entry = hits.get(key);
    if (!entry || t - entry.windowStart >= windowMs) {
      if (hits.size >= maxKeys) hits.clear(); // crude memory cap
      hits.set(key, { count: 1, windowStart: t });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Wire it into the route

In `app/api/view/route.ts`, after the existing id validation and before the
Supabase call:

```ts
import { createRateLimiter } from "./rate-limit";

// 10 counted views per IP per 10 minutes — far above any organic reading
// pace across a 7-post blog, far below scripted inflation.
const allow = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

// inside POST, after the validIds check:
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(`${ip}`)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
```

Also add a light origin check before the limiter: if an `Origin` header is
present AND its host is neither `stevhliu.com` nor a `localhost`/`127.0.0.1`
host, return 403. (Absent Origin passes — RSS readers and the keepalive fetch
must not break; `view-counter.tsx` is same-origin so browsers send a matching
Origin.)

Keep every existing behavior (400 / no-supabase 200 / 500) unchanged.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Tests

Create `tests/rate-limit.test.ts` for the pure limiter (injected `now`):
- allows up to `limit` within the window, rejects the next
- a new window resets the count
- distinct keys don't interfere
- `maxKeys` overflow clears rather than growing unbounded

Extend `tests/view-route.test.ts` (from plan 005):
- 11th rapid request from the same `x-forwarded-for` → 429 (first 10 → not 429)
- cross-origin `Origin: https://evil.example` → 403
- same-origin `Origin: https://stevhliu.com` → passes through to the existing behavior

Note: the route module holds ONE limiter instance per module load — use
`vi.resetModules()` + dynamic `import()` per test (or distinct
`x-forwarded-for` values per test) so tests don't trip each other's limits.

**Verify**: `pnpm test` → all pass.

### Step 4: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.

## Test plan

Step 3 covers it: pure limiter unit tests with injected time, plus route-level
429/403/pass-through cases. Pattern: `tests/view-route.test.ts` mock scaffolding.

## Done criteria

- [ ] `pnpm test` exits 0 including the new limiter and route cases
- [ ] `grep -n "429" app/api/view/route.ts` → one match
- [ ] `pnpm build` exits 0
- [ ] `git status --porcelain` shows changes only to in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 005's test file doesn't exist (dependency not landed) — these tests
  build on its scaffolding.
- The route drifted from plan 005's excerpt.
- You find evidence the site is NOT behind a proxy that sets
  `x-forwarded-for` (then the key falls back to "unknown" for everyone and
  the limiter would throttle all readers collectively — report before wiring).

## Maintenance notes

- If real abuse ever shows up in Supabase usage, the upgrade path is a durable
  limiter (Vercel KV/upstash) behind the same `allow(key)` interface — the
  route wiring wouldn't change.
- The `limit`/`windowMs` constants are the knobs; keep them generous. False
  positives (shared NAT IPs at offices) are worse than missed inflation here.
- Reviewer: confirm the Origin check treats an ABSENT header as pass — feed
  readers and non-browser clients must not get 403s.
