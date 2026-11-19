# Meno — Checkpoint Evaluation Guide (P1–P7)

This guide distinguishes source/test evidence from Android runtime verification. A feature is not marked complete merely because its code or screen exists.

## 1. Current checkpoint status

| Checkpoint | Requirement | Status | Evidence | Remaining verification |
|---|---|---|---|---|
| P1 | README defines problem, users, benefits, scope, exclusions and success criteria | VERIFIED | [`README.md`](../README.md), Meeting 1 section | Keep claims aligned with placeholder-content/licensing limitation |
| P2 | Architecture, stack, models, database, folders and data flow documented | VERIFIED | [`ARCHITECTURE.md`](ARCHITECTURE.md) and architecture diagrams/sections | Student review; update diagram only as implementation changes |
| P3 | Screens, routing, reusable components; run on Android | IMPLEMENTED — NOT VERIFIED | Expo Router source; Android JavaScript/Hermes export passed | Corrected CI native APK build, install and current device walkthrough |
| P4 | Two state-managed features and loading/empty/error/validation/submit states | VERIFIED in tests | Reading progress and reading-goal form; component/repository/domain tests | Re-demonstrate on native Android |
| P5 | SQLite models, persistence operations and restart behavior | IMPLEMENTED — NOT VERIFIED | `db.ts`, SQLite driver, fake-driver CRUD/idempotency/restart tests | Repeat controlled native SQLite restart/update/delete sequence |
| P6 | API repository/model/UI and six meaningful tests | VERIFIED for repository behavior | `dailyVerse.test.ts` covers valid/invalid model, success, empty, HTTP and malformed JSON; live endpoint returned John 3:16 on 2026-11-19 | Confirm rendered UI with live response; content is English World English Bible |
| P7 | MVP and three advanced OS features | IMPLEMENTED — NOT VERIFIED on device | Notification, accelerometer and biometric/PIN services integrated with Settings; notification permission result unit-tested | Test grant/deny/cancel/unavailable hardware and feature behavior on Android |

## 2. Architecture and product explanation

Meno is an Android-first Indonesian Bible-reading habit prototype. The reader currently displays synthetic text labelled **TEKS CONTOH — BUKAN KITAB SUCI** because redistribution rights for a real Indonesian translation are unresolved. Its app-owned progress is local SQLite; there is no Meno backend. The daily verse card reads from a public HTTPS REST endpoint.

The implementation is separated into Expo Router screens (`src/app/`), shared UI (`src/components/ui/`), domain rules (`src/domain/`), data/repositories (`src/data/`), OS services (`src/services/`), and theme/utilities. `docs/ARCHITECTURE.md` describes the persistence, API flow and navigation.

## 3. State management demonstration

1. Open a chapter, mark it complete, and show the feedback.
2. Open **Kemajuan** and point out completion/day counts.
3. Open **Pengaturan** and show the reading goal loading/empty/saved state.
4. Enter an invalid target or too-short note to show validation. Save valid values to show success feedback.

Automated tests cover state and repository behavior. They are not a substitute for native-device screenshots or physical persistence verification.

## 4. Local persistence demonstration

On an installed build, mark a chapter complete, force-close Meno, reopen it, then return to Kemajuan and confirm the record. For a full CRUD check, update/reverse the record, restart again, and confirm the final state. A previous Expo Go smoke test is recorded in [`TESTING.md`](TESTING.md); it is historical and does not prove standalone APK behavior or native SQLite failure recovery.

## 5. API tests

`src/data/__tests__/dailyVerse.test.ts` contains six distinct cases: valid model, invalid model, successful response, empty response, HTTP/network failure, and malformed JSON. The live endpoint was reachable on 2026-11-19. This is a read-only slice; no backend or write endpoint is part of Meno's architecture.

## 6. Three advanced features

- **Daily reminder:** Settings → schedule or trigger a test notification; Android permission paths still need device verification.
- **Shake navigation:** enable the feature and shake once to open a random chapter; sensor/cooldown behavior needs device verification.
- **Biometric/PIN app lock:** enable lock and test success, cancellation and fallback; hardware paths need device verification.

Implementation references and limitations: [`ADVANCED_FEATURES.md`](ADVANCED_FEATURES.md).

## 7. Current automated verification

On 2026-11-19, after dependency and notification permission changes:

- Jest: **15 suites / 252 tests passed**.
- TypeScript: `npx tsc --noEmit` passed.
- ESLint: `npm run lint` passed.
- Expo Doctor: **21/21 checks passed**.
- Android JS/Hermes export: passed; this is not a native APK build.
- Dependency audit: **6 findings remain** (3 high, 3 moderate); see [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md).
- CI run [`44513648948`](https://github.com/cyberEagleOne/meno/actions/runs/44513648948) passed tests/type/lint/export/prebuild and was still building the APK at last check.

Run commands and exact report details: [`TESTING.md`](TESTING.md). Android acceptance and release status: [`RELEASE_CANDIDATE.md`](RELEASE_CANDIDATE.md).
