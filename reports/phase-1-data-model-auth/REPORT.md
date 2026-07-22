# Phase 1 Report — Data model + auth

**Date completed:** 2026-07-22
**Milestone:** [Phase 1 - Data model + auth](https://github.com/zuber-surya/ai-prop-claude-v1/milestone/19) (#19)

## What shipped

- **Prisma schema** — `User`, `Property`, `ChatMessage` models per `SCHEMA.md` §2, with the initial migration applied to a local Postgres instance (docker-compose, host port 5433).
- **Auth** — `POST /api/auth/register`, `/login`, `/logout` (bcrypt password hashing, stateless JWT session cookie via `jose`), and server-side `isAdmin` gating on `/admin/**` + `/api/admin/**` via `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`; caught and used the new convention).
- **Seed script** — `prisma/seed.ts`, 14 fixture properties across real Surat neighborhoods, varied type/price/bedrooms/status (10 published / 4 draft), mixed geocoding (9 with lat/lng, 5 without), wired via Prisma 6+'s `migrations.seed` config.
- **Progress dashboard** (`progress.html`, PR #12, not yet merged) — a live, self-contained GitHub status page. Not a Phase 1 deliverable per `ROADMAP.md`, but built and merged-in-spirit alongside this phase's work.

All three code PRs (scaffold, auth, seed) are merged into `main` as of this report.

## What was tested

Per `TESTING_STRATEGY_AND_DOD.md` §1.2 Phase 1 requirements:
- Register/login/logout happy path, duplicate-email rejection (409, via Prisma's `P2002` unique-constraint catch rather than check-then-create, to avoid a race), wrong-password rejection (401), `isAdmin` flag correctly set/read — 8 Vitest tests, all passing. No test framework existed before this phase; Vitest was added specifically to satisfy this requirement.
- End-to-end smoke tests against the real dev DB (not just mocks) for the full auth flow, including `/api/admin/*` returning 401 anonymous / 403 non-admin / 401 again after logout.
- Seed script run against a real freshly-migrated DB, output verified via direct `psql` queries (row counts, status split, geocoding split), and re-run to confirm idempotency.
- **Gate criterion verified directly**, not assumed: fresh `git checkout main` + `npm install` + `prisma migrate status` (schema in sync) + `prisma db seed` (14 rows) + a real registered user + a real admin user (`isAdmin` set directly in the DB per `PRD.md` §2, confirmed via login response) — all executed for real, not just reviewed.

## Deviations from the plan

- **`middleware.ts` → `proxy.ts`**: Next.js 16 deprecated and renamed the middleware convention. Not a plan deviation exactly, but worth recording — a session going in blind would have written `middleware.ts` and had it silently not run.
- **`prisma.config.ts` had a pre-existing type error** (`DATABASE_URL` typed as possibly `undefined`) blocking `tsc`/`next build`; fixed with a non-null assertion as part of the scaffold work.
- **GitHub issue-tracker reset mid-phase**: partway through the phase, all GitHub milestones and issues were deliberately deleted and recreated at the user's request (clean-slate reset). This broke the `Closes #N` links in the then-open PRs (issue numbers are never reused) and, separately, caused PR #10 to be **auto-closed by GitHub** (not merged) when its base branch was deleted as part of a squash-merge — GitHub does not allow reopening a PR whose base branch no longer exists. Recovered by opening a fresh PR (#17) from the same branch/commits, retargeted at `main`.
- **Squash-merging repeatedly broke downstream branches**: each squash-merge produced a synthetic commit on `main` with no shared git history with branches created from the pre-squash commits, causing spurious `add/add` conflicts (identical content, no common ancestor) on `package.json`/`package-lock.json`/`prisma.config.ts`, and one real content conflict on `docs/ROADMAP.md` checkboxes. Resolved by merging `main` into each downstream branch, taking the superset of dependencies, regenerating `package-lock.json` from scratch rather than hand-resolving it, and re-verifying lint/typecheck/test/build/seed after each resolution before merging onward.

None of these required updating `PRD.md`/`API_CONTRACT.md`/`SCHEMA.md` — they were process/tooling issues, not product-contract changes.

## Scope-risk items encountered

None. No task in this phase touched anything on the out-of-scope list (`CLAUDE.md` §2).

## Known gaps / carried forward

- No CI pipeline exists yet — lint/typecheck/test/build were run locally before each PR, per `CLAUDE.md` §5, but `GITHUB_WORKFLOW.md` §6's GitHub Actions checks aren't wired up.
- Branch protection on `main` is not actually configured (`GITHUB_WORKFLOW.md` §1 describes it as protected; it isn't, in practice).
- `docker-compose.yml`'s `db` service has no healthcheck (flagged previously; still cosmetic since nothing depends on it yet).

## Screenshots

None. Phase 1 delivered the data model, auth API, and seed script only — no UI pages exist yet (`/login`, `/register` are Phase 2 deliverables per `ROADMAP.md`). `REPORTING.md` §3 calls for one screenshot per major page/flow delivered; there are none to capture this phase. The verification evidence for this phase is the `curl`/`psql` transcripts described above instead.
