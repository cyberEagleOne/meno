# Meno

Meno is an Android-first, offline-first Bible reading and reading-progress app built with Expo, React Native, TypeScript, Expo Router, and Expo SQLite. It has no Meno backend, account system, or cloud sync. Reading progress and the Bible content used by the app are local.

Meno is designed for readers who want to resume a reading habit with a calm interface and low-pressure progress feedback. Its core MVP is the Bible reader plus persistent reading progress. Daily Verse, random-chapter navigation, reminders, haptics, app lock, and badges/progress polish are additional implemented features.

The primary audience is a returning reader who wants to pick up after a break; a secondary audience is a new reader who benefits from a clear book/chapter structure. The product keeps reading actions explicit and stores progress on-device.

## Current project facts

- App/package version: `1.0.0` (`package.json` / `app.json`). This is not a declared Git release: there is no `v1.0` release tag, `v1.0_dev` branch, or published release.
- Default branch: `master`. Latest verified checkout at the documentation review: `6a174c5` (`docs: finalize P11 and P12 evidence`).
- Local test evidence: 26 Jest suites, 316 passed, 0 failed, 0 skipped. See [Testing](docs/TESTING.md) for the captured output and its scope.
- GitHub Actions run [45860247144](https://github.com/cyberEagleOne/meno/actions/runs/45860247144) passed tests, TypeScript, and lint. Android export, native project generation, APK build, and artifact upload were skipped because the private/local ILT3 database is absent from the GitHub checkout. CI did not build an APK and does not deploy the app.
- GitHub Issue tracker: 13 Issues, including five labeled `bug`; #16 and #17 are closed records of historical bugs fixed in commit `db4063f`. See [P11 audit](docs/P11_AUDIT_REPORT.md).

## Features implemented

- Browse the 66 Bible books and 1,189 chapters and read chapter text from a local ILT3 SQLite asset.
- Resume the last read location and track completed chapters and distinct reading days in local SQLite.
- Show a date-keyed Daily Verse from the local ILT3 database; this does not require a REST API or internet connection.
- Open a random chapter from the Home card or supported shake gesture.
- Configure a local daily reminder, haptic feedback, and optional device-authentication app lock.
- Review progress, habit milestones, and collectible badges.

Implementation does not by itself mean every feature has passed full device acceptance. The [MVP checklist](checklist_mvp.md), [Android demo guide](docs/ANDROID_DEMO_GUIDE.md), and [evidence guide](docs/P11_P12_EVIDENCE_GUIDE.md) distinguish automated coverage, emulator preview, and physical-device verification.

## Stack

| Layer | Implementation |
|---|---|
| Framework | Expo SDK 57 / React Native 0.86 |
| Language | TypeScript |
| Navigation | Expo Router |
| Local persistence | Expo SQLite; web driver uses browser local storage |
| Tests | Jest with `jest-expo` |

Cloud accounts/sync, a Meno backend, social features, audio, monetization, and user-facing translation switching are outside the current MVP scope.

## ILT3 database prerequisite

The app expects an authorized local copy of `assets/database/ilt3.sqlite`. The tracked `.gitignore` excludes `assets/database/*.sqlite`; the file is not present in a fresh public clone or the GitHub Actions runner. The app's Bible reader and local Daily Verse need that asset to initialize. Do not create a substitute database or commit/upload the ILT3 file. Obtain and place it locally only where you have permission to use it. The repository does not establish redistribution rights; confirm those rights before distributing an app bundle containing the database.

After placing the database, verify it is ignored with `git check-ignore assets/database/ilt3.sqlite` before staging any files.

## Run locally

Prerequisites: Node.js 22, npm, and an authorized local ILT3 database at the path above. Install dependencies and start Expo:

```bash
npm ci
npx expo start
```

Use Expo Go on a compatible device, or start an Android emulator and press `a` in the Expo terminal. Native Android builds additionally require Android SDK tooling and JDK 17:

```bash
npm run android
```

Detailed setup, database prerequisite, and verification commands are in [HowToRun.md](HowToRun.md). The web script is available (`npm run web`), but a complete web feature/runtime acceptance pass is not recorded.

## Verify

```bash
npm test -- --runInBand
npx tsc --noEmit
npm run lint
git diff --check
```

The 316-test captured local run used Node 22. On a clone without ILT3, database-dependent cases may be skipped by the test configuration and Android APK CI steps are skipped; check the actual command output rather than assuming the local result applies to CI.

## MVP scope

The current implemented MVP centers on Bible reading, local reading progress, and gentle reading support (Daily Verse, random chapter, reminders, app lock, haptics, badges/progress). It intentionally excludes accounts, cloud sync, a Meno backend, social features, audio, and monetization. See [PRD](docs/PRD.md) for planned scope and [current evidence](docs/TESTING.md) for what has actually been verified.

## Project documentation

- [How to run](HowToRun.md)
- [MVP acceptance checklist](checklist_mvp.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Testing evidence](docs/TESTING.md)
- [P11 audit and Issue inventory](docs/P11_AUDIT_REPORT.md)
- [P12 security risk report](docs/P12_SECURITY_RISK_REPORT.md)
- [P11/P12 evidence guide](docs/P11_P12_EVIDENCE_GUIDE.md)
- [CI/CD](docs/CI_CD.md)
- [Development progress](docs/DEVELOPMENT_PROGRESS.md)
- [V1.1 roadmap](docs/V1_1_ROADMAP.md) (planning document, not a release)
