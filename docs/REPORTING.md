# Reporting — Property Website MVP

**Status:** Draft v1
**Scope authority:** Bound by `ROADMAP.md`, `TESTING_STRATEGY_AND_DOD.md`, `GITHUB_WORKFLOW.md`. This doc defines the concrete deliverable produced at the end of each phase, so "phase-wise reporting" is a specific artifact, not an open-ended expectation.

---

## 1. What gets produced, and when

At the end of every phase in `ROADMAP.md` — right after its gate is confirmed satisfied, before starting the next phase — produce one report:

```
/reports/phase-<N>-<short-name>/
  REPORT.md
  screenshots/
    <page-or-flow-name>.png
```

Example: `/reports/phase-2-public-site/REPORT.md` + `/reports/phase-2-public-site/screenshots/search-page.png`.

This directory lives in the repo (committed), not in chat or an external tool — so it survives and stays attached to the code it describes.

---

## 2. REPORT.md contents (template)

```markdown
# Phase <N> Report — <Phase Name>

**Date completed:** <date>
**Milestone:** <GitHub milestone link/name>

## What shipped
- [bullet list of what was built, in plain language, not just a copy of the roadmap checklist]

## What was tested
- [summary per TESTING_STRATEGY_AND_DOD.md §1.2 for this phase — what's covered, what's deliberately not]

## Deviations from the plan
- [anything that came up during this phase that differed from PRD/NFR/API_CONTRACT/SCHEMA as originally written — and whether those docs were updated to match, per the "contract check" in the DoD]

## Scope-risk items encountered
- [anything labeled `scope-risk` in GitHub during this phase — resolved how, or still open]

## Known gaps / carried forward
- [anything intentionally incomplete, going into the next phase]

## Screenshots
- See ./screenshots/ — [one line per screenshot explaining what it shows]
```

Keep this factual and short — a few paragraphs and a bullet list per section, not a marketing document. Its job is to let someone (including a future Claude Code session with no memory of this one) reconstruct "what state is this project actually in" without re-reading every PR.

---

## 3. Screenshots

- Captured via a headless browser (Playwright, which is already a testing dependency per `TESTING_STRATEGY_AND_DOD.md` §1.1 — reuse it rather than adding a new tool).
- One screenshot per major page/flow delivered in that phase — e.g. Phase 2 → landing page, search results (grid), search results (map), property detail page. Not every possible state, just the primary ones.
- Screenshots reflect the app running against the seed/fixture data (per `SCHEMA.md` §5), so they're reproducible by anyone who clones the repo and runs the seed script — not hand-picked or edited images.
- Naming: `<page-or-flow>.png`, lowercase-kebab-case, matching the bullet in REPORT.md.

---

## 4. Who/what triggers this

Per `GITHUB_WORKFLOW.md` §2, a milestone (phase) is only closed once its gate is met. Producing the phase report is part of *confirming* the gate is met — i.e., writing `REPORT.md` and capturing screenshots is one of the last steps before checking off "phase complete," not an afterthought done later. Claude Code should treat "produce the phase report" as an explicit task on the board for each phase (add it as its own GitHub issue per phase, per `GITHUB_WORKFLOW.md` §3), not something that happens implicitly.

---

## 5. What this doc deliberately does NOT include

No live/hosted dashboard, no auto-generated PDF, no stakeholder-facing polish (slides, exec summary formatting) — `REPORT.md` is a plain internal record. If a polished external-facing report is ever needed for a specific audience, that's a separate, explicit request — don't over-invest here by default.
