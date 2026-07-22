# GitHub Workflow — Property Website MVP

**Status:** Draft v1
**Scope authority:** Bound by `CLAUDE.md`, `ROADMAP.md`, `TESTING_STRATEGY_AND_DOD.md`. This doc makes those concrete on GitHub specifically — it doesn't change any product/technical decision.

---

## 1. Repo structure basics

**The GitHub repo already exists**, with phases/tasks/subtasks already represented in it. This doc's job is to reconcile that existing structure against the milestone/issue/label scheme below — not to set up a repo from scratch. Where the existing repo's structure already matches (e.g. phases as milestones), just adopt it; where it doesn't, propose a reconciliation rather than silently restructuring what's there.

`gh` CLI and a GitHub token are available in this environment, so Claude Code should perform these actions directly (create/update issues, labels, milestones, project board cards) rather than just describing what a human should click through.

- Default branch: `main`, protected — no direct pushes, PR required, status checks (see §6) must pass before merge.
- Branch naming: see §3.
- One PR per task/subtask-issue where practical — small, reviewable, mappable to a single ROADMAP.md line.

---

## 2. Hierarchy: Phase → Sprint → Task → Subtask

This repo already has phases/sprints/tasks/subtasks represented — this section defines what each level means on GitHub so Claude Code creates/reconciles them consistently rather than inventing structure ad hoc.

| Level | GitHub construct | Example |
|---|---|---|
| **Phase** | Milestone | `Phase 2 — Public site` |
| **Sprint** | Epic issue *within* that milestone (GitHub has no native sub-milestone, so a sprint is an issue labeled `type:epic`, assigned to the phase's milestone, with a checklist of task issues) | `Sprint 2.1 — Search & results page` |
| **Task** | Issue, assigned to the same milestone, linked to its parent sprint/epic issue (`Part of #<epic-issue-number>` in the body, plus a checkbox in the epic's checklist) | `Add GET /api/properties with filters/sort/pagination` |
| **Subtask** | Either a checklist item inside the task issue's body, or — if it's substantial enough to need its own branch/PR/tests — a separate issue linked with `Part of #<task-issue-number>` | `Add price-range filter to GET /api/properties` |

Rule of thumb for subtask-as-checklist vs. subtask-as-issue: if it needs its own branch and PR, it's an issue; if it's a sub-step reviewed as part of the parent task's single PR, it's a checklist item. Don't create an issue for every trivial sub-step — that defeats the point of the hierarchy.

Every Phase (milestone) in `ROADMAP.md` should have at least one Sprint (epic) per logical grouping of its checklist items — e.g. Phase 2's four checklist items could be one sprint each, or grouped into fewer sprints if they're small. Claude Code should propose the sprint breakdown for a phase before creating task issues under it, so the grouping can be sanity-checked rather than assumed.

### Milestones = Roadmap Phases

Each phase in `ROADMAP.md` gets a corresponding GitHub Milestone:

| Milestone | Maps to |
|---|---|
| `Phase 0 — Planning` | ROADMAP.md Phase 0 |
| `Phase 1 — Data model + auth` | ROADMAP.md Phase 1 |
| `Phase 2 — Public site` | ROADMAP.md Phase 2 |
| `Phase 3 — AI chatbot` | ROADMAP.md Phase 3 |
| `Phase 4 — Admin CRUD` | ROADMAP.md Phase 4 |
| `Phase 5 — Polish` | ROADMAP.md Phase 5 |

Every issue and PR belongs to exactly one milestone. A milestone is closed only when every issue in it is closed **and** the corresponding ROADMAP.md gate is satisfied (checkboxes checked, DoD met per `TESTING_STRATEGY_AND_DOD.md` §3) — closing the milestone is a manual confirmation step, not automatic just because issues are closed.

---

## 3. Branches — one per task or subtask-as-issue, typed by kind of work

Every task issue and every subtask-that-is-its-own-issue gets its own branch off `main` when work starts on it. Branch name encodes the *type* of work (feature/fix/chore/docs) plus a reference back to the issue, so any branch is traceable to exactly one issue without opening it:

```
<type>/<issue-number>-<short-desc>
```

| Type prefix | Used for | Example |
|---|---|---|
| `feature/` | New functionality (`type:feature` issues) | `feature/42-property-search-filters` |
| `fix/` | Bug fixes (`type:bug` issues) | `fix/57-price-filter-off-by-one` |
| `chore/` | Tooling/config/deps (`type:chore` issues) | `chore/12-add-eslint-config` |
| `docs/` | Doc-only changes (`type:docs` issues) | `docs/8-update-api-contract-lat-lng` |

- One branch → one issue → one PR, as the default. A branch spanning multiple issues is a sign the issues should have been one task to begin with, or the branch should be split.
- Branches are deleted after merge (GitHub's "auto-delete head branches" setting should be on).
- No long-lived branches beyond `main` — no persistent `develop`/`staging` branch unless that's explicitly requested later; this is small enough to trunk-base off `main` with short-lived task branches.

---

## 4. Issues (Tasks and Subtask-issues)

- One issue per task (and per subtask-issue where a subtask is substantial enough per §2's rule of thumb) — e.g. "Add GET /api/properties with filters/sort/pagination" is one task issue in the Phase 2 milestone, linked to its sprint/epic.
- Issue title: short imperative.
- Issue body must reference which doc/section it implements (e.g. `API_CONTRACT.md §1`) and which epic it's part of (`Part of #<epic-number>`), so scope is traceable back to an agreed spec, not invented ad hoc.
- Labels (see §5) applied at creation, including a `type:*` label so the branch prefix (§3) is unambiguous.

### Issue template (structure to follow, not a literal GitHub `.github/ISSUE_TEMPLATE` requirement unless you want one committed)
```
## What
[one line]

## Spec reference
[e.g. API_CONTRACT.md §4, PRD.md FR4.2]

## Acceptance criteria
- [ ] ...
- [ ] ...

## Out of scope
[anything explicitly not included, to prevent scope creep on this issue]
```

---

## 5. Labels

| Label | Meaning |
|---|---|
| `phase-0` … `phase-5` | Which roadmap phase this belongs to (redundant with milestone, but filterable in list views) |
| `type:epic` | A sprint-level issue containing a checklist of task issues (see §2) |
| `type:feature` | New functionality — branches as `feature/...` |
| `type:bug` | Something built doesn't match its spec — branches as `fix/...` |
| `type:chore` | Tooling, deps, config — no product behavior change — branches as `chore/...` |
| `type:docs` | Changes to the planning docs themselves — branches as `docs/...` |
| `scope-risk` | Flagged during work as touching something in the out-of-scope list (`PRD.md` §4 / `ROADMAP.md` parking lot) — needs a decision before proceeding, not a silent build |
| `blocked` | Can't proceed — reason must be in a comment |

`scope-risk` is the important one: any time implementing an issue reveals a need for something like leads/CRM/notifications/etc., the issue gets this label and work pauses on that specific point pending a decision, per `CLAUDE.md` §5 "no scope creep" rule and DoD item 8.

---

## 6. Pull Requests

### PR requirements (enforced by CI where possible, by review where not)
- Links the issue(s) it closes (`Closes #12`).
- States which milestone/phase it belongs to.
- Describes what was tested (per `TESTING_STRATEGY_AND_DOD.md` §1.2 for that phase).
- For any UI-facing change: includes a screenshot (see `REPORTING.md` for where these are also archived phase-wise).
- Confirms the Definition of Done checklist (`TESTING_STRATEGY_AND_DOD.md` §2) — reviewer should treat an unchecked DoD item as a blocker, not a nitpick.

### CI checks required to merge (GitHub Actions)
1. Install deps
2. Lint
3. Typecheck
4. Test suite (unit + integration; Playwright E2E can run on a schedule/on-demand rather than every PR if it's slow, but must run before a phase milestone is closed)
5. Prisma migration dry-run/validate, if the PR touches `schema.prisma`

A PR cannot merge with a red check. No merging with `--admin`/bypassing branch protection, even for "small" changes.

---

## 7. Project Board (progress tracking / "dashboard")

A single GitHub Project (board view) with columns: `Backlog` → `In Progress` → `In Review` → `Done`.

- Every issue lives on the board, grouped/filterable by milestone (phase).
- This board **is** the progress-tracking dashboard for this MVP — no separate custom dashboard tool is being built unless that's explicitly requested later (keep this proportionate to project size).
- At the start of each work session, Claude Code should check the board state before picking up new work, and move cards as work progresses — not just at the end.

---

## 8. What this doc deliberately does NOT include

No custom bots/automation beyond standard GitHub Actions CI, no Slack/email integrations, no auto-generated changelog, no semantic-release/versioning scheme — this is a single MVP repo, not a multi-package org-wide setup. Add these only if the project outgrows this shape.
