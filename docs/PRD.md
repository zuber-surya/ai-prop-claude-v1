# PRD — Property Website MVP

**Status:** Draft v1
**Scope authority:** This PRD is bound by `ROADMAP.md` and `CLAUDE.md`. If anything here implies a feature listed as out-of-scope in those docs, those docs win.

---

## 1. Problem & Goal

Prospective buyers/renters need a fast way to browse property listings and get their questions answered without waiting on a human agent. The business needs a simple way to publish and manage listings.

**Goal of this MVP:** ship a public property-browsing site with an AI assistant that helps visitors find and understand listings, plus a minimal admin tool to manage those listings. Nothing more.

**Non-goals (see ROADMAP.md "parking lot" for the full list):** lead capture, CRM, agents, recommendation engine, notifications, visit scheduling.

---

## 2. Users

Only two user types exist in this MVP:

| User | Description |
|---|---|
| **Visitor** | Anyone browsing the public site, logged in or not. Login is not required to browse, search, or chat. |
| **Admin** | A user account with `isAdmin = true`. Manages property listings. There is no self-serve way to become admin; it's set directly in the DB or via a seed script for MVP. |

Login (`user` role) exists but does not unlock any additional public-site functionality in this MVP — it exists as groundwork, not because a feature currently needs it. (If nothing ends up requiring auth by the end of Phase 2, confirm with the product owner whether to keep it or cut it.)

---

## 3. Functional Requirements

### FR1 — Property Browsing (Public)
- FR1.1: Visitors can view a paginated/scrollable list of published properties.
- FR1.2: Visitors can filter by price range, property type, bedrooms, and location (text match).
- FR1.3: Visitors can sort by price or date added.
- FR1.4: Each property has a detail page: photos, description, price, specs (bedrooms/bathrooms/area), amenities, and location.
- FR1.5: Empty search results show a clear "no matches" state with a suggestion to broaden filters.
- FR1.6: Visitors can toggle to a map view on `/search` showing published properties as pins, using OpenStreetMap tiles + Leaflet.js. Clicking a pin shows a summary card linking to the property's detail page.

### FR2 — Authentication
- FR2.1: A visitor can register with email + password.
- FR2.2: A visitor can log in / log out.
- FR2.3: No email verification, password reset, or social login required for MVP.
- FR2.4: No public-facing feature is gated behind login in this MVP (see §2 note). **Open item, deferred:** whether this stays true or login should gate something (e.g. saved searches) is intentionally not decided yet — revisit before Phase 2 wraps, not a blocker for Phase 1.

### FR3 — AI Chatbot (Q&A / Search only)
- FR3.1: A chat widget is available on the public site, accessible with or without login.
- FR3.2: The chatbot answers natural-language questions about listings (e.g. "what 2-bedroom places do you have under 50 lakhs?") by querying the property data.
- FR3.3: The chatbot can hold a short back-and-forth within a single browser session; history does not need to persist across sessions or devices for MVP.
- FR3.4: If the AI provider call fails or times out, the widget shows a clear fallback message (e.g. "I'm having trouble right now — try the search filters above") rather than hanging or erroring silently.
- FR3.5: The chatbot **never** collects contact information, never creates any record other than the chat message log, and never initiates contact with the visitor.
- FR3.6: Chat requests are rate-limited per session/IP to control cost and abuse.

### FR4 — Admin Property Management
- FR4.1: An admin can log in and reach `/admin`, gated by `isAdmin`.
- FR4.2: An admin can create a new property listing (photos, description, price, specs, amenities, location, status).
- FR4.3: An admin can edit an existing listing.
- FR4.4: An admin can delete or unpublish a listing (unpublished listings don't appear on the public site).
- FR4.5: Listings have exactly two statuses: `draft` and `published`. No approval workflow.
- FR4.6: A non-admin user attempting to reach `/admin/*` is redirected/blocked (403 or redirect to login).

---

## 4. Out of Scope (explicit, to prevent re-litigation)

Restating from ROADMAP.md so this PRD is self-contained: leads/CRM, agent role/pipeline, requirement profile & recommendation engine, notifications (email/SMS/in-app), audit log, visit scheduling/calendar, session-based favorites & migration, bulk upload/CSV import, voice input, multi-city/multi-currency support.

Any request to add one of these should be treated as a scope-change request, not a bug fix or small addition.

---

## 5. Decisions Log (previously open, now resolved)

1. Map provider — OpenStreetMap tiles + Leaflet.js (open-source, free). Reflected in FR1.6.
2. Seed data source — placeholder/fixture data, not a real listings import. See ROADMAP.md Phase 1 and SCHEMA.md for the seeding approach.

All Phase 0 open decisions are now resolved.

---

## 6. Success Criteria for MVP

- A visitor with no account can browse, filter, and view property details end-to-end.
- A visitor can ask the chatbot a natural-language question and get a relevant answer referencing real listings, with a graceful fallback on AI failure.
- An admin can create a listing and see it go live on the public site within the same session.
- No feature listed in §4 exists anywhere in the shipped code, even partially.
