# Roadmap & Phase Gates — Property Website MVP

Rule: **do not start a phase until the previous phase's gate is checked off.** Claude Code should refuse to start Phase N+1 work if Phase N's gate isn't satisfied, and should say so rather than proceeding anyway.

---

## Phase 0 — Planning docs (current phase)

- [x] Trim scope (this doc reflects it)
- [x] CLAUDE.md
- [x] ROADMAP.md (this file)
- [x] PRD.md
- [x] NFR.md
- [x] API_CONTRACT.md
- [x] SCHEMA.md (ERD + Prisma schema)
- [x] Testing strategy & Definition of Done doc
- [x] GITHUB_WORKFLOW.md
- [x] REPORTING.md
- [x] .env.example
- [x] UI_REFERENCE.md
- [x] Open decisions resolved (see below)

**Gate to exit Phase 0:** all docs above exist and open decisions are answered. **All satisfied — Phase 0 is exited.**

### Open decisions blocking Phase 0 exit
1. **LLM API** — Anthropic API direct. ✅ Decided.
2. **Map provider** — OpenStreetMap tiles + Leaflet.js (open-source, free, no API key). ✅ Decided.
3. **Seed data** — placeholder/fixture data for now (not a real listings import). ✅ Decided.
4. **Primary blue shade reconciliation** (`UI_REFERENCE.md` §6) — `#003d9b` vs `#0052CC` — pick one before `tailwind.config.js` is written. Small, non-blocking for docs; resolve during Phase 1/2 setup.

All Phase 0 open decisions are resolved (item 4 is a minor implementation detail, not a planning blocker). All docs are checked off above — **Phase 0 is exited.**

---

## Phase 1 — Data model + auth

- [ ] Prisma schema: `Property`, `User`, `ChatConversation`/`ChatMessage` (for Q&A history, no lead linkage)
- [ ] Postgres set up, migrations run cleanly from scratch
- [ ] Auth: register/login/logout for `user` role, `isAdmin` flag
- [ ] Seed script populating `Property` with placeholder/fixture data (not a real listings import) — see `SCHEMA.md` §note on seeding

**Build-order note:** the public site and admin CRUD (Phases 2 and 4) can be built against a temporary mock JSON layer — static fixture responses matching `API_CONTRACT.md` exactly — before the real Prisma/Postgres queries are wired up. This lets frontend work start without waiting on the DB layer. The mock layer must be swapped for real DB-backed routes before a phase's gate is considered met; a route still returning static fixture JSON is not "done" per `TESTING_STRATEGY_AND_DOD.md`.

**Gate:** fresh clone + `npm install` + migrate + seed produces a working local DB with a logged-in user and an admin user, **and** `/reports/phase-1-data-model-auth/REPORT.md` + screenshots exist per `REPORTING.md`.

---

## Phase 2 — Public site

Build against `UI_REFERENCE.md` §3's screen-to-route mapping (Stitch designs + strip-lists), not from scratch.

- [ ] `/` landing page with search bar + featured listings
- [ ] `/search` — filters + results list (grid/list/map toggle; map view uses Leaflet.js + OSM tiles, plots `Property.latitude`/`longitude`)
- [ ] `/property/[id]` — detail page
- [ ] `/login`, `/register`

**Gate:** a visitor with no login can browse, search, and view property details end-to-end against seeded data, **and** `/reports/phase-2-public-site/REPORT.md` + screenshots exist per `REPORTING.md`.

---

## Phase 3 — AI chatbot (Q&A/search only)

- [ ] `/api/chat` endpoint using Anthropic API
- [ ] Chat widget on the public site
- [ ] Chatbot can answer questions about listings and help narrow search (tool-calling into the properties DB)
- [ ] Explicit fallback message if the AI call fails/times out
- [ ] Rate limiting on the chat endpoint

**Non-negotiable:** chatbot never writes a lead, contact, or CRM record. It only reads property data and responds.

**Gate:** a visitor can ask "2BHK under 50 lakhs near a metro station" and get a sensible AI-assisted answer, with a graceful fallback if the AI call fails, **and** `/reports/phase-3-ai-chatbot/REPORT.md` + screenshots exist per `REPORTING.md`.

---

## Phase 4 — Admin CRUD

Build against `UI_REFERENCE.md` §3 (`property_inventory_admin_view`, `listing_editor_basic_info`) — strip the bulk-action UI per that doc's strip-list.

- [ ] `/admin` gated by `isAdmin`
- [ ] `/admin/properties` — list
- [ ] `/admin/properties/new`, `/admin/properties/[id]/edit` — create/edit
- [ ] Delete/unpublish

**Gate:** an admin can create a property and see it appear on the public site; can edit and delete/unpublish it, **and** `/reports/phase-4-admin-crud/REPORT.md` + screenshots exist per `REPORTING.md`.

---

## Phase 5 — Polish

- [ ] Basic SEO metadata on public pages
- [ ] Error/empty states (no search results, chat unavailable)
- [ ] Manual pass through Definition of Done doc for every route

**Gate:** MVP is demoable start to finish without known broken states, **and** `/reports/phase-5-polish/REPORT.md` + screenshots exist per `REPORTING.md`.

---

## Explicitly deferred (not phases — parking lot)

Leads/CRM, agent role, requirement profile/recommendation engine, notifications, audit log, visit scheduling, favorites, bulk upload, voice input, multi-city/currency. Revisit only if scope is formally re-expanded.
