# Meno — 12-Meeting Plan

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.1.0 (planning) |
| Last updated | 2026-10-10 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |

> **Scope control (`meno-workflow`):** do not implement the whole app at once; keep it runnable at each milestone; ask before adding a backend, auth, paid service, or major dependency. This plan is a proposal and can be re-sequenced with the student's approval.

---

## Milestone overview

| Milestone | Meetings | Theme | Exit criteria |
|---|---|---|---|
| **M0 — Foundations** | 1–2 | Planning, docs, design system, tooling decision | Docs approved; Node/tooling decision made; repo scaffolded only after approval. |
| **M1 — Bible Reader** | 3–5 | First MVP feature | Reader shows chapters with prev/next; validated. |
| **M2 — Reading Progress** | 6–8 | Second MVP feature | Persistent, idempotent progress + streaks. |
| **M3 — Polish & evidence** | 9–11 | UX polish, accessibility, testing, docs | Full acceptance criteria pass; evidence collected. |
| **M4 — Submission** | 12 | Demo & handover | Live demo; final docs; approved commits. |

---

## Meeting-by-meeting plan

### Meeting 1 — Project framing
- **Goals:** Confirm vision, personas, goals/non-goals; agree first-release platform and language.
- **Deliverables:** Review `docs/PRD.md` §1–5.
- **Decisions needed:** First-release platform; UI language; daily-goal model (PRD §5.3).
- **Verification:** Student has read and edited the PRD.
- **Evidence:** Meeting notes; agreed PRD.

### Meeting 2 — Architecture & tooling (M0 close)
- **Goals:** Approve stack; **resolve Node engine mismatch** (ADR-007); decide Expo Go vs development build; discuss ORM vs raw `expo-sqlite`.
- **Deliverables:** Approved `docs/ARCHITECTURE.md`; `docs/DESIGN_SYSTEM.md`; a decision on Bible translation & licence (PRD §5.4).
- **Verification:** Compatibility findings reviewed; scaffold command agreed but **not run until approval**.
- **Evidence:** Meeting notes; ADR decisions recorded; Node/tooling choice logged.

### Meeting 3 — Scaffold & vertical slice
- **Goals (after approval):** Create the Expo + TypeScript + Expo Router project; wire a single hard-coded chapter screen; set up the domain/repository folder structure.
- **Deliverables:** Runnable app showing one chapter from a placeholder dataset **[Assumption: placeholder only if licence pending]**.
- **Verification:** App runs on device/emulator.
- **Evidence:** Screenshot; commit (only with approval).

### Meeting 4 — Bible Reader core
- **Goals:** Book list, chapter view, prev/next navigation, translation selection.
- **Deliverables:** FR-1..FR-4 implemented against the chosen bundled translation.
- **Verification:** AC-1.1..AC-1.4 manual checks; domain navigation tests.
- **Evidence:** Demo notes; screenshots; `docs/TESTING.md` entry with real output.

### Meeting 5 — Reader performance & M1 close
- **Goals:** Virtualized verse list, memoized rows, long-chapter performance; restore last-read location (FR-5).
- **Deliverables:** M1 complete and runnable.
- **Verification:** AC-1.5, AC-1.6; checklist from `ui-ux-pro-max`.
- **Evidence:** Performance notes; screenshots; approved commit.

### Meeting 6 — Persistence layer
- **Goals:** `expo-sqlite` schema + migrations; `ProgressRepository`; seed content.
- **Deliverables:** Storage works; progress survives restart.
- **Verification:** Repository round-trip test (AC-2.3).
- **Evidence:** Test output; DB schema note.

### Meeting 7 — Reading completion rules
- **Goals:** Mark-as-read; idempotent writes (BR-1); day-boundary rule documented (BR-2).
- **Deliverables:** FR-6, FR-7.
- **Verification:** Unit tests for duplicate completion (AC-2.2, RQ-5).
- **Evidence:** Test files + actual output.

### Meeting 8 — Streaks & stats (M2 close)
- **Goals:** Streak computation (BR-3, BR-4); stats screen (FR-9).
- **Deliverables:** M2 complete.
- **Verification:** Boundary unit tests (AC-2.1, AC-2.4, AC-2.5).
- **Evidence:** Test output; screenshots; approved commit.

### Meeting 9 — UX & design-system application
- **Goals:** Apply design tokens; empty states; micro-interaction feedback; reduced-motion.
- **Deliverables:** Coherent visual identity per `docs/DESIGN_SYSTEM.md`.
- **Verification:** Design + accessibility checklist.
- **Evidence:** Before/after screenshots.

### Meeting 10 — Accessibility & robustness
- **Goals:** Touch targets, `accessibilityLabel`, safe areas, font scaling, contrast audit; error handling.
- **Deliverables:** Accessibility pass complete.
- **Verification:** `ui-ux-pro-max` mobile checklist (§5 of design doc).
- **Evidence:** Screenshots; checklist; notes.

### Meeting 11 — Testing, docs, polish
- **Goals:** Complete domain test coverage; finalise `docs/TESTING.md`, `README.md`, and any reading-plan validation (RQ-7).
- **Deliverables:** All docs accurate; no regressions.
- **Verification:** Full test run with captured output; build check.
- **Evidence:** Test logs; final docs; approved commits.

### Meeting 12 — Demo & submission
- **Goals:** Live demonstration of Features 1–2 against acceptance criteria; walkthrough of architecture and decisions.
- **Deliverables:** Final submission package; `docs/ASSIGNMENT_TRACEABILITY.md` completed with real evidence.
- **Verification:** All acceptance criteria demonstrated.
- **Evidence:** Demo recording/notes; final Git history; completed traceability matrix.

---

## Sequencing notes & dependencies

- M1 is **blocked** until the Bible translation/licence decision (PRD §5.4) is made; a placeholder dataset may be used temporarily **only if clearly marked as placeholder**.
- M2 depends on the Expo SQLite persistence decision (Architecture ADR-003).
- Scaffolding (Meeting 3) is **blocked** until the Node engine issue is resolved (ADR-007 / Architecture §2.2).
- New dependencies, backend, or auth require explicit approval (`meno-workflow`).

## Buffer & risk

- Meetings are single-pass; leave slack in M3 for regressions and accessibility fixes.
- If a milestone slips, cut scope (e.g., defer dark theme, bookmarks, reading plans) before cutting testing or the core reader/progress features.

## Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-10-10 | Initial 12-meeting plan created (planning only; nothing implemented). |
