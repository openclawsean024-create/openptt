# OpenPTT backlog goal: bounded server-side article search

## Objective

Implement the next accepted backlog increment for bounded server-side article search (FR-008), reusing the existing PTT adapter and preserving transparent fallback states.

## Scope

- Add a server-side `/api/ptt/search` route with bounded board fan-out, typed PTT adapter reuse, query validation, ranking, source/partial/stale metadata, and mock fallback.
- Add typed client fetch + hook and a `/search` page with query, board context, snippets, empty state, source transparency, and article links.
- Route Dashboard global search submit into `/search?q=...` while preserving board exploration at `/boards`.
- Add deterministic API/UI tests and update PRD/SOP/STATUS evidence.

## Constraints

- Reading-only product boundary: no login, posting, replies, push notifications, accounts, payments, database, or secrets.
- Do not weaken or delete existing tests.
- This is a bounded index-page search slice; do not add Meilisearch/Typesense, database migrations, push credentials, Capacitor, or deployment in this increment.
- Search only typed index-page fields available from the existing PTT adapter and clearly label the bounded/stale limitation; do not claim unlimited full-text coverage.
- Keep the change compatible with Vercel serverless runtime and the canonical commands in SOP.md.

## Acceptance criteria

1. `/search?q=...` requests a typed search result through a same-origin `/api/ptt/search` route.
2. The server fan-out is bounded, ranks and deduplicates articles, uses the existing one-hour cache convention, and tolerates partial board failures.
3. When the remote feed is unavailable, the search page remains readable with mock results and clearly labels the bounded/fallback state.
4. Article links preserve board and article identity and reuse the existing article reader route.
5. Tests cover the adapter contract and UI fallback/empty/source states; typecheck, test, build, and diff checks pass.
6. Documentation maps the implementation to explicit FR/AC/UI identifiers and records known limitations.

## Stop conditions

- Stop after this bounded increment and its deterministic checks are complete.
- Do not start Web Push, Capacitor, external search indexing, or unrelated visual refactors in this run.
