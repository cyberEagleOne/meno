# Meno

Meno is an **Android-first mobile Bible reader** with **gentle, gamified
reading habits**, built as a **university assignment**. The aim is a calm,
Scripture-first reading experience supported by light, encouraging habit
mechanics (streaks, daily goals, progress feedback).

> **Status: Expo starter scaffold only.** The project currently contains a
> minimal Expo application foundation. The **Bible Reader** and **Reading
> Progress** features are **NOT implemented yet**, and **no Bible text is
> bundled**. Nothing below should be read as a claim that a feature is
> complete.

## Stack

| Layer | Choice |
|---|---|
| Framework | Expo (managed) — **SDK 57** |
| Runtime | React Native 0.86, React 19.2 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based; routes in `src/app/`) |
| Local database | `expo-sqlite` (installed; no schema yet) |

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
fnm exec --using=22 -- npx expo-doctor
```

## MVP intentions (planned, not implemented)

Per [`docs/PRD.md`](docs/PRD.md), the MVP is two features:

1. **Bible Reader** — browse books, open a book/chapter, render verses, move
   between chapters, and restore the last-read location.
2. **Persistent Reading Progress** — mark chapters read (idempotently), store
   progress locally in SQLite so it survives restarts, and show chapters read,
   days read, and current streak.

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

- [`docs/PRD.md`](docs/PRD.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- [`docs/ASSIGNMENT_TRACEABILITY.md`](docs/ASSIGNMENT_TRACEABILITY.md)
- [`docs/12_MEETING_PLAN.md`](docs/12_MEETING_PLAN.md)

## Repository layout

```
src/app/        Expo Router routes (SDK 57 default location)
assets/         icons and splash assets (template)
docs/           planning documents
.opencode/      OpenCode workflow skills
app.json  package.json  tsconfig.json  .gitignore  .vscode/
```
