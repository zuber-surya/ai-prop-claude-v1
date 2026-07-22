# Property Website MVP

A real-estate listing website: public browse/search, an AI chatbot for natural-language Q&A and property search, simple email+password login, and a minimal admin screen to manage listings.

**Status:** Planning stage. Phase 0 (docs) is complete; no application code has been written yet — see [Project status](#project-status).

## What this is

- **Public site** — browse and search properties, view property detail pages. No login required.
- **AI chatbot** — natural-language Q&A and property search only. It answers questions and helps visitors find listings; it does not capture leads, create CRM records, book visits, or message anyone.
- **Login** — one role, `user` (email + password). Admin access is a single `isAdmin` flag, not a separate role system.
- **Admin CRUD** — a basic authenticated screen to create, edit, delete, and publish/unpublish property listings.

Leads/CRM, agent roles, notifications, visit scheduling, bulk upload, and multi-city/currency support are explicitly out of scope for this MVP. See [`CLAUDE.md`](CLAUDE.md) §2 for the full exclusion list.

## Tech stack

- Next.js (App Router), Node.js
- PostgreSQL + Prisma
- Tailwind CSS
- LLM: Anthropic API (direct)
- Maps: OpenStreetMap tiles + Leaflet.js
- Currency: INR only
- Local/dev via Docker (docker-compose for app + Postgres)

## Project status

This repo is currently docs-only:
- No `package.json`, `src/`, or `prisma/` yet — Phase 1 (data model + auth) hasn't started.
- Local git is initialized but has no commits yet.

Once Phase 1 scaffolding lands, this section and [`CLAUDE.md`](CLAUDE.md) will be updated with real install/build/test/run commands.

## Documentation

All planning docs live in [`docs/`](docs/) and are treated as authoritative by Claude Code (see [`CLAUDE.md`](CLAUDE.md) §8):

| Doc | Purpose |
|---|---|
| [`ROADMAP.md`](docs/ROADMAP.md) | Phase gates, current phase, what's allowed to be built right now |
| [`PRD.md`](docs/PRD.md) | Product requirements |
| [`NFR.md`](docs/NFR.md) | Non-functional requirements |
| [`API_CONTRACT.md`](docs/API_CONTRACT.md) | Endpoint contracts |
| [`SCHEMA.md`](docs/SCHEMA.md) | Data model / Prisma schema |
| [`TESTING_STRATEGY_AND_DOD.md`](docs/TESTING_STRATEGY_AND_DOD.md) | Testing levels and Definition of Done |
| [`GITHUB_WORKFLOW.md`](docs/GITHUB_WORKFLOW.md) | Issues, PRs, labels, milestones, CI |
| [`REPORTING.md`](docs/REPORTING.md) | Phase-end report and screenshot requirements |
| [`UI_REFERENCE.md`](docs/UI_REFERENCE.md) | Design screens, tokens, and screen-to-route mapping (source of truth for what's actually being built — `docs/design_reference/design-references-catalog.md` describes an older, larger CRM scope and should not be used for scope decisions) |

## Build progress

[`progress.html`](progress.html) is a live dashboard of GitHub milestones/issues/PRs — open it in any browser (fetches directly from the public GitHub API, no build step, no token needed).

## Working in this repo

See [`CLAUDE.md`](CLAUDE.md) for the full set of process rules (branching, commits, PRs, scope-creep policy, Definition of Done). In short: work happens in short-lived `feature/`/`fix/` branches off `main`, every change lands via PR, and no out-of-scope functionality gets built without flagging it first.
