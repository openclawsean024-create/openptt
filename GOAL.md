# OpenPTT backlog goal: real cross-board discovery

## Objective

Extend the existing server-side PTT adapter to the Dashboard, Trending, and Live Trending surfaces so production discovery uses typed cross-board data when available, while preserving safe mock fallback and explicit source/stale states.

## Scope

- Implement the smallest production-ready cross-board feed increment for the existing Vite + React + Vercel app.
- Add a server-side API route and typed client adapter; browsers must not call ptt.cc directly.
- Reuse the existing board adapter, cache policy, source metadata, and mock data boundary.
- Update DashboardPage, HotPage, and LiveHotPage only as needed to consume the adapter.
- Add deterministic unit/component coverage for success, partial failure, fallback, loading, and stale/error copy.
- Update PRD/SPEC.md, SOP.md, and STATUS.md with a new FR/AC reference if the current spec has no adequate identifier.

## Constraints

- Reading-only product boundary: no login, posting, replies, push notifications, accounts, payments, database, or secrets.
- Do not weaken or delete existing tests.
- Do not claim real-time data; expose fetchedAt, staleAt, source, and fallback state.
- Keep the change compatible with Vercel serverless runtime and the canonical commands in SOP.md.
- Do not deploy or push from the implementation run.

## Acceptance criteria

1. Dashboard and trending pages request a typed cross-board feed through a same-origin `/api/ptt/...` route.
2. The server fan-out is bounded, deduplicates articles, uses the existing one-hour cache convention, and tolerates partial board failures.
3. When the remote feed is unavailable, each surface remains readable with the existing mock snapshot and clearly labels the fallback/source state.
4. When remote data is present, article links preserve board and article identity and reuse the existing article reader route.
5. Tests cover the adapter contract and the UI fallback/source states; typecheck, test, build, and diff checks pass.
6. Documentation maps the implementation to explicit FR/AC/UI identifiers and records known limitations.

## Stop conditions

- Stop after this bounded increment and its deterministic checks are complete.
- Do not start Web Push, Capacitor, search indexing, or unrelated visual refactors in this run.
