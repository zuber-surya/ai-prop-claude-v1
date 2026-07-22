# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Property Website MVP — read before touching any code

## 0. Environment quirk — read before writing Next.js code

This repo pins `next@16.2.11`, a version newer than most training data. Per `AGENTS.md`: **APIs, conventions, and file structure may differ from what you expect.** Check `node_modules/next/dist/docs/` for the relevant guide before writing App Router code, and heed any deprecation warnings from `next dev`/`next build` rather than assuming older-Next patterns still apply.

## Commands

- `npm run dev` — start the Next.js dev server (`http://localhost:3000`)
- `npm run build` / `npm run start` — production build / run it
- `npm run lint` — ESLint (flat config, `eslint-config-next`'s core-web-vitals + typescript rulesets)
- `npx tsc --noEmit` — typecheck (no separate `typecheck` script defined)
- `npx prisma migrate dev` — apply/create a migration against `prisma/schema.prisma`
- `npx prisma generate` — regenerate the Prisma client after a schema change
- `npx prisma studio` — browse the DB
- `docker compose up -d` — start local Postgres (service `db`, host port **5433** → container `5432`, not the Postgres default — see `docker-compose.yml`; chosen to avoid clashing with other local Postgres containers)

**No test framework is installed yet** — `TESTING_STRATEGY_AND_DOD.md` specifies Vitest/Jest + Playwright, but neither is in `package.json`. Don't assume a `test` script exists; check `package.json` before running or referencing one.

## Architecture

- **Flat App Router, no `src/`.** Routes/components live directly under `app/` (`app/layout.tsx`, `app/page.tsx`, …), not `src/app/`. `tsconfig.json`'s `@/*` path alias resolves to the repo root accordingly.
- **Tailwind v4, CSS-first config — no `tailwind.config.js`.** Theme tokens are declared in `app/globals.css` via `@import "tailwindcss"` + an `@theme inline { ... }` block, wired through `@tailwindcss/postcss` in `postcss.config.mjs`. **This differs from `UI_REFERENCE.md` §2, which assumes a `tailwind.config.js`** — when translating `propvista_crm/DESIGN.md`'s design tokens, add them to the `@theme` block in `globals.css` instead of creating a JS config file.
- **Data model — 3 Prisma models, no cross-model FKs except `ChatMessage.userId`:** `User` (auth + `isAdmin` flag), `Property` (flat fields, `status: draft|published`, nullable `latitude`/`longitude` for pre-geocoded listings), `ChatMessage` (session-scoped, optionally linked to a `User`). Full rationale for these modeling choices is in `docs/SCHEMA.md` §3 — read that before altering the schema, since several fields (e.g. `price` as paise-denominated `Int`) encode deliberate decisions, not oversights.
- **`prisma.config.ts`** loads `DATABASE_URL` via `dotenv/config` (Prisma no longer auto-loads `.env`) — required for `prisma migrate`/`generate`/`studio` to see it.
- **Design references exist in two places:** `design/reference/` (the location `UI_REFERENCE.md` §1 specifies, and the one to treat as canonical) and `docs/design_reference/` (an earlier copy, not yet removed). Prefer `design/reference/` when implementing a screen; don't edit both.
- Three near-identical `skills/` trees (`.claude/`, `.agents/`, `.windsurf/`) hold Prisma reference docs for different tool integrations — informational only, not app code.

## Coding conventions

**Folder structure:**
```
app/
  layout.tsx, page.tsx, globals.css   — root layout + landing page
  search/page.tsx                     — /search
  property/[id]/page.tsx              — /property/[id]
  login/page.tsx, register/page.tsx   — auth pages
  admin/                              — admin screens, gated by isAdmin
    properties/page.tsx
    properties/new/page.tsx
    properties/[id]/edit/page.tsx
  api/                                — route handlers, see below
prisma/
  schema.prisma, migrations/
docs/                                  — planning docs (authoritative, see §9)
design/reference/                      — canonical design source (see Architecture)
```

**API routes** live under `app/api/**/route.ts` (Next.js App Router Route Handlers), mirroring `API_CONTRACT.md`'s endpoint list exactly:
- `app/api/auth/register/route.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`
- `app/api/properties/route.ts`, `app/api/properties/[id]/route.ts`
- `app/api/admin/properties/route.ts`, `app/api/admin/properties/[id]/route.ts`
- `app/api/chat/message/route.ts`

Don't add a route outside this list without updating `API_CONTRACT.md` in the same PR (per its own §"Endpoints outside this contract should not be added without updating this doc first").

**Error handling pattern:** every route handler returns errors in the shape already fixed by `API_CONTRACT.md`'s conventions — `{ "error": { "code": string, "message": string } }` with the matching HTTP status (`401`/`403` for auth per-route rules, `404` for missing/unpublished resources, `429` with `Retry-After` for rate limits, `503` for AI-provider failure). Unexpected/unhandled errors return a generic `500` with a non-leaking message — no stack traces or raw DB errors in the response body; log the detail server-side instead.

## 1. What this project is (MVP scope — do not exceed)

A real-estate listing website with:
1. **Public site** — browse/search properties, property detail pages. No login required.
2. **Simple login** — one role only: `user`. Email+password auth. No invite flow, no agent/admin roles at the account level (admin access is a single flag/allowlist, not a full role system — see §3).
3. **AI chatbot** — natural-language Q&A and property search only. It answers questions and helps people find listings. **It does not capture leads, does not create CRM records, does not book visits, and does not message anyone.**
4. **Admin CRUD** — a basic authenticated screen to create/edit/delete/publish property listings. No approval workflow, no bulk upload, no CSV import unless explicitly requested later.

## 2. Explicitly OUT of scope for this MVP

Do not build, scaffold, or leave stubs for any of the following unless the roadmap is amended:
- Leads, CRM, lead pipeline, opportunities, lead claiming
- Agent role, agent performance, leaderboard
- Requirement Profile / AI Recommendation Engine (Module 3 in the old spec)
- Notifications (email/SMS/in-app), batching
- Audit log — may be reconsidered as a future phase if a real need shows up; not a requirement now
- Visit scheduling / calendar
- Session-based favorites migration
- Multi-city/multi-currency
- Voice input
- Bulk upload / CSV import

If a task seems to require one of these, stop and flag it rather than quietly building it.

## 3. Roles

Two states only: **anonymous** and **logged-in user**. Admin access is gated by a single `isAdmin` boolean/flag on the user record, checked in middleware — not a separate role table, not an invite system. This can be upgraded later; don't build the general version now.

## 4. Tech stack (fixed — don't substitute without asking)

- Next.js (App Router), TypeScript, Node.js
- PostgreSQL + Prisma
- Tailwind CSS
- LLM: **Anthropic API, direct** (not Bedrock — decided)
- Map provider: **OpenStreetMap tiles + Leaflet.js** (open-source, free, no API key required)
- **Currency: INR only** — single currency, no multi-currency support per §2. All monetary fields/UI assume INR.
- **Local/dev: Docker** (docker-compose for app + Postgres). Production/deployment is out of scope for now (see NFR.md §8) — build and run everything via Docker until that changes.
- Hosting: Vercel + managed Postgres — **deferred, not being set up yet** (Docker-only for the foreseeable build phase)

## 4a. Repo & tooling status

- **GitHub structure is set up** per `GITHUB_WORKFLOW.md` §2/§5: milestones for Phases 0–5 (Phase 0 closed), the full label scheme (`phase-0`…`phase-5`, `type:epic/feature/bug/chore/docs`, `scope-risk`, `blocked`), and Phase 1's remaining work tracked as two epics with one task issue each (`Sprint 1.1 — Auth` → #3, `Sprint 1.2 — Seed data` → #4). Check current issues/milestones with `gh issue list --state all` / `gh api repos/<owner>/<repo>/milestones` before assuming this snapshot is still accurate. Branches for those issues, when started, should be `phase-1/auth-register` and `phase-1/seed-data` respectively, per §5's convention.
- `gh` CLI is installed but **not on PATH** in this environment — invoke it via its full path (`C:\Program Files\GitHub CLI\gh.exe` on Windows) or resolve it with `Get-Command`/`where.exe` first. A GitHub token is authenticated (`repo`, `workflow`, `read:org`, `gist` scopes) but **missing `read:project`** — Project-board (§7 of `GITHUB_WORKFLOW.md`) operations need `gh auth refresh -s read:project`, which requires an interactive login only the user can do.
- **App scaffolding has landed** (Next.js 16 + Prisma + Tailwind v4, on `main`, tracking `origin/main`). Prisma schema, Postgres (docker-compose), and the initial migration are done and verified working. Auth and the seed script are the remaining Phase 1 work (tracked in issues #1–#4 above). See [Commands](#commands)/[Architecture](#architecture) above for what actually exists.
- `docs/design_reference/design-references-catalog.md` documents an **older, larger-scope** CRM design set (leads, agents, bulk upload, AI recommendation engine, admin dashboards) and is **not** scope-authoritative — it predates the scope trim in this file. For what's actually in scope, use `UI_REFERENCE.md` §3 (screen-to-route mapping) and §4 (screens explicitly excluded), not the catalog.

## 5. Git workflow

- **Branches:** one per issue, named `phase-N/short-desc` (e.g. `phase-1/auth-register`) — matches `GITHUB_WORKFLOW.md` §3. Never commit directly to `main`.
- **Commits:** Conventional Commits style (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- **PRs:** must link the issue they close, and include a test summary; UI-affecting changes must include a screenshot.
- **Before opening a PR:** lint, typecheck, and tests must all pass locally.
- **Phase sequencing:** all of a phase's issues merge before the next phase starts (per `ROADMAP.md`'s phase gates).
- **No scope creep:** if a task reveals a need for something in §2, stop and report it instead of building it.
- **Commit only working code.** Don't commit commented-out blocks, TODO scaffolding for out-of-scope features, or dead code.

## 6. Testing expectations

- Every API route needs at least one happy-path test and one auth/permission test.
- Every DB migration must be reversible or explicitly noted as not.
- The chatbot's search endpoint needs tests for: normal query, empty results, and AI-provider failure (fallback behavior).

## 7. Definition of Done (per task)

A task is done when: code is merged via PR, tests pass, the relevant Roadmap phase-gate checklist item is checked off, and no out-of-scope code was introduced.

## 8. Documents Claude Code should treat as authoritative

- `ROADMAP.md` — phase gates, current phase, what's allowed to be built right now
- `PRD.md` — product requirements
- `NFR.md` — non-functional requirements
- `API_CONTRACT.md` — endpoint contracts
- `SCHEMA.md` / `prisma/schema.prisma` — data model
- `TESTING_STRATEGY_AND_DOD.md` — testing levels and Definition of Done
- `GITHUB_WORKFLOW.md` — issues, PRs, labels, milestones, CI
- `REPORTING.md` — phase-end report and screenshot requirements
- `UI_REFERENCE.md` — design screens, tokens, and screen-to-route mapping

If any of the above conflicts with this file, this file wins on process/workflow; the others win on product/technical detail.
