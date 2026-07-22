# NFR — Property Website MVP

**Status:** Draft v1
**Scope authority:** Bound by `ROADMAP.md` and `CLAUDE.md`. Same out-of-scope list applies (see PRD.md §4) — no NFR here should be read as implying a feature from that list.

---

## 1. Performance

- Public pages (`/`, `/search`, `/property/[id]`) should be server-rendered for fast first paint and SEO.
- Listing images should be optimized/responsive (Next.js `Image` component or equivalent) — no raw unoptimized full-size images served to list views.
- `/search` should return results in under ~1s against seeded data volumes (hundreds to low thousands of rows); no specific target needed beyond "feels instant" at MVP data scale.
- Chatbot responses should stream if the Anthropic API supports it for the chosen call pattern, so the visitor sees progressive output rather than a long blank wait.

## 2. Availability & Error Handling

- If the AI provider is down/slow, the chatbot must degrade gracefully (FR3.4) — the rest of the site (browse/search/detail pages) must keep working independently of AI availability.
- Admin CRUD failures (e.g. failed image upload) must show a clear error, not a silent failure or a blank admin screen.
- No specific uptime SLA for MVP — this is a pre-launch/internal build, not a production commitment yet.

## 3. Security

- Passwords hashed (bcrypt/argon2 via the auth library) — never stored or logged in plaintext.
- `isAdmin`-gated routes must be enforced server-side (middleware or route-level check), not just hidden in the UI.
- Standard input validation/sanitization on all form inputs and the chat endpoint (prevent injection into DB queries and into the LLM prompt where relevant).
- No PII beyond email + password is collected in this MVP (no phone numbers, no addresses tied to a `user`) since there's no lead/CRM system to justify collecting more.
- Secrets (Anthropic API key, DB credentials, map provider key) via environment variables only — never committed to the repo.

## 4. Cost & Abuse Control

- Rate limit the chat endpoint per session/IP (FR3.6) to bound Anthropic API spend.
- Rate limit login/register attempts to reduce brute-force/credential-stuffing exposure, even at MVP scale.
- No specific budget cap enforced in code for MVP, but rate limiting should be tunable via an environment variable so it can be tightened without a code change.

## 5. SEO

- Public pages server-rendered (not client-only) so search engines can index listings.
- Basic per-page `<title>` and meta description, generated from property data on detail pages.
- A simple sitemap covering published property URLs.
- (Deferred: structured data / schema.org markup — nice-to-have, not required for MVP; revisit in Phase 5 polish if time allows.)

## 6. Privacy & Data Retention

- Chat message logs (FR3.3) are stored only for the duration needed to support the in-session conversation; no long-term retention policy is required for MVP since there's no persistent chat history requirement.
- No 7-year audit-log-style retention requirement exists in this MVP (that requirement belonged to the old full-scope spec's admin audit log, which is out of scope here).
- If real listing data (vs. placeholder data) is used per the open seed-data decision, confirm there's no PII embedded in it (e.g. real owner contact info) before it goes into a shared dev environment.

## 7. Maintainability

- Prisma schema is the single source of truth for the data model; `SCHEMA.md` documents it in prose/ERD form alongside.
- API routes follow the contract in `API_CONTRACT.md` once written — no ad hoc endpoints outside that contract without updating the doc.
- Lint + typecheck run in CI (or at minimum, required before merge per `CLAUDE.md` workflow rules) even if a formal CI pipeline isn't set up until later.

## 8. Explicitly Not Required for MVP

To keep this document honest about what "non-functional" doesn't mean here: no multi-region hosting, no horizontal scaling plan, no formal SLA, no penetration test, no accessibility audit beyond basic semantic HTML/alt text, no load testing, **no production deployment pipeline**. Everything is built and run via **Docker/docker-compose** locally for now; production hosting (Vercel or otherwise) is a future request, not something to set up during this build. These can be revisited if/when the project scope expands beyond MVP.
