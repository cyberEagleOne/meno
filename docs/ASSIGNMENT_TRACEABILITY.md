# Meno — Assignment Traceability

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.2.5 (verification sync) |
| Last updated | 2026-10-22 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |

> **Integrity statement:** This document records **evidence that actually exists**. As of 2026-10-22, the current MVP implementation is uncommitted; **7 test suites / 73 tests pass**, and the Android Expo Go smoke-test observations are recorded in `docs/TESTING.md`. The smoke test was limited and is not a full acceptance-criteria demonstration. Screenshots are not in the repository; the demo video is outside the repository and submission is unconfirmed. Every remaining "[to be produced]" item must only be marked complete when the real artefact exists and can be shown to a lecturer.

---

## 1. Purpose

Map (a) assignment requirements, (b) the Meno MVP features, (c) business rules, (d) tests, and (e) required evidence into one traceable table, so the student can demonstrate coverage and defend design decisions.

## 2. Requirement → feature → test → evidence matrix

| Req ID | Requirement / skill expectation | Feature | Business rule | Planned test | Evidence to produce | Status |
|---|---|---|---|---|---|---|
| RQ-1 | PRD-first planning with user stories & acceptance criteria | Docs | — | — | `docs/PRD.md` §6.1–§6.5 — five user stories with acceptance criteria AC-1.x–AC-5.x. Test evidence: **73 tests across seven suites** (`docs/TESTING.md`) cover domain/data rules and reader completion interactions. Expo Go smoke evidence is limited as mapped in `checklist_mvp.md`; full AC demonstration remains outstanding. | **Five stories documented; limited smoke observed; full AC demonstration outstanding** |
| RQ-2 | Architecture with separation of UI/domain/repository/persistence | Docs | — | — | `docs/ARCHITECTURE.md` | Draft written |
| RQ-3 | Bible Reader renders chapters | FR-1..FR-5 | BR-5 | Reader navigation tests (edge chapters) | Test output in `docs/TESTING.md`; limited Expo Go smoke scope there | **Tests pass (22); full demo pending** |
| RQ-4 | Persistent progress survives restart | FR-8 | BR-1 | Persistence round-trip test + Expo Go observation | `src/data/__tests__/db.test.ts` + output in `docs/TESTING.md` | **Host test and limited Expo Go persistence observed; native APK/rollback unverified** |
| RQ-5 | Duplicate completion is a no-op | FR-7 | BR-1 | Unit test: duplicate completion | `src/data/__tests__/dbCompletion.test.ts` + `src/domain/__tests__/progress.test.ts` | **Tests pass (21 + 11)** |
| RQ-6 | Streak boundaries correct | FR-9 | BR-3, BR-4 | Unit tests: first day / consecutive / gap | — | **[Deferred]** per PRD §10 (conflict: listed here as requirement — confirm with lecturer) |
| RQ-7 | Reading-plan validation | (later) | — | Unit tests: valid/invalid plan | — | **[Deferred]** (plans out of MVP) |
| RQ-8 | Deterministic, independently testable domain | Domain layer | All | Domain unit test suite | 7 suites / 73 tests, `docs/TESTING.md` | **Passing on host (2026-10-22)** |
| RQ-9 | Testing documented with real command/result | Docs | — | — | `docs/TESTING.md` | **Updated with captured results (2026-10-22)** |
| RQ-10 | Calm, Scripture-first design identity | Design | — | Manual UI review checklist | `docs/DESIGN_SYSTEM.md` + screenshots | Direction drafted; **screenshots pending** |
| RQ-11 | Accessibility (touch targets, labels, contrast, motion) | UI | — | Mobile accessibility checklist (originally from the `ui-ux-pro-max` skill, since removed; mirrored in `docs/DESIGN_SYSTEM.md` §5) | Screenshots + notes | Not started |
| RQ-12 | Focused, descriptive Git history | Process | — | — | `git log` | **4 historical commits exist; current MVP work remains uncommitted** |
| RQ-13 | Scope control to 12-meeting MVP | Process | — | — | `docs/12_MEETING_PLAN.md` | Draft written |
| RQ-14 | Content licensing respected | Content | — | Licence review | Translation licence + attribution record | **Blocked (Open Q)** |
| RQ-15 | Student can explain architecture & decisions | Understanding | — | — | §4 explanation notes | Draft below |

## 3. Evidence register (what to collect, when)

| Evidence type | Where it lives | When to capture | Notes |
|---|---|---|---|
| Planning docs | `docs/*.md` | Milestone 0 | Real files (these). |
| Test command + output | `docs/TESTING.md` | Each Verify phase | **Captured 2026-10-22** (Jest 7 suites / 73 tests; TypeScript, lint, Android Expo bundle export passed). Expo Go smoke observations and limitations are recorded separately. Re-capture after each relevant change; never paraphrase as "passing". |
| Screenshots | `docs/evidence/` (to create later) | After each UI milestone | Mobile screenshots of reader, progress, accessibility states. |
| Demo walkthrough | Meeting notes | Meetings 4, 8, 12 | Record what was demonstrated live. |
| Git history | repository | On approved commits only | No commit without explicit approval (`meno-workflow`). |
| Translation licence/attribution | `docs/PRD.md` §5.4 + dataset file | Before bundling content | Blocked pending decision. |
| Meeting log | `docs/12_MEETING_PLAN.md` or a log file | Each meeting | Record decisions and AI-vs-student contributions. |

## 4. Student-understanding notes (to validate and expand)

The student should be able to explain, in their own words:
- **Layering:** why domain rules are separate from UI and from SQLite (so they can be unit-tested without a phone).
- **Idempotency (BR-1):** why completing a chapter twice must not double-count, and how a unique key enforces it.
- **Streak logic (BR-3/BR-4):** how "a day" is defined and why timezone handling matters for correctness. *(Currently deferred from the MVP — see §4.1, item on RQ-6.)*
- **Persistence (FR-8):** how `expo-sqlite` stores rows and why data survives restarts; how the `SqlDriver` seam lets the same code be tested on the host.
- **AI vs student contribution:** which parts were AI-generated, which the student reviewed, and which the student changed. Keep a running log; do not fabricate student work.

### 4.1 Student review checklist (outstanding — to be completed by the student)

> **None of the items below has been done.** Each box is for the student to
> tick **after actually performing the review** — the AI assistant must not
> tick them, and no review should be claimed before it happens.

Documentation review (read each document end-to-end; correct anything you
disagree with; then tick):

- [ ] `docs/PRD.md` — reviewed, including the new §2.1 Benefits (mark assumptions you accept or reject).
- [ ] `docs/ARCHITECTURE.md` — reviewed §3–§5 against the actual code (`src/data/`, `src/app/`); confirmed it matches what you can explain to a lecturer.
- [ ] `docs/DESIGN_SYSTEM.md` — reviewed §0 (implemented design + Figma Make handoff provenance); confirmed the recorded provenance is accurate.
- [ ] `docs/TESTING.md`, `HowToRun.md`, `checklist_mvp.md` — read; confirmed you can run every command yourself.
- [ ] `docs/ASSIGNMENT_TRACEABILITY.md` and `docs/12_MEETING_PLAN.md` — reviewed.

Code review (the working tree is AI-generated and **uncommitted**):

- [ ] Read the uncommitted diff (`git status`, `git diff`) and the new files; state which parts you understand and which you want explained before any commit.
- [ ] Decide and record the commit plan; approve explicitly before any commit is made.

Lecturer questions (must be asked — do not guess the answers):

- [ ] **Gemini / mandated AI tooling:** confirm whether the assignment requires a specific AI tool (e.g. Gemini). The repository contains **no evidence of Gemini use**; all AI assistance so far was via the `opencode` assistant. Record the lecturer's answer here: ______________________
- [ ] **RQ-6 / streaks:** the traceability matrix (RQ-6) lists streak-boundary tests as a requirement, while `docs/PRD.md` §10 defers streaks from the MVP. Confirm with the lecturer which governs. Record the answer here: ______________________
- [ ] **AC-2.6 distinct-days stat:** now **implemented** (2026-10-15) — the append-only `reading_day` table + "X hari membaca" display, host-verified per `checklist_mvp.md`. No scope decision is needed from the lecturer; note here only if the lecturer wants the *display* changed or the stat removed. Record any answer: ______________________

## 5. Academic-integrity guardrails

- Do not claim a test passed unless executed and its output captured.
- Do not commit generated build artefacts or secrets.
- Do not present AI-drafted text as the student's own writing without review and understanding.
- Do not bundle a copyrighted Bible translation without permission; record provenance for any public-domain text.

## 6. Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-10-10 | Initial traceability plan created (no evidence produced yet). |
| 0.2.0 | 2026-10-15 | Evidence update: RQ-3/4/5/8 backed by passing tests (53 cases, `docs/TESTING.md`); RQ-9 done; RQ-12 records 2 real commits + uncommitted MVP work; RQ-6 flagged as PRD-deferred conflict; screenshots, device demo, and meeting log still outstanding. |
| 0.2.1 | 2026-10-15 | Added §4.1 student review checklist: documentation review, code review before commits, and lecturer questions (Gemini requirement, RQ-6 streaks, AC-2.6 distinct-days stat). No boxes ticked; no reviews claimed. |
| 0.2.2 | 2026-10-15 | AC-2.6 gap closed: distinct reading days implemented + host-tested (tests 53 → 62); updated counts (RQ-8, integrity statement, §4.3) and re-scoped the AC-2.6 lecturer question (now a display-preference note, not a scope decision). No boxes ticked; no device evidence claimed. |
| 0.2.3 | 2026-10-15 | P6 update: RQ-1 now records the five user stories documented in `docs/PRD.md` §6.1–§6.5 (acceptance criteria AC-1.x–AC-5.x), with the 62-test/five-file evidence in `docs/TESTING.md` linked as covering only the domain/data rules (UI criteria incl. AC-3.x/AC-4.x/AC-5.x have no automated coverage). Device demo evidence remains outstanding and student review is still required; no boxes ticked, no statuses upgraded. |
| 0.2.4 | 2026-10-15 | Test-count sync after the reader-virtualization fix: current-state claims updated 62 → **66 tests** across five files (integrity statement, RQ-1, RQ-8, §4.3 command/output row). RQ-1 now also notes that the four new `restoreScrollOffset` cases cover only the pure scroll-restoration *decision logic*; the device halves of AC-1.5/AC-1.6 (native scrolling, on-device restoration) remain without automated or device evidence. No boxes ticked; no device or SQLite-driver evidence claimed. |
| 0.2.5 | 2026-10-22 | Synced current verification: 7 suites / 73 tests, TypeScript, lint, Android Expo export, and limited Expo Go smoke observations. Updated current status/history claims; native APK behavior, SQLite rollback, full AC walkthrough, and video submission remain unverified. |
