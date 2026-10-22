# Meno

Meno is an **Android-first mobile Bible reader** with **gentle, gamified
reading habits**, built as a **university assignment**. The aim is a calm,
Scripture-first reading experience supported by light, encouraging habit
mechanics (progress feedback; streaks and daily goals are **deferred** from
the MVP — see [`docs/PRD.md`](docs/PRD.md) §10).

> **Status (2026-10-22):** Both MVP features are implemented and runnable:
> the **Bible Reader** (book list → chapter grid → reader) and **Persistent
> Reading Progress** (SQLite last-read + idempotent chapter completion, with a
> Kemajuan screen), plus the two-tab shell (Baca, Kemajuan) and the integrated
> design system. **73 tests pass across 7 suites** (see
> [`docs/TESTING.md`](docs/TESTING.md)). The bundled Bible text is still a
> clearly-labelled **synthetic placeholder** — no real translation is bundled
> (ILT3 redistribution permission remains unconfirmed,
> [`docs/PRD.md`](docs/PRD.md) §5.4). An Android Expo Go smoke test observed
> Home, chapter open, completion/undo, Progress, and completion/progress
> persisting after force-stop/relaunch. Android bundle export passed; this is
> not a native APK test. Native SQLite rollback and real storage-failure
> recovery remain unverified. The demo video is outside this repository and
> submission is unconfirmed. As of this date
> the implementation exists in the working tree; **commits are pending the
> student's review and approval**.

## Stack

| Layer | Choice |
|---|---|
| Framework | Expo (managed) — **SDK 57** |
| Runtime | React Native 0.86, React 19.2 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based; routes in `src/app/`) |
| Local database | `expo-sqlite` (schema + injectable driver seam implemented; tables created on first launch) |

Verified toolchain versions (2026-10-11): `expo 57.0.27`, `react-native 0.86.3`,
`react 19.2.3`, `expo-router 57.0.25`, `expo-sqlite 57.0.4`,
`typescript 6.0.3`.

## Prerequisites and environment

- **fnm** with **Node 22** (verified with `v22.23.3`) — the Expo scaffolder
  requires `^22.13.0`. The system Node (v20) is **not** sufficient.
- **Temurin JDK 17** — at `~/.local/share/jdks/temurin-17`.
- **Android SDK Platform 36** (Android 16 "Baklava") with build-tools,
  platform-tools, and an emulator — at `~/.local/share/android-sdk`.
- An **Android emulator (AVD)** named `meno_api36`.

## Setup

From the project root:

```bash
fnm exec --using=22 -- npm install
```

## Run on the Android emulator

The AVD must be **running before** you start Expo. Set the environment for the
current shell and boot the existing `meno_api36` AVD:

```bash
export ANDROID_HOME="$HOME/.local/share/android-sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
export JAVA_HOME="$HOME/.local/share/jdks/temurin-17"

# Launch the existing AVD (headless example)
emulator -avd meno_api36 -no-window -no-audio -no-boot-anim \
  -gpu swiftshader_indirect -memory 2048 -no-snapshot -no-metrics &

adb wait-for-device
adb shell getprop sys.boot_completed   # expect: 1
```

Then start Expo and open the app on Android:

```bash
fnm exec --using=22 -- npx expo start --android
```

If you prefer, start Metro separately and open Android from the Expo CLI:

```bash
fnm exec --using=22 -- npx expo start
```

## Verification

```bash
fnm exec --using=22 -- npx tsc --noEmit
fnm exec --using=22 -- npm run lint
fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand'
fnm exec --using=22 -- npx expo-doctor
```

Actual results and the test inventory are recorded in
[`docs/TESTING.md`](docs/TESTING.md).

## MVP status (implemented)

Per [`docs/PRD.md`](docs/PRD.md), the MVP is two features — both now implemented:

1. **Bible Reader** — book list, chapter grid, verse rendering, next/previous
   chapter navigation (cross-book boundaries), last-read restore.
2. **Persistent Reading Progress** — idempotent per-chapter completion stored
   in SQLite (survives restarts), last-read and scroll position persistence,
   chapters-read totals, milestones, per-testament progress (Kemajuan screen).

### Explicitly out of scope (for now)

- User accounts, cloud sync, or any backend.
- Social features, leaderboards, or sharing.
- Audio Bible, commentary, or devotionals.
- Multiple translations at launch.
- Monetisation, ads, or paid content.

## Bible content and licensing caveat

No Bible text is bundled in this repository. The intended embedded source is
the **ILT3** translation, and its **redistribution/embedding permission is
unresolved**. Permission must not be assumed granted, and no Bible text will be
added until licensing is confirmed and recorded (see
[`docs/PRD.md`](docs/PRD.md) §5.4).

## Documentation

- [`HowToRun.md`](HowToRun.md) — setup, run, and verification commands
- [`checklist_mvp.md`](checklist_mvp.md) — acceptance-criteria evidence map
- [`docs/PRD.md`](docs/PRD.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- [`docs/TESTING.md`](docs/TESTING.md)
- [`docs/ASSIGNMENT_TRACEABILITY.md`](docs/ASSIGNMENT_TRACEABILITY.md)
- [`docs/12_MEETING_PLAN.md`](docs/12_MEETING_PLAN.md)

## Repository layout

```
src/app/        Expo Router routes (tabs, library, chapters, reader)
src/data/       SQLite persistence (expo-sqlite driver seam), placeholder dataset
src/domain/     Pure, unit-tested domain logic (navigation, progress rules)
src/theme/      Design tokens (colors, fonts, spacing)
src/components/ui/  Shared UI components (buttons, rings, icons, mascots)
assets/         Icons, splash, and Meno mascot artwork
docs/           Planning documents and evidence
.opencode/      OpenCode workflow skills
app.json  package.json  tsconfig.json  metro.config.js  eslint.config.js
```
