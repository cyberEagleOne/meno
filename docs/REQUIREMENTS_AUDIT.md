# Meno Requirements Audit

**Audit date:** 2026-11-19. **Status is evidence-based for this workspace.** `VERIFIED` requires an executed check or directly inspected behavior; files or UI alone do not count. An implementation can be real while its native behavior remains unverified.

| ID | Requirement | Status | Evidence | Missing work | Priority |
|---|---|---|---|---|---|
| M1-01 | README describes the real problem | VERIFIED | `README.md` describes reading habit friction | Keep current | P2 |
| M1-02 | README defines target users | VERIFIED | Returning Reader and New Reader profiles | Keep current | P2 |
| M1-03 | README explains benefits | VERIFIED | One-tap resume, private progress, gentle motivation | Keep current | P2 |
| M1-04 | README scopes achievable core features | VERIFIED | Reader, progress, verse, device features | Qualify with real-text licensing blocker | P1 |
| M1-05 | README explicitly excludes features | VERIFIED | Cloud accounts, social, audio, monetisation excluded | Keep current | P2 |
| M1-06 | README has measurable success criteria | VERIFIED | README includes 66 books, 1,189 chapters, persistence and the current 200-test target | Keep count synchronized | P2 |
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
| M4-04 | State management documentation | VERIFIED | `docs/STATE_MANAGEMENT.md` describes both features, transitions, tests and demo steps | Native interaction remains unverified | P1 |
| M5-01 | Local data model and SQLite storage | VERIFIED | `db.ts`, production `sqliteDriver.ts`, disk-backed SQLite repository suite, and physical ARM64 APK Logcat `sqlite_init_success` | SQLite CRUD and restart persistence on this phone remain to be tested | P1 |
| M5-02 | Create/read/update/delete local records | VERIFIED | Disk-backed suite tests create/read, upsert update, completion delete; goal update remains covered by `goalRepository.test.ts` | Full lifecycle on standalone app/device remains unverified | P1 |
| M5-03 | Persistence survives restart | VERIFIED (repository and Expo Go AVD) | Disk-backed SQLite close/reopen test; AVD Expo Go force-stop/relaunch retained completed chapter; `evidence/android/08-avd-persistence-observation.txt` | Standalone APK and physical-phone restart still required | P1 |
| M5-04 | Local persistence documentation | VERIFIED | `docs/LOCAL_PERSISTENCE.md` includes repository, emulator, and APK/device boundaries | Keep synchronized | P1 |
| M6-01 | Meaningful API model/repository integration | IMPLEMENTED — NOT VERIFIED | `dailyVerseRepository.ts`, domain validation and UI | Test live connectivity and response provenance | P1 |
| M6-02 | UI→repository→API→backend→database write vertical slice | NOT APPLICABLE | Product is explicitly backend-free and API use is read-only | Document rationale and actual read slice | P2 |
| M6-03 | API success, empty, HTTP and malformed JSON behavior | VERIFIED | `dailyVerse.test.ts`; baseline 118 tests passed | Record case-level results in API doc | P1 |
| M6-04 | API integration documentation | VERIFIED | `docs/API_INTEGRATION.md` describes GET flow and six API cases | UI live fetch remains unverified | P1 |
| M7-01 | Complete core workflow with feedback | IMPLEMENTED — NOT VERIFIED | Reader/progress/forms and tests; Bible text is placeholder | End-to-end Android walkthrough; resolve text rights | P1 |
| M7-02 | Advanced feature 1: daily notification | IMPLEMENTED — NOT VERIFIED | `notificationService.test.ts` verifies allow/deny, daily scheduling/replacement, immediate notification request; settings screenshot exists | Verify Android permission prompt and delivered notification on phone | P1 |
| M7-03 | Advanced feature 2: accelerometer shake | IMPLEMENTED — NOT VERIFIED | `sensorService.test.ts` verifies threshold, debounce, destination, cleanup | Verify actual accelerometer movement on phone | P1 |
| M7-04 | Advanced feature 3: biometric/PIN lock | IMPLEMENTED — NOT VERIFIED | `authService.test.ts` verifies capability, no hardware/enrollment, success, cancel, failure and fallback configuration | Verify native prompt and enrolled device credentials on phone | P1 |
| M7-05 | Advanced feature documentation | VERIFIED | `docs/ADVANCED_FEATURES.md` documents implementations and Android test boundaries | Native permission testing remains unverified | P1 |
| M8-01 | Adaptive small/large screen layout | IMPLEMENTED — NOT VERIFIED | Responsive RN layout source; no current screenshots | Inspect real device dimensions and overflow | P2 |
| M8-02 | Keyboard-safe forms | IMPLEMENTED — NOT VERIFIED | RN scroll/form source; no captured keyboard test | Test active input and submit access on device | P2 |
| M8-03 | Accessibility labels/contrast/touch/focus | PARTIALLY IMPLEMENTED | Several controls expose accessibility labels | Complete TalkBack, font scale, contrast, focus review | P2 |
| M8-04 | Feedback for all actions | IMPLEMENTED — NOT VERIFIED | Loading, errors, retry, success states in forms/read | Full interaction review | P2 |
| M8-05 | Four real runtime screenshots and UI review | VERIFIED (Expo Go AVD preview) | Five real Android AVD screenshots under `docs/evidence/ui-review/`; review in `docs/UI_UX_REVIEW.md` | Capture standalone APK or physical phone screenshots for release acceptance | P2 |
| M9-01 | Refactoring and separation of responsibilities | VERIFIED | Existing formatting/logging changes; GoalRepository extraction | Record remaining duplication/debt | P2 |
| M9-02 | Baseline/regression tests around refactoring | VERIFIED | 118 baseline tests passed on 2026-11-19 | Re-run after lint fix | P2 |
| M9-03 | Refactoring report | VERIFIED | `docs/REFACTORING_REPORT.md` records changes, tests and remaining debt | Keep aligned with future changes | P2 |
| M10-01 | Useful safe runtime logging | IMPLEMENTED — NOT VERIFIED | `src/services/logger.ts` and logger tests | Review logs during Android runtime; avoid sensitive output | P2 |
| M10-02 | Android release configuration/package/icon/permissions | IMPLEMENTED — NOT VERIFIED | Expo config, `android/`; pre-existing release artifact | Rebuild from current source and inspect manifest | P1 |
| M10-03 | Fresh APK build and install | PARTIALLY IMPLEMENTED | Run 44529697756 built APK; aapt confirms only `arm64-v8a`, SQLite JNI present, and apksigner passes. Older APK's x86_64 failure reproduced on AVD | Install ARM64 artifact on physical phone and exercise app | P1 |
| M10-04 | Physical Android verification | PARTIALLY IMPLEMENTED | Local APK installed/launched on RMX2103 Android 11/API 30 ARM64; Logcat confirms startup and SQLite init; `docs/evidence/physical-android/` | User visual confirmation and functional/navigation, persistence, and OS-feature tests remain | P1 |
| M10-05 | Release candidate documentation | VERIFIED | `docs/RELEASE_CANDIDATE.md` records artifact metadata, debug signing, AVD limitation, current tests and remaining phone acceptance | Standalone install on physical phone | P1 |
| M10-06 | At least five genuine bugs and five other issues | PARTIALLY IMPLEMENTED | Issues #3–13 tracked; three genuine defects/findings (two closed, ABI issue pending phone check) and eight improvements | Five-bug assignment target remains unmet; do not invent findings | P2 |
| M10-07 | Stable `v1.0` branch with release criteria | NOT IMPLEMENTED | No `v1.0` branch observed | Create only after all release criteria pass | P1 |
| M11-01 | `v1.0_dev` development branch | NOT IMPLEMENTED | No `v1.0_dev` branch observed | Prepare after stable branch criteria | P2 |
| M11-02 | At least 200 meaningful unit tests | VERIFIED | 18 suites / 277 passed, including 132 navigation boundaries, disk-backed SQLite progress and goal lifecycle, notification, sensor, biometric and prior application behavior | Keep meaningful coverage and regression results current | P1 |
| M11-03 | Controlled failing-test demonstration and restored passing suite | VERIFIED | Isolated wrong-book expectation failed (1 failed / 153 passed); restored full suite passed 250; output in `docs/evidence/testing/controlled-failure.log` | Keep final tree passing | P1 |
| M11-04 | CI test/build pipeline | VERIFIED | Run 44558937344 for `00fdae2` passed tests, type, lint, export, prebuild, ARM64 Gradle build and artifact upload. An earlier run 44558740936 failed at Gradle; later run passed. | Download and inspect the uploaded latest APK locally; verify future branch protections/deployment if needed | P2 |
| M11-05 | V1.1 milestone and release notes | VERIFIED | `docs/V1_1_ROADMAP.md` records proposed next milestone | Scope after v1.0 acceptance | P2 |
| GIT-01 | Preserve initial uncommitted user changes | VERIFIED | Initial `app.json`/`package.json` edits were reviewed and preserved in pushed commit `a41bf72` | Keep in place | P0 |
| GIT-02 | Push reviewed checkpoints on correct branch | VERIFIED | Test milestones `3c98cf8`, `00fdae2` and documentation `6ef2fbe` pushed; remote SHA for latest test commit verified | Continue documentation/release checkpoint pushes | P1 |
| A-01 | APK installation, startup, UI and navigation on Android | PARTIALLY IMPLEMENTED | Local verified APK installed; MainActivity resumed; physical screenshot and startup Logcat saved; no app fatal or SQLite init failure observed | User confirms visible screen; then test navigation and primary workflow on phone | P1 |
| A-02 | Core form, persistence, API, errors and retry on Android | PARTIALLY IMPLEMENTED | SQLite process restart and daily verse observed in Expo Go AVD; disk-backed repository suite and app tests pass | Verify standalone APK form/API/restart behavior on phone | P1 |
| A-03 | Three advanced feature permissions and cancellation on Android | IMPLEMENTED — NOT VERIFIED | Service tests for notification permission, shake debounce, biometric success/cancel/failure; configuration inspected | Verify native permission/hardware paths on phone | P1 |
| A-04 | Lecturer walkthrough and troubleshooting guide | VERIFIED | `docs/ANDROID_DEMO_GUIDE.md` provides install and demonstration sequence | Execute on target phone | P1 |
| A-05 | Final project report with actual evidence | PARTIALLY IMPLEMENTED | Interim `docs/FINAL_PROJECT_COMPLETION_REPORT.md` records actual build/test evidence and remaining blockers | Refresh final Git state and follow-up CI result | P2 |

## Current blockers and limitations (refreshed 2026-11-19)

- Bible translation redistribution permission is unresolved. Reader content remains synthetic sample text and is explicitly labeled; real Bible content is not complete.
- The only connected Android environment is an API 37 x86_64 AVD. The inspected APK is ARM64-only, so it cannot be installed on that AVD. An ARM64 phone is needed for standalone APK acceptance.
- The actual app JavaScript bundle was run in Expo Go on the AVD. Real UI screenshots and an Expo Go/SQLite process restart observation are captured, and advanced-service tests were added. Native notification, accelerometer, and biometric flows remain unverified.
- npm audit reports six findings (3 high, 3 moderate); the safe fixes cross the SDK 57 major boundary. See `docs/SECURITY_AUDIT.md`.
- Only three genuine defects/findings are established in issue tracking. No additional bugs were invented to meet the numerical assignment requirement.
- Product architecture intentionally has no application backend. The daily verse integration is read-only; a database write API slice would be an unnecessary architecture change.
- `v1.0` and `v1.0_dev` are not created because physical-device checks, content rights, dependency risk, and stable release criteria remain open.
