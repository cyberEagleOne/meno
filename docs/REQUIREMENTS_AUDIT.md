# Meno Requirements Audit

**Audit date:** 2026-11-19. **Status is evidence-based for this workspace.** `VERIFIED` requires an executed check or directly inspected behavior; files or UI alone do not count. An implementation can be real while its native behavior remains unverified.

| ID | Requirement | Status | Evidence | Missing work | Priority |
|---|---|---|---|---|---|
| M1-01 | README describes the real problem | VERIFIED | `README.md` describes reading habit friction | Keep current | P2 |
| M1-02 | README defines target users | VERIFIED | Returning Reader and New Reader profiles | Keep current | P2 |
| M1-03 | README explains benefits | VERIFIED | One-tap resume, private progress, gentle motivation | Keep current | P2 |
| M1-04 | README scopes achievable core features | VERIFIED | Reader, progress, verse, device features | Qualify with real-text licensing blocker | P1 |
| M1-05 | README explicitly excludes features | VERIFIED | Cloud accounts, social, audio, monetisation excluded | Keep current | P2 |
| M1-06 | README has measurable success criteria | VERIFIED | 66 books, 1,189 chapters, persistence, test criteria | Correct outdated test count | P2 |
| M2-01 | Architecture explains purpose and stack | VERIFIED | `docs/ARCHITECTURE.md` and source inspection | Synchronize environment/version claims | P2 |
| M2-02 | Architecture explains frontend, routing, state and components | VERIFIED | Architecture docs, `src/app`, `src/components`, `src/data/progressContext.tsx` | Update with goal state/recent refactor | P2 |
| M2-03 | Architecture explains backend/database/API | PARTIALLY IMPLEMENTED | SQLite and read-only daily verse API; no Meno backend by design | Document no-backend boundary and API data flow | P2 |
| M2-04 | Architecture covers entities, errors, security and deployment | PARTIALLY IMPLEMENTED | Schema, logger, PRD and release configs exist | Consolidate build/signing and relationship diagrams | P2 |
| M3-01 | Consistent UI and essential screens | IMPLEMENTED — NOT VERIFIED | Home, library, chapter, reader, progress, settings routes | Run on target Android sizes and review | P2 |
| M3-02 | Navigation and reusable components | IMPLEMENTED — NOT VERIFIED | Expo Router routes; shared `src/components/ui` | Android interaction walkthrough | P1 |
| M3-03 | Models/services separated from screens | VERIFIED | `src/domain`, `src/data`, `src/services`; new GoalRepository split | Continue review | P2 |
| M3-04 | All visible buttons/interactions work | IMPLEMENTED — NOT VERIFIED | Interaction tests cover key reader/form actions | Full control-by-control device check | P1 |
| M4-01 | State feature 1: reading progress state | VERIFIED | `progressContext.test.tsx`; baseline suite passed | Document full transitions and device states | P1 |
| M4-02 | State feature 2: reading goal form | VERIFIED | `ReadingGoalForm.test.tsx`; repository and validation tests | Document full transitions and device states | P1 |
| M4-03 | Load, empty, error, retry, validation, submit and double-tap paths | VERIFIED | Component tests present; all 118 baseline tests passed | Ensure post-change regression pass | P1 |
| M4-04 | State management documentation | NOT IMPLEMENTED | No `docs/STATE_MANAGEMENT.md` at audit start | Create feature flows, demo steps, test evidence | P1 |
| M5-01 | Local data model and SQLite storage | IMPLEMENTED — NOT VERIFIED | `db.ts`, `sqliteDriver.ts`, injectable SQL driver | Verify native SQLite on device | P1 |
| M5-02 | Create/read/update/delete local records | PARTIALLY IMPLEMENTED | Completion, undo, last-read and goal repositories; no broad record CRUD | Map relevant CRUD to user workflows; goals update, completion delete | P1 |
| M5-03 | Persistence survives restart | IMPLEMENTED — NOT VERIFIED | Prior Expo Go smoke test in `docs/TESTING.md`, no fresh native test | Repeat controlled native persistence sequence | P1 |
| M5-04 | Local persistence documentation | NOT IMPLEMENTED | No `docs/LOCAL_PERSISTENCE.md` | Create with precise test boundaries | P1 |
| M6-01 | Meaningful API model/repository integration | IMPLEMENTED — NOT VERIFIED | `dailyVerseRepository.ts`, domain validation and UI | Test live connectivity and response provenance | P1 |
| M6-02 | UI→repository→API→backend→database write vertical slice | NOT APPLICABLE | Product is explicitly backend-free and API use is read-only | Document rationale and actual read slice | P2 |
| M6-03 | API success, empty, HTTP and malformed JSON behavior | VERIFIED | `dailyVerse.test.ts`; baseline 118 tests passed | Record case-level results in API doc | P1 |
| M6-04 | API integration documentation | NOT IMPLEMENTED | No `docs/API_INTEGRATION.md` | Document GET endpoint, data flow and six cases | P1 |
| M7-01 | Complete core workflow with feedback | IMPLEMENTED — NOT VERIFIED | Reader/progress/forms and tests; Bible text is placeholder | End-to-end Android walkthrough; resolve text rights | P1 |
| M7-02 | Advanced feature 1: daily notification | IMPLEMENTED — NOT VERIFIED | `notificationService.ts`, settings UI | Verify allow/deny/cancel/schedule on Android | P1 |
| M7-03 | Advanced feature 2: accelerometer shake | IMPLEMENTED — NOT VERIFIED | `sensorService.ts`, UI subscription | Verify sensor, cooldown and cleanup on device | P1 |
| M7-04 | Advanced feature 3: biometric/PIN lock | IMPLEMENTED — NOT VERIFIED | `authService.ts`, settings UI | Verify hardware/permission/fallback flows | P1 |
| M7-05 | Advanced feature documentation | NOT IMPLEMENTED | No `docs/ADVANCED_FEATURES.md` | Document native test limits and demo | P1 |
| M8-01 | Adaptive small/large screen layout | IMPLEMENTED — NOT VERIFIED | Responsive RN layout source; no current screenshots | Inspect real device dimensions and overflow | P2 |
| M8-02 | Keyboard-safe forms | IMPLEMENTED — NOT VERIFIED | RN scroll/form source; no captured keyboard test | Test active input and submit access on device | P2 |
| M8-03 | Accessibility labels/contrast/touch/focus | PARTIALLY IMPLEMENTED | Several controls expose accessibility labels | Complete TalkBack, font scale, contrast, focus review | P2 |
| M8-04 | Feedback for all actions | IMPLEMENTED — NOT VERIFIED | Loading, errors, retry, success states in forms/read | Full interaction review | P2 |
| M8-05 | Four real runtime screenshots and UI review | NOT IMPLEMENTED | No `docs/evidence/ui-review/` at audit start | Capture real app screenshots and document review | P2 |
| M9-01 | Refactoring and separation of responsibilities | VERIFIED | Existing formatting/logging changes; GoalRepository extraction | Record remaining duplication/debt | P2 |
| M9-02 | Baseline/regression tests around refactoring | VERIFIED | 118 baseline tests passed on 2026-11-19 | Re-run after lint fix | P2 |
| M9-03 | Refactoring report | NOT IMPLEMENTED | No `docs/REFACTORING_REPORT.md` | Create report with evidence | P2 |
| M10-01 | Useful safe runtime logging | IMPLEMENTED — NOT VERIFIED | `src/services/logger.ts` and logger tests | Review logs during Android runtime; avoid sensitive output | P2 |
| M10-02 | Android release configuration/package/icon/permissions | IMPLEMENTED — NOT VERIFIED | Expo config, `android/`; pre-existing release artifact | Rebuild from current source and inspect manifest | P1 |
| M10-03 | Fresh APK build and install | BLOCKED | Existing APK is 120 MB from 2026-11-15; Java is 8, no adb/SDK env discovered | Set up JDK 17 + SDK or use configured CI/build service; install | P1 |
| M10-04 | Physical Android verification | BLOCKED | No `adb` or device/emulator detected | Connect Android phone or emulator | P1 |
| M10-05 | Release candidate documentation | NOT IMPLEMENTED | No `docs/RELEASE_CANDIDATE.md` | Record build/signing/install facts | P1 |
| M10-06 | At least five genuine bugs and five other issues | PARTIALLY IMPLEMENTED | Lint failure is one verified bug; no issue list inspected online | Check GitHub issues; report genuine count without invention | P2 |
| M10-07 | Stable `v1.0` branch with release criteria | NOT IMPLEMENTED | No `v1.0` branch observed | Create only after all release criteria pass | P1 |
| M11-01 | `v1.0_dev` development branch | NOT IMPLEMENTED | No `v1.0_dev` branch observed | Prepare after stable branch criteria | P2 |
| M11-02 | At least 200 meaningful unit tests | NOT IMPLEMENTED | Fresh baseline 118 tests | Add behavior-focused tests; report exact count | P1 |
| M11-03 | Controlled failing-test demonstration and restored passing suite | NOT IMPLEMENTED | No failure evidence found | Run isolated intentional expectation failure; save captured output, restore, rerun | P1 |
| M11-04 | CI test/build pipeline | NOT IMPLEMENTED | No tracked workflow found | Add workflow; validate with available GitHub runner | P2 |
| M11-05 | V1.1 milestone and release notes | NOT IMPLEMENTED | No roadmap file found | Document proposed/completed work and tests | P2 |
| GIT-01 | Preserve initial uncommitted user changes | VERIFIED | Initial diff confined to `app.json`, `package.json`; retained unstaged | Keep unstaged unless included by user later | P0 |
| GIT-02 | Push reviewed checkpoints on correct branch | VERIFIED | Scoped commit `871548b` pushed; remote ref verified at matching SHA; GitHub Actions run started | Continue checkpoint pushes | P1 |
| A-01 | APK installation, startup, UI and navigation on Android | BLOCKED | No current device/emulator; no fresh install | Requires accessible Android device/emulator | P1 |
| A-02 | Core form, persistence, API, errors and retry on Android | IMPLEMENTED — NOT VERIFIED | Code/tests; no target-device run in current audit | Verify on Android | P1 |
| A-03 | Three advanced feature permissions and cancellation on Android | IMPLEMENTED — NOT VERIFIED | Service implementations inspected | Verify all native permission paths | P1 |
| A-04 | Lecturer walkthrough and troubleshooting guide | NOT IMPLEMENTED | No `docs/ANDROID_DEMO_GUIDE.md` | Write walkthrough and test setup | P1 |
| A-05 | Final project report with actual evidence | NOT IMPLEMENTED | No `docs/FINAL_PROJECT_COMPLETION_REPORT.md` | Generate only after work/evidence is complete | P2 |

## Current blockers and limitations

- Bible translation redistribution permission is unresolved; no real Bible content can be added safely from repository evidence.
- This host lacks a discoverable Android SDK/ADB and reports Java 8; a fresh local APK install cannot currently be verified.
- The UI evidence, native feature tests, 200-test target, failed-test capture, CI verification, and GitHub issue review remain outstanding.
- Native SQLite persistence is not established solely by in-memory tests or the existing stale APK.
- Product architecture intentionally has no application backend. The daily verse integration is read-only; a database write API slice would be an unnecessary architectural change.
