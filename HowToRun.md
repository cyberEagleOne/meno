# Meno — How to Run

Verified setup and run instructions for this repository, based on `package.json`,
`README.md`, `docs/ARCHITECTURE.md` §2.5 (the recorded toolchain setup), and
commands re-verified on **2026-10-22** (see `docs/TESTING.md` §3). Steps that
are documented-but-not-performed in this environment are explicitly marked.

> Node note: this project's toolchain was built with **Node 22 via fnm**
> (`fnm exec --using=22 -- …`). That is the canonical form below. Some
> commands (jest, tsc, lint, exports) were additionally observed to run under
> the system Node v20 during the 2026-10-15 audit — do not rely on that;
> use Node 22 as documented.

## 1. Prerequisites

| Requirement | This machine | Notes |
|---|---|---|
| **fnm + Node 22** | fnm 1.39.0, Node `v22.23.3` | Required by the Expo scaffolder (`engines.node: ^22.13.0 …`). See `docs/ARCHITECTURE.md` §2.5 Stage 1. |
| **npm** | 10.9.9 (under Node 22) | Ships with Node 22. |
| **Project dependencies** | installed 2026-10-14 | `node_modules/` present; reinstall with the command in §2. |
| *For the Android emulator path only:* **JDK 17** | Temurin 17 at `~/.local/share/jdks/temurin-17` | Export `JAVA_HOME` before launching the emulator or running Android tooling. |
| *For the Android emulator path only:* **Android SDK + AVD** | SDK at `~/.local/share/android-sdk`; AVD `meno_api36` (API 36) | Setup log: `docs/ARCHITECTURE.md` §2.5 Stages 3–4. |
| *For the physical-phone path only:* an Android phone with **Expo Go** | **not performed in this environment** | `expo-sqlite` supports Expo Go (recorded in `docs/ARCHITECTURE.md` §2.1), but the QR-code/phone flow has **not** been run or evidenced here. Follow §4 at your own verification. |

No other prerequisites are required to run the tests, typecheck, lint, or
exports — those commands need only Node 22 + the installed `node_modules/`.

## 2. Install dependencies

From the project root:

```bash
fnm exec --using=22 -- npm install
```

## 3. Start the app (Metro bundler)

```bash
fnm exec --using=22 -- npx expo start
```

This starts Metro and prints a QR code. Pick a target:

### 3a. Android emulator

```bash
export ANDROID_HOME="$HOME/.local/share/android-sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
export JAVA_HOME="$HOME/.local/share/jdks/temurin-17"

emulator -avd meno_api36 -no-window -no-audio -no-boot-anim \
  -gpu swiftshader_indirect -memory 2048 -no-snapshot -no-metrics &
adb wait-for-device
adb shell getprop sys.boot_completed   # expect: 1
```

Then either press `a` in the Metro terminal, or:

```bash
fnm exec --using=22 -- npx expo start --android
```

> The current app was smoke-tested in Expo Go on an Android emulator: Home,
> chapter opening, completion/undo, and Progress were observed. Completion and
> progress remained after force-stopping Expo Go and relaunching the project.
> This is not a native APK test; see `docs/TESTING.md` §4.

### 3b. Physical Android phone (documented procedure — NOT performed here)

1. Ensure the phone and this machine are on the **same Wi-Fi network**.
2. Install **Expo Go** (Android) from the Play Store.
3. Run `fnm exec --using=22 -- npx expo start` and scan the QR code with Expo Go.

> This flow has **not** been executed or evidenced in this environment. Treat
> it as the standard Expo procedure, not as a verified step.

### 3c. Web preview (verified for bundling)

```bash
fnm exec --using=22 -- npx expo start --web
```

> Web **bundling** was verified via `expo export --platform web`
> (2026-10-15). Interactive use in a browser is not part of the
> Android-first demonstration (PRD §5.1).

## 4. Verification commands (re-verified 2026-10-22)

| Command | Purpose | Result on 2026-10-22 |
|---|---|---|
| `fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand'` | Jest unit tests | **7 suites / 73 tests passed** — `docs/TESTING.md` §3.1 |
| `fnm exec --using=22 -- npx tsc --noEmit` | TypeScript (strict) | **exit 0, clean** |
| `fnm exec --using=22 -- npm run lint` | `expo lint` (flat config) | **exit 0, no findings** |
| `fnm exec --using=22 -- npx expo export --platform android` | Expo/Metro Android JS + Hermes bundle | **success**; this does not build or test a native APK |
| `fnm exec --using=22 -- npx expo export --platform web` | Web bundle | Last recorded success on 2026-10-15; not re-run in this verification |
| `fnm exec --using=22 -- npx expo-doctor` | Dependency/config health | **not run on 2026-10-22**; last recorded: 21/21 passed on 2026-10-11 (`docs/ARCHITECTURE.md` §2.5 Stage 5) |

## 5. What is NOT covered here

- **Full acceptance-criteria walkthrough** (including search, accessibility,
  native APK behavior, and all progress states): see `checklist_mvp.md`.
- **Screenshots** are not in the repository. The demo video is stored outside
  the repository; whether it was submitted is unconfirmed.
- Native SQLite rollback and real storage-failure recovery are not verified.
- **Committing**: commits require explicit student approval per the
  `meno-workflow` skill; the MVP working tree is deliberately uncommitted.

## 6. Related documents

- [`docs/TESTING.md`](docs/TESTING.md) — verbatim test/typecheck/lint/export output
- [`checklist_mvp.md`](checklist_mvp.md) — acceptance-criteria evidence map
- [`README.md`](README.md) — project overview and layout
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — toolchain setup log (§2.5) and implemented architecture (§3–§5)
