# Testing Strategy & Definition of Done — Property Website MVP

**Status:** Draft v1
**Scope authority:** Bound by `ROADMAP.md`, `CLAUDE.md`, `PRD.md`, `NFR.md`, `API_CONTRACT.md`, `SCHEMA.md`.

---

## 1. Testing Strategy

### 1.1 Levels of testing

| Level | Tooling (suggested) | What it covers |
|---|---|---|
| Unit | Vitest/Jest | Pure functions: price formatting, filter-query building, validation helpers |
| API/integration | Vitest/Jest + a test DB | Every route in `API_CONTRACT.md` — request in, response/status out, DB state after |
| E2E | Playwright | The success criteria in `PRD.md` §6, run against a seeded local build |

A test DB (separate from dev) is required for integration tests — never run tests against the dev/seed database directly, since tests should be able to wipe/reset state freely.

### 1.2 Required coverage per phase (maps to ROADMAP.md gates)

- **Phase 1 (data model + auth):** register/login/logout happy path; duplicate-email rejection; wrong-password rejection; `isAdmin` flag correctly set/read.
- **Phase 2 (public site):** `GET /api/properties` filter/sort/pagination combinations; `GET /api/properties/:id` found and 404 cases; unpublished properties never appear in either endpoint.
- **Phase 3 (chatbot):** normal query returns a reply; empty/no-match query handled gracefully; simulated AI-provider failure triggers the `503` fallback path (mock the Anthropic call for this — don't rely on the real API actually failing in CI); rate-limit triggers `429` after threshold.
- **Phase 4 (admin CRUD):** create/edit/delete/unpublish all round-trip correctly; non-admin gets `403`; anonymous gets `401`; a `published` property appears on the public site immediately after status change, a reverted-to-`draft` one disappears.
- **Phase 5 (polish):** smoke E2E covering the full PRD §6 success criteria in one run.

### 1.3 What's NOT required for MVP

Per `NFR.md` §8: no load testing, no accessibility audit tooling, no visual regression testing, no cross-browser test matrix beyond whatever Playwright's default browser covers. These can be added later if the project scope expands.

### 1.4 CI expectations

- Lint, typecheck, and the full test suite must pass before merge (per `CLAUDE.md` §5).
- If no CI pipeline exists yet, this still applies — run it locally before opening the PR, and say so in the PR description.

---

## 2. Definition of Done

A task/PR is **Done** only when all of the following are true:

1. **Scope check:** the change implements only what's in the relevant `ROADMAP.md` phase and doesn't introduce anything from the out-of-scope list in `PRD.md` §4 / `ROADMAP.md`'s parking lot.
2. **Contract check:** if it's an API change, it matches `API_CONTRACT.md` exactly — or `API_CONTRACT.md` was updated in the same PR to reflect an intentional, agreed change.
3. **Schema check:** if it's a data model change, `SCHEMA.md` and the Prisma migration are both updated in the same PR, and the migration runs cleanly on a fresh DB.
4. **Tests:** new/changed behavior has test coverage per §1.2 for its phase; all tests pass; no test was skipped/disabled to make CI green.
5. **Lint/typecheck:** both pass with no suppressions added to make them pass, unless the suppression is justified in a code comment.
6. **Manual check:** the change was actually run locally (not just "tests pass") for anything touching a user-facing flow — screenshots or a short note in the PR description for UI changes.
7. **Roadmap updated:** the corresponding checklist item in `ROADMAP.md` is checked off in the same PR (or a follow-up noted if it can't be, with a reason).
8. **No silent scope decisions:** if implementing the task surfaced an ambiguity or a need for something out-of-scope, it was flagged in the PR description rather than resolved unilaterally.

A task that passes CI but fails any of 1, 3, 7, or 8 above is **not** done, even though the tests are green.

---

## 3. Phase-gate sign-off

Per `ROADMAP.md`, a phase is not "exited" just because its checklist items are checked — it's exited when every merged PR in that phase individually satisfies the Definition of Done above. Claude Code should treat "all boxes checked" and "DoD satisfied for each" as two separate things to verify before declaring a phase complete.
