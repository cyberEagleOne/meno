# State Management

## Current verification snapshot (2026-11-27)

The latest captured local test run is 26 suites / 316 passed / 0 failed / 0 skipped (`docs/evidence/P11/unit-tests-restored.txt`). GitHub Actions run [45860247144](https://github.com/cyberEagleOne/meno/actions/runs/45860247144) passed tests, TypeScript, and lint but skipped Android export/APK steps because the local ILT3 database was unavailable in the runner. Historical physical-device evidence confirms app startup and SQLite initialization on an RMX2103 using an earlier ARM64 APK; the physical feature/persistence workflows are not verified.

## Feature 1: reading progress

- **UI:** `src/app/reader/[book]/[chapter].tsx`, `src/app/(tabs)/progress.tsx`, `src/app/(tabs)/index.tsx`.
- **State:** `src/data/progressContext.tsx` provides loading, current completion/read data, and mutation functions. Screens consume context rather than issuing SQL.
- **Persistence boundary:** context calls `src/data/db.ts`; production uses `src/data/sqliteDriver.ts`, while tests inject a deterministic `SqlDriver`.
- **Transitions:** provider starts loading → initializes the driver/loads records → ready with zero or populated progress; rejected load/write → error feedback; successful completion/undo updates state after persistence succeeds. Double completion is idempotent at database/domain level.
- **Tests:** `progressContext.test.tsx`, `db.test.ts`, `dbCompletion.test.ts`, `progress.test.ts`, plus reader interaction tests. The latest captured local run passed 316 tests across 26 suites; see `docs/TESTING.md`. This does not verify native UI states.
- **Demonstration:** open a chapter, mark it complete, open Kemajuan, then relaunch and confirm progress. The relaunch sequence still needs current APK/device evidence.

## Feature 2: reading goal form

- **UI:** `src/components/ui/ReadingGoalForm.tsx`, hosted in settings.
- **State/data:** component owns form state; `src/domain/settingsValidation.ts` validates; `src/data/goalRepository.ts` reads and writes; goal model is in `src/domain/goal.ts`.
- **Transitions:** initial `loading` → `empty` or `ready`; load failure → `error` with retry; invalid input stays editable with field errors; valid submit → disabled/loading → success feedback or error. An in-flight ref prevents repeated submit calls.
- **Tests:** `ReadingGoalForm.test.tsx`, `goalRepository.test.ts`, and `settingsValidation.test.ts`. The form test exercises state and submission behavior through repository mocks; repository persistence tests use the injected SQL driver.
- **Demonstration:** settings → enter target 1–50 and a note of 5–200 characters → save; submit invalid values and show validation; retry after simulated failure in tests.

## Verification boundary

Test evidence proves application behavior against test doubles. It does not prove device UI rendering, native SQLite failure recovery, OS permission outcomes, or physical persistence. Latest captured local result: 26 suites / 316 tests passed. Latest hosted CI run passed tests/type/lint and skipped APK build steps. Physical startup was verified historically; complete device UI states, OS permission outcomes, and physical persistence are still unverified.
