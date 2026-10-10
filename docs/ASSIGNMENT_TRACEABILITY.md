# Meno — Assignment Traceability

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.1.0 (planning) |
| Last updated | 2026-10-10 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |

> **Integrity statement:** This document is a *plan* for producing evidence. It records **no** completed work, **no** test results, **no** screenshots, and **no** commits — because none exist yet. Every "[to be produced]" item must only be marked complete when the real artefact exists and can be shown to a lecturer.

---

## 1. Purpose

Map (a) assignment requirements, (b) the Meno MVP features, (c) business rules, (d) tests, and (e) required evidence into one traceable table, so the student can demonstrate coverage and defend design decisions.

## 2. Requirement → feature → test → evidence matrix

| Req ID | Requirement / skill expectation | Feature | Business rule | Planned test | Evidence to produce | Status |
|---|---|---|---|---|---|---|
| RQ-1 | PRD-first planning with user stories & acceptance criteria | Docs | — | — | `docs/PRD.md` (this set) | Draft written |
| RQ-2 | Architecture with separation of UI/domain/repository/persistence | Docs | — | — | `docs/ARCHITECTURE.md` | Draft written |
| RQ-3 | Bible Reader renders chapters | FR-1..FR-5 | BR-5 | Reader navigation tests (edge chapters) | Demo + test output | Not started |
| RQ-4 | Persistent progress survives restart | FR-8 | BR-1 | Repository round-trip test | Demo + test output | Not started |
| RQ-5 | Duplicate completion is a no-op | FR-7 | BR-1 | Unit test: duplicate insert | Test file + output | Not started |
| RQ-6 | Streak boundaries correct | FR-9 | BR-3, BR-4 | Unit tests: first day / consecutive / gap | Test file + output | Not started |
| RQ-7 | Reading-plan validation | (later) | — | Unit tests: valid/invalid plan | Test file + output | Not started |
| RQ-8 | Deterministic, independently testable domain | Domain layer | All | Domain unit test suite | Test suite | Not started |
| RQ-9 | Testing documented with real command/result | Docs | — | — | `docs/TESTING.md` | Not started |
| RQ-10 | Calm, Scripture-first design identity | Design | — | Manual UI review checklist | `docs/DESIGN_SYSTEM.md` + screenshots | Direction drafted |
| RQ-11 | Accessibility (touch targets, labels, contrast, motion) | UI | — | `ui-ux-pro-max` checklist | Screenshots + notes | Not started |
| RQ-12 | Focused, descriptive Git history | Process | — | — | `git log` (after approved commits) | No commits yet |
| RQ-13 | Scope control to 12-meeting MVP | Process | — | — | `docs/12_MEETING_PLAN.md` | Draft written |
| RQ-14 | Content licensing respected | Content | — | Licence review | Translation licence + attribution record | **Blocked (Open Q)** |
| RQ-15 | Student can explain architecture & decisions | Understanding | — | — | §4 explanation notes | Draft below |

## 3. Evidence register (what to collect, when)

| Evidence type | Where it lives | When to capture | Notes |
|---|---|---|---|
| Planning docs | `docs/*.md` | Milestone 0 | Real files (these). |
| Test command + output | `docs/TESTING.md` | Each Verify phase | Copy the **actual** command and result; never paraphrase as "passing". |
| Screenshots | `docs/evidence/` (to create later) | After each UI milestone | Mobile screenshots of reader, progress, accessibility states. |
| Demo walkthrough | Meeting notes | Meetings 4, 8, 12 | Record what was demonstrated live. |
| Git history | repository | On approved commits only | No commit without explicit approval (`meno-workflow`). |
| Translation licence/attribution | `docs/PRD.md` §5.4 + dataset file | Before bundling content | Blocked pending decision. |
| Meeting log | `docs/12_MEETING_PLAN.md` or a log file | Each meeting | Record decisions and AI-vs-student contributions. |

## 4. Student-understanding notes (to validate and expand)

The student should be able to explain, in their own words:
- **Layering:** why domain rules are separate from UI and from SQLite (so they can be unit-tested without a phone).
- **Idempotency (BR-1):** why completing a chapter twice must not double-count, and how a unique key enforces it.
- **Streak logic (BR-3/BR-4):** how "a day" is defined and why timezone handling matters for correctness.
- **Persistence (FR-8):** how `expo-sqlite` stores rows and why data survives restarts.
- **AI vs student contribution:** which parts were AI-generated, which the student reviewed, and which the student changed. Keep a running log; do not fabricate student work.

## 5. Academic-integrity guardrails

- Do not claim a test passed unless executed and its output captured.
- Do not commit generated build artefacts or secrets.
- Do not present AI-drafted text as the student's own writing without review and understanding.
- Do not bundle a copyrighted Bible translation without permission; record provenance for any public-domain text.

## 6. Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-10-10 | Initial traceability plan created (no evidence produced yet). |
