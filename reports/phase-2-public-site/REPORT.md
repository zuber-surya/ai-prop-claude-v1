# Phase 2 Report — Public site

**Date completed:** 2026-07-23
**Milestone:** [Phase 2 - Public site](https://github.com/zuber-surya/ai-prop-claude-v1/milestone/20) (#20)

## What shipped

- **`/`** — landing page: hero, plain (non-AI) search bar submitting to `/search`, a live "featured listings" grid pulling real published properties, an honest three-step "how it works" section.
- **`/search`** — filters matching `API_CONTRACT.md` §1 exactly (location, type, bedrooms as a minimum, price range, sort), a grid/list/map view toggle, pagination, and an empty state. Map view uses `react-leaflet` + OpenStreetMap tiles, plotting `Property.latitude`/`longitude` and explicitly counting ungeocoded listings rather than silently dropping them.
- **`/property/[id]`** — gallery (working thumbnail swap), specs, description, real amenities, an honest "floor plan not available" placeholder, a single-marker location map, a real reducing-balance EMI/affordability calculator, and a real "similar properties" query (same type, excluding the current listing). 404s via `notFound()` for missing or draft properties.
- **`/login`, `/register`** — wired to the Phase 1 auth API. Honors the `?next=` param `proxy.ts` sets when redirecting unauthenticated `/admin/**` access, with an open-redirect guard (`lib/redirect.ts`).
- **`GET /api/properties`, `GET /api/properties/:id`** — the public property API these pages are built on (`API_CONTRACT.md` §1), always scoped to `status: published` regardless of caller.

Also merged alongside this phase (not a Phase 2 deliverable per `ROADMAP.md`, but shipped in the same window): `progress.html`, a live GitHub status dashboard.

## Deliberate scope decisions

Every screen in this phase was adapted from a `design/reference/` mockup built for the older, larger-scope CRM spec. Per `UI_REFERENCE.md` §3's strip-lists (and CLAUDE.md §2's out-of-scope list), the following were consistently excluded across all four pages:
- AI match-score badges, "AI-powered search" framing, and the secondary/purple AI-accent color reserved for actual AI features (`UI_REFERENCE.md` §2) — this MVP's search is plain filter-based, and the chatbot (Phase 3) hasn't shipped yet
- The chat widget and any "Ask AI" CTA — Phase 3 scope, omitted rather than shipping a non-functional button
- Favorites/heart buttons — `SCHEMA.md` §4 has no `SavedProperty` table
- Agent contact card, "Message Agent", "Request Callback", "Schedule Visit" — no agent concept or visit scheduling in this MVP
- Lead/CRM navigation (Clients, Tasks, Analytics, "Add Lead") and fabricated nearby-landmark data
- Voice input (mic button) — explicitly out of scope (`CLAUDE.md` §2)
- Amenities filter on `/search` — not in `API_CONTRACT.md`'s documented query params

One API contract refinement made during this phase: the `bedrooms` filter changed from exact-match to a minimum (`gte`) — "3 bedrooms" in a real search almost always means "3 or more," and the original contract didn't specify either way.

## What was tested

Per `TESTING_STRATEGY_AND_DOD.md` §1.2 Phase 2 requirements, plus real functional verification beyond unit tests:
- 33 Vitest tests covering: property list/detail query construction (filters, sort mapping, pagination, 404 on missing/draft), price formatting, EMI calculation (verified against a known reference figure before trusting it in tests), and the open-redirect guard on post-login redirects.
- **Every page was actually rendered and interacted with via a real headless-browser session against the live seeded DB** (Playwright, installed to a scratch dir, not a project dependency) — not just built and code-reviewed. This caught two real bugs neither lint, typecheck, nor `next build` surfaced:
  - A Tailwind v4 token collision (`--spacing-xl` shadowing `max-w-xl`) that rendered the landing page's hero paragraph at 40px wide
  - A color-contrast bug (white text on a light-pink error banner) from using the wrong Material-style token pairing
- End-to-end flows exercised for real: registering a user through the actual UI and confirming a session cookie was set; logging in with `?next=/search` and confirming the redirect landed there; a wrong-password login and a duplicate-email registration, each confirming the real server error renders inline; a gallery thumbnail click actually swapping the displayed image; an EMI slider actually recalculating; a real draft property's id 404ing on both the detail page and the list endpoint (not just a made-up id); the admin route gate (401 anonymous) still enforced end-to-end after all this new code landed.

## Deviations from the plan

- **Merge-conflict cascade while landing this phase's PRs.** The five Phase 2 PRs were built stacked (each depending on the previous, unmerged one), and the first squash-merge in the chain (Phase 1's PR #9) had already taught a costly lesson: squash-merging produces a synthetic commit with no shared git history with branches built on the pre-squash commits, which cascades into phantom conflicts and can even cause GitHub to permanently auto-close a dependent PR if its base branch gets deleted before retargeting. For this phase's five-PR stack, merges used **regular merge commits** instead of squash specifically to preserve shared history — every retarget-and-merge step came back clean with zero conflicts, confirming the fix.
- No other deviations from `PRD.md`/`API_CONTRACT.md`/`SCHEMA.md` as written, beyond the bedrooms-filter refinement noted above.

## Scope-risk items encountered

None. No task in this phase touched anything on the out-of-scope list beyond what's already documented in the strip-lists above.

## Known gaps / carried forward

- No CI pipeline yet (same gap noted in the Phase 1 report) — lint/typecheck/test/build run locally before each PR.
- The default Next.js 404 page is unstyled; a styled one is Phase 5 "Polish" scope per `ROADMAP.md`.
- `/search`'s "list" view reuses the grid `PropertyCard` component in a single column rather than a true horizontal list-row layout — functional, not pixel-polished.

## Screenshots

See `./screenshots/` — captured via Playwright against the real seeded DB (14 fixture properties, `prisma/seed.ts`) after a fresh `npm install` + migrate + seed on the actually-merged `main`, not hand-picked or edited:
- `landing-page.png` — `/`, featured listings grid
- `search-grid.png` — `/search`, default grid view with filters
- `search-map.png` — `/search?view=map`, Leaflet + OSM markers at real Surat coordinates
- `property-detail.png` — `/property/[id]`, full page including EMI calculator and similar properties
- `login.png`, `register.png` — auth pages
