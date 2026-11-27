# Meno — How to Run

This guide describes the checked-in project, plus local prerequisites that are not distributed with the public repository.

## Prerequisites

- Node.js 22 (the disk-backed SQLite test suite uses `node:sqlite`). `fnm` is one supported way to select Node 22.
- npm, installed with Node.js.
- An authorized local copy of `assets/database/ilt3.sqlite` to run the app's Bible reader and Daily Verse. The database is ignored and not included in GitHub. Do not substitute or commit another database.
- For a native Android build: Android SDK/platform tools and JDK 17. Expo Go can be used for the managed development preview.

Check the private/local database is ignored before continuing:

```bash
git check-ignore assets/database/ilt3.sqlite
```

## Install and start

From the repository root:

```bash
npm ci
npx expo start
```

Then select an available target:

- Android emulator: start an emulator and press `a` in the Expo terminal.
- Physical Android device: install Expo Go, put the device and development computer on the same network, then scan the Expo CLI QR code.
- Web preview: `npm run web`. This script exists, but full web runtime acceptance is not recorded.

For a generated native Android project/build, configure Android SDK and JDK 17, then run:

```bash
npm run android
```

This is a local development build command. GitHub Actions currently does not produce an APK when the local ILT3 database is absent from the checkout.

## Test and static checks

```bash
npm test -- --runInBand
npx tsc --noEmit
npm run lint
git diff --check
```

Use Node 22 for the complete local test inventory. The recorded local result is 26 suites / 316 passed / 0 failed / 0 skipped, captured in `docs/evidence/P11/unit-tests-restored.txt`. It is a past captured run, not a claim that tests were rerun every time this guide is read.

## Verified behavior and limits

- Expo Go Android emulator screenshots and a limited persistence smoke test exist in `docs/evidence/android/` and `docs/evidence/ui-review/`.
- A historical ARM64 APK startup was observed on an RMX2103 physical phone; screenshots and logs are in `docs/evidence/physical-android/`. This is not full physical-device acceptance of all features.
- The most recent checked-in GitHub Actions run, [45860247144](https://github.com/cyberEagleOne/meno/actions/runs/45860247144), passed Unit Tests, TypeScript, and lint. Android bundle export, native prebuild, APK build, and artifact upload were skipped because the ILT3 database was unavailable in the GitHub checkout.
- No deployment/publication job is configured. A successful CI workflow conclusion does not mean an APK was built or the app was deployed.
- UI screenshots in the repository are genuine historical captures; their capture dates and runtime context are documented in `docs/P11_P12_EVIDENCE_GUIDE.md` and `docs/UI_UX_REVIEW.md`.

## Related documentation

- [`README.md`](README.md) — project overview and current facts
- [`checklist_mvp.md`](checklist_mvp.md) — acceptance-criteria status and evidence
- [`docs/TESTING.md`](docs/TESTING.md) — test inventory, captured outputs, and verification scope
- [`docs/ANDROID_DEMO_GUIDE.md`](docs/ANDROID_DEMO_GUIDE.md) — Android demonstration and device checklist
- [`docs/CI_CD.md`](docs/CI_CD.md) — workflow behavior and latest CI result
