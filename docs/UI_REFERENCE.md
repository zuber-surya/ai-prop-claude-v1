# UI Reference — Property Website MVP

**Status:** Draft v1
**Source:** `design.zip` (Stitch export, "PropVista CRM" design set), uploaded 2026-07-22.
**Scope authority:** Bound by `PRD.md`, `ROADMAP.md`, `CLAUDE.md`. This doc doesn't add scope — it maps existing visual designs onto the scope already agreed. Where a design screen includes out-of-scope features, §3 says what to strip.

---

## 1. Where the source files live

The design export should be committed into the repo (not left as a loose upload) at:
```
/design/reference/
  propvista_crm/DESIGN.md                  <- design system (colors, type, spacing, components)
  a_clean_modern_minimal_flat_line_illustration.../screen.png   <- reusable search icon asset
  <screen-name>/code.html
  <screen-name>/screen.png
```
Each `code.html` is real semantic markup — implementable directly, not just a picture to eyeball. Use it as the structural starting point per screen, restyled/rewired per §3's strip-list where a screen includes out-of-scope elements.

---

## 2. Design system → Tailwind config

`propvista_crm/DESIGN.md` is the single source of truth for visual tokens. It should be translated directly into `tailwind.config.js` rather than re-decided:

| Token category | Source | Notes |
|---|---|---|
| Colors | `DESIGN.md` front-matter `colors:` block | Primary `#0052CC` (or `#003d9b` per the front-matter primary value — reconcile the two; front-matter is likely the more precise source, prose section rounds it) for core actions; Secondary `#8E44AD`/`#873da6` reserved **only** for AI-driven elements (match scores, chat widget, AI action buttons) — never for standard UI, per DESIGN.md's own rule |
| Typography | `DESIGN.md` `typography:` block | Inter throughout; display/headline/body/label scale as specified |
| Spacing | `DESIGN.md` `spacing:` block | 8px base unit; `xl` (40px) between page sections, `md`/`lg` (16/24px) inside cards |
| Radius | `DESIGN.md` `rounded:` block | 8px (0.5rem) standard components, ~10px for cards |
| Shadows | DESIGN.md "Elevation & Depth" section | Level 1 (cards): `0px 2px 4px rgba(0,0,0,0.05)`; Level 2 (modals/dropdowns): `0px 12px 24px rgba(0,0,0,0.1)` |

**Rule to carry into implementation:** the Secondary/purple color is an AI-context signal, not a decoration — match-score badges, the chat widget, "Get AI Loan Analysis"-style buttons use it; regular buttons/nav/primary actions use Primary blue. Don't blend these.

---

## 3. Screen-to-route mapping (in scope — build these)

| Design screen | Route | What to keep | What to strip (out of scope) |
|---|---|---|---|
| `propvista_crm_homepage` | `/` | Hero, AI search bar, featured listings grid, "how it works" section, footer | Contact form block (no lead capture — FR6 doesn't exist in this MVP); testimonials are fine to keep as static content if desired, or cut for a leaner v1 — a call, not a spec requirement |
| `search_results_standard_view` | `/search` (AI-ranked state) | Search bar, results grid with match % + reasons, pagination | None — this one maps cleanly to FR2.1–FR2.3 |
| `search_results_filter_fallback_view` | `/search` (fallback state) | The "AI temporarily unavailable, showing filter results" banner, results without match scores | None — maps directly to FR2.6/FR3.4 |
| `search_results_empty_state` | `/search` (no-results state) | Empty-state illustration, "no matches" messaging, refine-search CTA | "Save this search" suggestion, if present — no saved-search feature in this MVP |
| `property_details_premium_view` | `/property/[id]` | Gallery, header (title/price/specs/favorite), description, amenities, floor plan, map, EMI/affordability calculator, similar properties | "Message Agent"/"Request Callback"/"Schedule Visit" CTAs and the agent contact card — no agent/CRM/visit-scheduling in this MVP. Replace with a single "Ask AI about this property" CTA that opens the chat widget instead |
| `property_inventory_admin_view` | `/admin/properties` | Property grid/list, status badges (map to `draft`/`published` only — collapse any "pending approval" state shown), sorting | Multi-select bulk actions (publish/archive/delete in bulk) — no bulk upload/bulk actions in this MVP; single-item actions only |
| `listing_editor_basic_info` | `/admin/properties/new`, `/admin/properties/[id]/edit` | Form fields: title, price, bedrooms/bathrooms, area, location, amenities | None structural — maps directly to FR4.2/FR4.3, just wire to the simpler two-status model instead of an approval workflow |

**Chat widget:** no screen in the export is dedicated to the chat widget itself (it appears as a floating icon on the homepage). Build it as a persistent bottom-right widget per that homepage reference, styled with the AI/secondary color per §2, since there's no dedicated chatbot UI screen to follow more precisely.

---

## 4. Screens explicitly NOT being built (archived reference only)

These stay in `/design/reference/` for provenance but must not be implemented — they belong to the old full-scope spec:

- `admin_agent_command_center` — KPI/lead/conversion dashboard (no CRM/leads in this MVP)
- `lead_pipeline_kanban_view` — lead pipeline
- `lead_detail_sarah_jenkins` — lead detail view
- `bulk_upload_validation_results` — CSV bulk upload
- `ai_chatbot_configuration` — admin chatbot config screen; also references Bedrock model selection and human-agent escalation, both decided against (`CLAUDE.md` §4: Anthropic direct; no agent role)
- `customer_account_dashboard` — built around saved properties/requirement profile/inquiry history, none of which exist in this MVP (see PRD.md FR2.4's open item — if login ever gates something, revisit this screen then, not now)

If a future scope expansion resurrects any of these, this doc is where to un-archive them from — don't rebuild from scratch.

---

## 5. Reusable assets

- `a_clean_modern_minimal_flat_line_illustration_of_a_magnifying_glass_over_a/screen.png` — extract as an SVG/icon component for the search bar.
- `propvista_crm/DESIGN.md` itself — treat as living documentation of the Tailwind theme; if the theme ever changes, update this file's front-matter, don't let `tailwind.config.js` and this doc drift apart.

---

## 6. Open item

The two shades of Primary blue in `DESIGN.md` (`#003d9b` in the front-matter `colors.primary` vs. `#0052CC` named in the prose "Colors" section) should be reconciled to one value before `tailwind.config.js` is written — pick one and update this doc, don't carry both forward as ambiguous.
