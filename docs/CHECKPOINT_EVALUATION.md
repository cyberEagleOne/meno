# Meno — Checkpoint Evaluation Guide (P1–P7)

This guide distinguishes source/test evidence from Android runtime verification. A feature is not marked complete merely because its code or screen exists.

> **Status refresh (2026-11-27):** the dated checkpoint table and audit below originated on 2026-11-19 and have been updated here where implementation facts changed. Meno now reads local ILT3 SQLite content; it no longer uses the REST Daily Verse endpoint in the app. Latest captured local tests are 316/316. The latest Actions run passed tests/type/lint but skipped APK build. Historical screenshots exist; full native feature acceptance remains incomplete. See `README.md`, `docs/TESTING.md`, `docs/CI_CD.md`, and `checklist_mvp.md` for current details.

## 1. Current checkpoint status

| Checkpoint | Requirement | Status | Evidence | Remaining verification |
|---|---|---|---|---|
| P1 | README defines problem, users, benefits, scope, exclusions and success criteria | VERIFIED | [`README.md`](../README.md) | Keep local ILT3 prerequisite and unverified acceptance boundary clear |
| P2 | Architecture, stack, models, database, folders and data flow documented | VERIFIED | [`ARCHITECTURE.md`](ARCHITECTURE.md) and architecture diagrams/sections | Student review; update diagram only as implementation changes |
| P3 | Screens, routing, reusable components; run on Android | IMPLEMENTED — NOT VERIFIED | Expo Router source; Android JavaScript/Hermes export passed | Corrected CI native APK build, install and current device walkthrough |
| P4 | Two state-managed features and loading/empty/error/validation/submit states | VERIFIED in tests | Reading progress and reading-goal form; component/repository/domain tests | Re-demonstrate on native Android |
| P5 | SQLite models, persistence operations and restart behavior | IMPLEMENTED — NOT VERIFIED | `db.ts`, SQLite driver, fake-driver CRUD/idempotency/restart tests | Repeat controlled native SQLite restart/update/delete sequence |
| P6 | Data source/model/UI and meaningful tests | IMPLEMENTED; device acceptance partial | Current Daily Verse comes from local ILT3 via `bibleRepository.ts`; `bibleDailyVerse.test.ts` covers local repository behavior. `dailyVerse.test.ts` covers a historical REST repository. | Confirm the current build's rendered ILT3 Daily Verse on a device; ensure local DB is available |
| P7 | MVP and three advanced OS features | IMPLEMENTED — NOT VERIFIED on device | Notification, accelerometer and biometric/PIN services integrated with Settings; notification permission result unit-tested | Test grant/deny/cancel/unavailable hardware and feature behavior on Android |

## 2. Architecture and product explanation

Meno is an Android-first Indonesian Bible-reading app with local ILT3 chapter text and Daily Verse, local progress, and no Meno backend. The ILT3 file is excluded from Git and needs an authorized local copy. Its presence does not establish redistribution rights.

The implementation is separated into Expo Router screens (`src/app/`), shared UI (`src/components/ui/`), domain rules (`src/domain/`), data/repositories (`src/data/`), OS services (`src/services/`), and theme/utilities. `docs/ARCHITECTURE.md` describes the persistence, API flow and navigation.

## 3. State management demonstration

1. Open a chapter, mark it complete, and show the feedback.
2. Open **Kemajuan** and point out completion/day counts.
3. Open **Pengaturan** and show the reading goal loading/empty/saved state.
4. Enter an invalid target or too-short note to show validation. Save valid values to show success feedback.

Automated tests cover state and repository behavior. They are not a substitute for native-device screenshots or physical persistence verification.

## 4. Local persistence demonstration

On an installed build, mark a chapter complete, force-close Meno, reopen it, then return to Kemajuan and confirm the record. For a full CRUD check, update/reverse the record, restart again, and confirm the final state. A previous Expo Go smoke test is recorded in [`TESTING.md`](TESTING.md); it is historical and does not prove standalone APK behavior or native SQLite failure recovery.

## 5. Data-source tests

The current app reads Daily Verse from local ILT3 SQLite (`src/data/bibleRepository.ts`); `src/data/__tests__/bibleDailyVerse.test.ts` covers its data behavior. `src/data/__tests__/dailyVerse.test.ts` retains tests for a legacy REST repository that is no longer the current UI data path. Meno has no backend or write API.

## 6. Three advanced features

- **Daily reminder:** Settings → schedule or trigger a test notification; Android permission paths still need device verification.
- **Shake navigation:** enable the feature and shake once to open a random chapter; sensor/cooldown behavior needs device verification.
- **Biometric/PIN app lock:** enable lock and test success, cancellation and fallback; hardware paths need device verification.

Implementation references and limitations: [`ADVANCED_FEATURES.md`](ADVANCED_FEATURES.md).

## 7. Latest captured automated verification

Local captured run (2026-11-26):

- Jest: **26 suites / 316 passed / 0 failed / 0 skipped**, captured in `docs/evidence/P11/unit-tests-restored.txt`.
- TypeScript, ESLint, and diff check: PASS as recorded by the P11 audit evidence; not rerun for this documentation update.
- Latest Actions run [`45860247144`](https://github.com/cyberEagleOne/meno/actions/runs/45860247144): tests, typecheck, lint passed; Android export, APK build, and artifact upload skipped because the ILT3 asset is absent from the GitHub checkout.
- No deployment step is configured. The dependency audit in `SECURITY_AUDIT.md` is point-in-time from 2026-11-19, not a current advisory scan.

Run commands and exact report details: [`TESTING.md`](TESTING.md). Android acceptance and release status: [`RELEASE_CANDIDATE.md`](RELEASE_CANDIDATE.md).
