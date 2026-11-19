# Meno Project Reconnaissance

**Audit date:** 2026-11-19
**Working branch:** `feat/assignment-completion`
**Evidence scope:** repository source, tracked documentation, Git metadata, local tool availability, and commands run in this workspace.

## Overview

Meno is an Android-first, Indonesian-language Bible reading habit app for readers who want a calm way to resume reading and track progress. It is a React Native application built with Expo and TypeScript. This is a university assignment project, not a production service.

The main value proposition is local, private reading progress with a low-pressure reading experience. A critical content limitation remains: the reader currently displays explicitly labelled synthetic placeholder text. The intended Indonesian translation's redistribution rights are unresolved; the placeholder must not be presented as Scripture.

## Technology and structure

| Area | Implementation observed |
|---|---|
| Mobile framework | Expo / React Native; Expo 57.0.33, React Native 0.86, React 19 (SDK patches updated during this audit) |
| Language | TypeScript with `strict` enabled |
| Navigation | Expo Router, route files under `src/app/` |
| State | React Context for reading progress; component state and repository-backed goal form |
| Local data | `expo-sqlite` through `SqlDriver`, with a web implementation and injectable in-memory test driver |
| Remote data | Daily verse GET request in `src/data/dailyVerseRepository.ts` to `https://bible-api.com/john+3:16` |
| Device features | `expo-notifications`, `expo-sensors`, and `expo-local-authentication` wrappers in `src/services/` |
| Tests | Jest / `jest-expo`, React Test Renderer, pure domain and repository tests; 250 cases after audit expansion |
| Android | Expo prebuild project under `android/`; release APK/AAB are present under ignored Gradle output |
| CI | `.github/workflows/android-ci.yml`; first pushed run passed tests/type/lint/bundle but APK stage failed; corrected workflow prebuild is not yet pushed |

Main source folders are `src/app` (screens/routes), `src/components/ui` (shared UI), `src/data` (repositories and SQLite), `src/domain` (business rules), `src/services` (OS integrations and logging), and `src/theme` / `src/utils` (design and formatting).

## Existing features

- Bible canon browsing and chapter routing across 66 books and 1,189 chapters.
- Reader screen with synthetic, clearly labelled sample verses; no real translation is bundled.
- Last-read location, completed-chapter progress, distinct reading days, and progress reporting backed by SQLite abstractions.
- Daily verse remote read with model validation and loading/error/retry UI.
- Reading-goal form with validation, repository access, loading/error/empty/success paths, retry and duplicate-submit protection.
- Daily local reminder, shake-to-open-random-chapter, and biometric/PIN app-lock flows are represented in application settings and service wrappers.
- Structured runtime logger with level filtering and sensitive-value sanitization.

Feature existence does not establish successful native-device behavior. See the audit and device limitations below.

## Tests and fresh baseline

The repository contains 14 test files. The initial 2026-11-19 baseline was:

- `npm test -- --runInBand`: **14 suites, 118 tests passed**.
- `npx tsc --noEmit`: **passed, no diagnostics**.
- `npm run lint`: initial failure due to a synchronous state update in an effect and four unused declarations; the narrow fix subsequently passed lint.

After adding exhaustive per-book navigation boundary cases, the suite is now 250 tests; it passed after SDK dependency updates in 14.654 s. `npx tsc --noEmit` and `npm run lint` also passed after source/dependency changes. `npx expo-doctor` reported 21/21 checks. The Android export passed before SDK patch updates; a post-update export is pending. Most local persistence coverage uses the injected in-memory driver. Prior docs report Expo Go smoke testing, but this audit did not repeat that test.

## Current build and Android environment

An ignored `android/app/build/outputs/apk/release/app-release.apk` exists (120,194,054 bytes; timestamp 2026-11-15) along with an AAB. These are pre-existing build outputs, not a build produced or installation verified during this audit. The APK signing configuration in `android/app/build.gradle` uses the standard debug keystore; it is suitable only as a demonstrator sideload artifact, not a production signing setup.

The current host reports Node 24.19.0 and Java 8.401. `adb`, `ANDROID_HOME`, and `ANDROID_SDK_ROOT` were not found in the shell. The README's recorded setup expects Node 22 and JDK 17 with Android SDK Platform 36. No accessible emulator or physical Android device has been established. A fresh native build/install is therefore not yet verified.

## Git and working-tree state

- Remote: `https://github.com/cyberEagleOne/meno.git` (`origin`).
- Branch: `feat/assignment-completion`.
- HEAD at audit start: `38b7616`; three commits ahead of `origin/feat/assignment-completion`.
- User's pre-existing working-tree changes: `app.json` and `package.json`. They add Android identity/permission configuration and change `android`/`ios` scripts to native `expo run`. They are preserved and not staged by this audit.
- `git fetch origin` succeeded; the remote feature branch remains at `9ae7413`. Remote `master` advanced to `a0d0bcd` and is separate from this feature branch.
- Audit commits `871548b` and `4c7603c` were pushed. A dependency/security/CI correction is in progress and not yet committed.

## Technical debt and risks

1. **Content blocker:** synthetic placeholder verses prevent a real Scripture-reading demonstration. Resolve exact translation, source, licence, attribution, and redistribution permission before replacing the content.
2. **Android verification gap:** the existing APK is a pre-existing, debug-signed artifact. JDK 17, Android SDK, and a device/emulator are unavailable in the active shell. CI ran but could not find the ignored Android project; the workflow now prebuilds it before Gradle, pending rerun.
3. **Test target gap:** 118 current tests vs 200 required; there is no in-repository evidence for a controlled failed-test demonstration.
4. **UI evidence gap:** no current-run screenshots or full screen-size, keyboard, TalkBack, and accessibility evidence is stored in `docs/evidence/`.
5. **Advanced-feature verification gap:** feature wrappers and UI exist, but permission denial/cancellation and real native behavior have not been verified in this audit.
6. **API scope:** daily verse is a meaningful read-only external API integration. Meno intentionally has no app backend/database server, so a UI→model→repository→API→backend→database write slice is not applicable to its architecture. Live service connectivity still needs verification.
7. **Documentation drift:** README/Architecture/Testing include historical claims and conflicting test counts. This audit records current command evidence separately; source and docs should be kept synchronized.
8. **Dependency advisories:** after compatible SDK patches and non-forced npm remediation, 6 findings remain (3 high, 3 moderate) in Expo transitive dependencies; automatic fixes require an incompatible version change.
9. **No authenticated issue creation path:** GitHub currently has zero open issues; `gh` CLI and issue write integration are unavailable.

## Recommended priorities

1. Fix and verify lint; record fresh test/type/lint/export/build results.
2. Produce the requirement audit and reconcile docs with implementation.
3. Resolve the Bible content licence with the student/lecturer before adding real text; retain a clearly labelled demo mode meanwhile.
4. Expand tests with meaningful edge and state coverage; capture the controlled failing-test run.
5. Reproduce a native APK with JDK 17/Android SDK, then install and test on emulator or phone.
6. Capture real runtime UI and testing evidence, complete accessibility/keyboard review, and write the lecturer walkthrough.
7. Establish a CI workflow and issue tracking only where GitHub access and genuine findings support them.
8. Create stable/development release branches only after their criteria are actually met.
