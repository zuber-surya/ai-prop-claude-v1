# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Property Website MVP — read before touching any code

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
- Audit log
- Visit scheduling / calendar
- Session-based favorites migration
- Multi-city/multi-currency
- Voice input
- Bulk upload / CSV import

If a task seems to require one of these, stop and flag it rather than quietly building it.

## 3. Roles

Two states only: **anonymous** and **logged-in user**. Admin access is gated by a single `isAdmin` boolean/flag on the user record, checked in middleware — not a separate role table, not an invite system. This can be upgraded later; don't build the general version now.

## 4. Tech stack (fixed — don't substitute without asking)

- Next.js (App Router), Node.js
- PostgreSQL + Prisma
- Tailwind CSS
- LLM: **Anthropic API, direct** (not Bedrock — decided)
- Map provider: **OpenStreetMap tiles + Leaflet.js** (open-source, free, no API key required)
- **Currency: INR only** — single currency, no multi-currency support per §2. All monetary fields/UI assume INR.
- **Local/dev: Docker** (docker-compose for app + Postgres). Production/deployment is out of scope for now (see NFR.md §8) — build and run everything via Docker until that changes.
- Hosting: Vercel + managed Postgres — **deferred, not being set up yet** (Docker-only for the foreseeable build phase)

## 4a. Repo & tooling status

- The GitHub repo already exists, with phases/tasks/subtasks already represented in it. Reconcile `GITHUB_WORKFLOW.md`'s milestone/issue structure against what's already there rather than recreating it.
- `gh` CLI and a GitHub token are available in this environment — Claude Code should create/update issues, PRs, labels, and milestones directly per `GITHUB_WORKFLOW.md`, not just describe what should happen.
- **No application code exists yet.** Per `ROADMAP.md`, Phase 0 (planning docs) is exited but Phase 1 (data model + auth) hasn't started — there is no `package.json`, `src/`, or `prisma/` in this repo. Don't go looking for build/lint/test commands; there aren't any yet. Once Phase 1 scaffolding lands, add the real `npm`/`docker compose`/`prisma` commands here.
- The local git repo is initialized (`master` branch) but has **zero commits** — nothing has been pushed to the GitHub remote referenced in `GITHUB_WORKFLOW.md` yet. Check `git log`/`git status` before assuming any prior work landed.
- `docs/design_reference/design-references-catalog.md` documents an **older, larger-scope** CRM design set (leads, agents, bulk upload, AI recommendation engine, admin dashboards) and is **not** scope-authoritative — it predates the scope trim in this file. For what's actually in scope, use `UI_REFERENCE.md` §3 (screen-to-route mapping) and §4 (screens explicitly excluded), not the catalog.
- `UI_REFERENCE.md` §1 says design source files should live at `/design/reference/`; they currently live at `docs/design_reference/` (note the underscore, and the `docs/` prefix). That move hasn't happened — treat `docs/design_reference/` as the real path until it's reconciled.

## 5. Workflow rules

- **Branches:** `feature/<short-desc>`, `fix/<short-desc>`. No direct commits to `main`.
- **Commits:** Conventional Commits style (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- **PRs:** every change lands via PR, even solo. PR description must state which phase/task from the Roadmap it closes.
- **Before opening a PR:** run lint, typecheck, and tests locally; all must pass.
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
- `PRD.md` — product requirements (to be written)
- `NFR.md` — non-functional requirements (to be written)
- `API_CONTRACT.md` — endpoint contracts (to be written)
- `SCHEMA.md` / `prisma/schema.prisma` — data model (to be written)
- `TESTING_STRATEGY_AND_DOD.md` — testing levels and Definition of Done
- `GITHUB_WORKFLOW.md` — issues, PRs, labels, milestones, CI
- `REPORTING.md` — phase-end report and screenshot requirements
- `UI_REFERENCE.md` — design screens, tokens, and screen-to-route mapping

If any of the above conflicts with this file, this file wins on process/workflow; the others win on product/technical detail.
