# Meno — Architecture

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.2.8 (app foundation) |
| Last updated | 2026-10-11 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |

> Evidence policy: through Stage 4 (2026-10-10) no application had been scaffolded and no app dependency installed. In **Stage 5 (2026-10-11)** a minimal Expo SDK 57 app was scaffolded, dependencies were installed, and `expo-doctor` / `tsc` were run — results are recorded in §2.5. No native build was produced and no commit exists. Version/registry checks are labelled with their dates.

---

## 1. Stack (validated in Stage 5)

| Layer | Choice | Status |
|---|---|---|
| Language | TypeScript | **Verified** — `typescript 6.0.3` |
| Framework | React Native via Expo | **Verified** — Expo SDK 57 (`expo 57.0.27`, `react-native 0.86.3`, `react 19.2.3`) |
| Navigation | Expo Router (file-based) | **Verified** — `expo-router 57.0.25` |
| Local database | Expo SQLite (`expo-sqlite`) | **Verified compatible / installed** — `expo-sqlite 57.0.4` |
| Unit testing | Jest + `jest-expo` (domain layer) | Proposed — [Open Question] exact runner |

## 2. Compatibility validation (2026-10-10)

### 2.1 Package versions observed
- **[Confirmed]** Latest stable Expo SDK at time of writing is **SDK 57** (`expo@57.0.27`, `expo-router@57.0.25`, `expo-sqlite@57.0.4` from the npm registry).
- **[Confirmed]** Expo SDK 56 (released 2026-05-21) uses React Native 0.85 / React 19.2; SDK 57 upgrades to React Native 0.86.
- **[Confirmed]** `expo-sqlite` supports `android`, `ios`, `macos`, `tvos`, `web`, and `expo-go` platforms, and its database persists across app restarts — suitable for Feature 2.
- **[Confirmed]** Expo Router provides file-based routing and builds on `react-native-screens` for native navigators on mobile.
- **[Confirmed]** SDK 57 resolves the SDK 56 Hermes V1 memory regression affecting apps that import `react-native-worklets`/`react-native-reanimated` (`expo@57.0.17` → RN 0.86.3), and is documented as a non-breaking, minor-style upgrade. ([SDK 57 changelog](https://expo.dev/changelog/sdk-57), [SDK 56 changelog](https://expo.dev/changelog/sdk-56))
- **[Confirmed]** Android requirements are the same for SDK 56 and 57: compile/target **Android SDK Platform 36 (Android 16 "Baklava")**, plus Build-Tools and an Emulator; local Android builds use **JDK 17**. ([Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment))
- **[Confirmed]** The current scaffolder `create-expo@5.0.3` (`@latest`) declares `engines.node: ^22.13.0 || ^24.3.0 || ^26.0.0 || >=27.0.0` (npm registry), and RN 0.85 (SDK 56) "drops support for Node.js versions before v20.19.4" — so **both SDK 56 and 57 require a Node upgrade on this machine**.

### 2.2 Environment compatibility findings
| Tool | Detected | Assessment |
|---|---|---|
| Node | system v20.19.2; **fnm v22.23.3** | ✅ **[Resolved 2026-10-10]** Node 22 LTS installed via fnm into `~/.local/share/fnm`; satisfies `create-expo@5.0.3` engines (`^22.13.0 …`). System Node left untouched. |
| npm | 9.2.0 (system) / **10.9.9** (Node 22) | OK; use the Node 22 npm for scaffolding. |
| Python | 3.13.5 | Satisfies `ui-ux-pro-max` requirement. |
| Git | 2.47.3 | OK. |
| Java | system OpenJDK 25; **Temurin JDK 17.0.20.1** | ✅ **[Resolved 2026-10-10]** User-local Temurin 17 at `~/.local/share/jdks/temurin-17` (includes `javac`; system JDK 17 was JRE-only). Use `JAVA_HOME=~/.local/share/jdks/temurin-17` for Android builds. |
| Android SDK / `adb` / emulator | **not found** | Needed for a local Android build; `/dev/kvm` is already usable (rw via ACL). |

> **Decision (recorded 2026-10-10):** Target **Expo SDK 57** with a **local Android build**. Prerequisites to satisfy before scaffolding (Milestone 0 → 1):
> 1. Upgrade Node to **≥ 22.13.0** (planned: Node 22 LTS) — required by the scaffolder and by the RN floor.
> 2. Install **JDK 17** for the Gradle/Android toolchain.
> 3. Install the **Android SDK Platform 36** + build-tools + platform-tools + emulator (user-local, no root).
>
> Rationale: the scaffolder already forces Node ≥ 22.13, so SDK 56 offers no "stay on Node 20" advantage; SDK 57 removes the Hermes V1 regressions and is a non-breaking upgrade. This is the student's approved decision; installation has **not** yet been performed.

### 2.3 Alternatives (documented, not chosen)
- **Expo Go vs development build:** Expo Go is fastest for demoing managed APIs, but SQLite and some native modules may require a development build for full fidelity. Confirm which the assignment demo will use.
- **Expo Router vs React Navigation:** Expo Router is file-based and recommended; note SDK 56+ changes its internals away from React Navigation. If Expo Router proves problematic, plain React Navigation remains an alternative.
- **Raw `expo-sqlite` vs an ORM (e.g. Drizzle):** Drizzle offers typed schema + migrations on `expo-sqlite`, but adds a dependency. Per `meno-workflow` ("avoid unnecessary dependencies"), start with raw `expo-sqlite` unless typing needs justify the wrapper. **[Open Question]**
- **Bundled JSON content vs remote API:** a bundled dataset keeps the app offline-capable and aligns with the no-backend non-goal.

### 2.4 SDK 56 vs 57 — recorded comparison
| Criterion | SDK 56 | SDK 57 |
|---|---|---|
| React Native / React | 0.85 / 19.2 | 0.86 / 19.2 |
| Min Node (RN floor) | ≥ 20.19.4 | ≥ 20.19.4 (inherited) |
| Scaffolder Node floor | ≥ 22.13.0 | ≥ 22.13.0 |
| Android compile/target | Platform 36 | Platform 36 |
| Local-build JDK | 17 | 17 |
| Hermes V1 regressions | present | **fixed** (`expo@57.0.17`) |

**Chosen: SDK 57.**

### 2.5 Toolchain setup log
**Stage 1 — Node (completed 2026-10-10).** No `sudo`; no shell-config edits.
| Item | Value |
|---|---|
| fnm | `1.39.0`, installed to `~/.local/bin/fnm` (GitHub release binary `fnm-linux.zip`) |
| zip sha256 | `7807664f39d39fc518da1c35ba0181e4b3267603c4b1dedeb4b5fc6ae440a224` (no official checksum published by upstream) |
| `FNM_DIR` | `~/.local/share/fnm` (fnm default; no env export required) |
| Node | `v22.23.3` (default) |
| npm | `10.9.9` |
| Engine check | `create-expo@5.0.3` `engines.node: ^22.13.0 || ^24.3.0 || ^26.0.0 || >=27.0.0` — **satisfied** |
| System Node | untouched (`/usr/bin/node` = v20.19.2) |
| Usage | `fnm exec --using=22 -- <cmd>` |

**Stage 2 — JDK 17 (completed 2026-10-10).** No `sudo`; no shell-config edits.
| Item | Value |
|---|---|
| Distribution | Eclipse Temurin `jdk-17.0.20.1+1` (Adoptium), `OpenJDK17U-jdk_x64_linux_hotspot_17.0.20.1_1.tar.gz` |
| sha256 | `3808d1d15e3ec6bd5b84057fb5d84c33d8a1536a258146bcea2e603fc726e08e` — **verified** |
| Location | `~/.local/share/jdks/jdk-17.0.20.1+1`, stable symlink `~/.local/share/jdks/temurin-17` |
| Verified | `java -version` → 17.0.20.1; `javac -version` → 17.0.20.1 |
| Rationale | System had `openjdk-17-jre` only (no `javac`); default Java is 25. |
| Usage | `export JAVA_HOME="$HOME/.local/share/jdks/temurin-17"` for Android builds |

**Stage 3A — Android Command-line Tools download (completed 2026-10-10).** Download + verify only; not extracted or installed.
| Item | Value |
|---|---|
| Package | Android SDK Command-line Tools, channel `latest` (`cmdline-tools` 23.0) |
| File | `commandlinetools-linux-16111833_latest.zip` |
| Size | 181,052,239 bytes — matches published size |
| sha1 (published in repo) | `e025545c62a8e64c7559119566a569fb1dec5f60` — **verified** |
| sha256 (recorded) | `0877a1d048fe4a24efe2eff536ca4223f7adeb58648bb81909d33c446918cfa8` |
| Location | `/tmp/opencode/android/` (temporary; not yet extracted) |
| Integrity | `unzip -t` passed; contains `cmdline-tools/bin/sdkmanager` |
| Not done | No extraction; `ANDROID_HOME`/`PATH` unchanged |

**Stage 3B — Command-line Tools extract + package inspection (completed 2026-10-10).** Extraction and inspection only; **no packages installed, no licenses accepted**.
| Item | Value |
|---|---|
| Extracted to | `~/.local/share/android-sdk/cmdline-tools/latest` (revision 23.0, `Pkg.Revision=23.0`) |
| `sdkmanager` | works via `JAVA_HOME=~/.local/share/jdks/temurin-17`; prints deprecation notice — superseded by the new `android sdk` CLI |
| Available: platform-tools | `platform-tools` 37.0.1 |
| Available: platform 36 | `platforms;android-36` (rev 2.0.0) |
| Available: build-tools | `build-tools;36.0.0`, `36.1.0`, `37.0.0` |
| Available: emulator | `emulator` 37.2.12 |
| Available: system images (API 36) | `system-images;android-36;google_apis;x86_64` (and `_playstore`, arm64 variants) |
| `ANDROID_HOME` | still **unset**; `~/.local/share/android-sdk/licenses` does **not** exist |

**Stage 3C — SDK package install (completed 2026-10-10).** Installed after student's explicit acceptance of the Android SDK License Agreement (`android-sdk-license`, Jan 16 2019).
| Item | Value |
|---|---|
| License accepted | `android-sdk-license` only → `~/.local/share/android-sdk/licenses/android-sdk-license` (hashes `8933bad1…` + `24333f8a…`) |
| platform-tools | `37.0.1` (includes `adb`) |
| platforms/android-36 | rev `2.0.0` |
| build-tools/36.0.0 | rev `36.0.0` |
| emulator | `37.2.12` |
| system-images/android-36/google_apis/x86_64 | rev `7` |
| Install | exit 0 via `sdkmanager` (JAVA_HOME=Temurin 17); archives downloaded from `dl.google.com` |
| SDK size | `~/.local/share/android-sdk` = **5.6 GB** |

**Stage 3D — temporary env + verification (completed 2026-10-10).** Session-only exports; **no shell startup-file edits** (would require separate approval).
| Item | Value |
|---|---|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | `~/.local/share/android-sdk` |
| `JAVA_HOME` | `~/.local/share/jdks/temurin-17` |
| `PATH` additions | `$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin` |
| `adb` | 1.0.41 / 37.0.1 — resolves, server starts, `adb devices` OK (none attached) |
| `emulator -version` | 37.2.12.0 — resolves |
| `avdmanager list avd` | empty — **no AVD created/launched** (per scope) |
| `sdkmanager --version` | 1.0.16500706 (Android CLI) |
| Canonical invocation | `export ANDROID_HOME="$HOME/.local/share/android-sdk" ANDROID_SDK_ROOT="$ANDROID_HOME" JAVA_HOME="$HOME/.local/share/jdks/temurin-17"` … |

**Stage 4 — AVD create + launch (completed 2026-10-10).** No scaffold, no app deps, no source/rc edits, no commits.
| Item | Value |
|---|---|
| AVD created | `meno_api36` — `avdmanager create avd -n meno_api36 -k "system-images;android-36;google_apis;x86_64" -d pixel_6` (profile `pixel_6`, Google APIs, Android 16 "Baklava", ABI `x86_64`, 512 MB SD) |
| Acceleration | KVM v12 — `emulator -accel-check` → `accel: 0` "installed and usable"; `/dev/kvm` rw |
| Launch command | `nohup emulator -avd meno_api36 -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -memory 2048 -no-snapshot -no-metrics &` |
| Boot result | `adb wait-for-device`; `sys.boot_completed=1` (~30 s) |
| Device state | `emulator-5554  device` (online) |
| Device props | Android 16, API 36, `sdk_gphone64_x86_64`, 1080×2400 |
| Log | `/tmp/opencode/emulator.log` |

**Stage 5 — Expo app foundation scaffold (completed 2026-10-11).** Minimal foundation only: no reader, no progress/streak logic, no SQLite schema, no Bible content; **no commits created**.
| Item | Value |
|---|---|
| Scaffolder | `create-expo-app@5.0.0` → `create-expo@5.0.3` (via `npx create-expo-app@latest`) |
| Node used | fnm `v22.23.3` (npm `10.9.9`); system Node `v20.19.2` untouched |
| Engine check | `create-expo@5.0.3` `engines.node: ^22.13.0 \|\| ^24.3.0 \|\| ^26.0.0 \|\| >=27.0.0` — **satisfied** by Node 22 |
| Template | `expo-template-default@57.0.29` (`--template default --no-install --no-agents-md`) |
| SDK selected & verified | **Expo SDK 57** — installed `expo 57.0.27` (matches ADR-008; no upgrade/downgrade) |
| RN / React | `react-native 0.86.3`, `react 19.2.3` |
| Router | `expo-router 57.0.25` (routes in `src/app/`) |
| TypeScript | `typescript 6.0.3` |
| SQLite | `expo-sqlite 57.0.4` added with `npx expo install expo-sqlite` (SDK-compatible method) |
| Minimised | ran `npm run reset-project` (deleted demo `src/` + `scripts/`; created minimal `src/app/`) |
| Verification | `npx expo-doctor` → **21/21 checks passed**; `npx tsc --noEmit` → **exit 0** |
| Git | `CI=1` made create-expo skip its own `git init`; repository still has **no commits** |
| Placement note | create-expo refuses non-empty dirs (`.opencode/` is not on its tolerable list), so the app was scaffolded into a temporary subdir and moved to the repo root |

**Pending stages:** Stage 6 (Bible Reader vertical slice — **not started; requires approval**). AVD `meno_api36` is running on `emulator-5554`. Optional later: persistent env wiring (rc edit — not approved).

## 3. Logical architecture (layered)

```
┌─────────────────────────────────────────────┐
│  UI layer (Expo Router screens + components) │
│  app/ routes, presentation, design tokens    │
└───────────────▲─────────────────────────────┘
                │ calls (typed interfaces only)
┌───────────────┴─────────────────────────────┐
│  Domain layer (pure TypeScript)              │
│  entities, business rules (BR-1..BR-6),      │
│  streak/progress calculations                │
└───────────────▲─────────────────────────────┘
                │ repository interfaces
┌───────────────┴─────────────────────────────┐
│  Repository layer                            │
│  BibleRepository, ProgressRepository         │
└───────────────▲─────────────────────────────┘
                │ SQL / queries
┌───────────────┴─────────────────────────────┐
│  Persistence (expo-sqlite) + bundled content │
│  MenoDatabase, migrations, seed dataset      │
└─────────────────────────────────────────────┘
```

**Rule:** domain logic must not import React, Expo, or the database. It receives plain data and returns plain data, so it can be unit-tested with no device.

## 4. Project structure

**Scaffolded foundation (Expo SDK 57 default template, 2026-10-11):**
```
src/
  app/                    # Expo Router routes (SDK 57 default location)
    _layout.tsx           # root Stack navigator
    index.tsx             # placeholder screen (to be replaced)
assets/                   # template icons/splash (expo.icon, images/)
app.json                  # Expo config (name "Meno", slug/scheme "meno")
package.json              # deps incl. expo-sqlite; main: expo-router/entry
tsconfig.json             # strict; @/* -> ./src/*, @/assets/* -> ./assets/*
.gitignore  .vscode/      # template-provided
```

**Planned additions (not yet created):**
```
src/
  app/(tabs)/             # Reader entry, Progress/stats
  app/reader/[book]/[chapter].tsx
  domain/                 # pure rules: streak.ts, progress.ts, navigation.ts
  repositories/           # BibleRepository, ProgressRepository interfaces
  data/                   # expo-sqlite implementation, migrations, seed
  components/ui/          # shared presentational components
  theme/                  # design tokens (see DESIGN_SYSTEM.md)
assets/bible/             # bundled public-domain translation JSON
docs/                     # this documentation set
```

> **Verified layout note:** the SDK 57 default Expo Router template places routes in `src/app/` (not root `app/` as previously proposed). Expo Router supports this layout; non-route code stays under `src/`.

## 5. Data flow (examples)

1. **Open chapter:** route param `(book, chapter)` → `BibleRepository.getChapter()` → bundled dataset/SQLite → UI renders verses via a virtualized list.
2. **Complete chapter:** user action → `ProgressRepository.recordCompletion()` → domain applies BR-1 (idempotent insert) → SQLite upsert → stats recomputed by domain from stored records.
3. **Restart app:** `ProgressRepository.getProgressState()` → reader restores last-read location (FR-5/AC-1.6).

## 6. Bible content pipeline (planned, blocked by licensing)

1. Decide translation (**[Open Question — blocking]**).
2. Obtain a licence-compatible source (public-domain text, or a licenced API/download).
3. Convert to a normalised JSON shape matching the data model.
4. Store under `assets/bible/<translation>.json`; record provenance and attribution.
5. Seed into SQLite on first launch, or read directly from the bundled asset.

> Meno will **not** fabricate, paraphrase, or scrape ambiguous sources. Attribution and licence text are stored with the dataset.

## 7. Architecture Decision Records (ADR log)

| ID | Decision | Status | Notes |
|---|---|---|---|
| ADR-001 | Use Expo (managed) + TypeScript | **Accepted** | Verified: Expo SDK 57 + TypeScript 6.0.3 scaffolded 2026-10-11. |
| ADR-002 | Use Expo Router for navigation | **Accepted** | Verified compatible with SDK 57 (`expo-router 57.0.25`). |
| ADR-003 | Use `expo-sqlite` for persistence | **Accepted** | Installed `expo-sqlite 57.0.4` via `npx expo install`. |
| ADR-004 | Keep domain logic framework-free | Accepted (principle) | Enables unit tests per `meno-workflow`. |
| ADR-005 | Bundle offline public-domain translation | Proposed | Blocked by translation/licence decision. |
| ADR-006 | No backend/auth for MVP | Accepted (non-goal) | Per PRD §3.2. |
| ADR-007 | Resolve Node engine mismatch before scaffolding | **Done** | Node 22.23.3 installed via fnm (Stage 1). See §2.5. |
| ADR-008 | Target Expo SDK 57 | **Accepted** | Non-breaking upgrade from 56; fixes Hermes V1 regressions. See §2.4. |
| ADR-009 | Local Android build (Android SDK Platform 36 + JDK 17) | **Accepted** | Enables on-device/emulator evidence; `/dev/kvm` available. EAS remains a fallback. |

## 8. Risk register

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-1 | Node 20 incompatible with Expo tooling | Cannot scaffold | **Mitigated (ADR-007):** upgrade to Node ≥ 22.13.0. |
| R-2 | Bible translation licence unclear | Cannot ship content | Choose public-domain translation; record attribution. |
| R-3 | Copyrighted translation used without permission | Legal/academic integrity | Restrict to public-domain set until licence obtained. |
| R-4 | Long chapters cause list jank | Poor UX | Virtualized list + memoized rows (`ui-ux-pro-max` guidance). |
| R-5 | Streak timezone bugs | Wrong stats | Document day-boundary rule; unit-test boundaries. |
| R-6 | Scope creep across 12 meetings | Unfinished MVP | Follow `12_MEETING_PLAN.md`; approve new deps first. |
| R-7 | Android build/JDK mismatch | Build failure | Validate Gradle/JDK before native build. |

## 9. Testing strategy (planned)

- **Domain unit tests** (Jest) for BR-1..BR-6 — the primary evidence of correctness.
- **Repository tests** against an in-memory/temp SQLite database for persistence behaviour.
- **Manual device checks** for reader performance, safe areas, and accessibility.
- Actual commands and outputs to be recorded in `docs/TESTING.md` when run.

## 10. Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-10-10 | Initial architecture draft; stack compatibility assessed; no code created. |
| 0.2.0 | 2026-10-10 | Recorded decision: Expo SDK 57 + local Android build (ADR-008/009). Corrected Node finding (SDK 56 also needs ≥ 20.19.4). Documented SDK 56-vs-57 comparison (§2.4). No installs performed. |
| 0.2.1 | 2026-10-10 | Stage 1 executed: fnm 1.39.0 + Node 22.23.3 (npm 10.9.9); system Node untouched; no sudo/rc edits. Setup log added (§2.5); ADR-007 marked Done. |
| 0.2.2 | 2026-10-10 | Stage 2 executed: user-local Temurin JDK 17.0.20.1 (`~/.local/share/jdks/temurin-17`), sha256 verified; system JRE-only 17 unchanged; no sudo/rc edits. §2.5 updated. |
| 0.2.3 | 2026-10-10 | Stage 3A executed: Android Command-line Tools `commandlinetools-linux-16111833_latest.zip` downloaded and verified (sha1 OK, `unzip -t` OK) into `/tmp/opencode/android/`; not installed; `ANDROID_HOME`/`PATH` unchanged. §2.5 updated. |
| 0.2.4 | 2026-10-10 | Stage 3B executed: cmdline-tools extracted to `~/.local/share/android-sdk/cmdline-tools/latest`; package inventory inspected via `sdkmanager --list` (platform-tools 37.0.1, platform 36, build-tools 36.x, emulator 37.2.12, API 36 x86_64 images). No packages installed; no licenses accepted; `ANDROID_HOME` unset. §2.5 updated. |
| 0.2.5 | 2026-10-10 | Stage 3C executed: after student accepted `android-sdk-license`, installed platform-tools 37.0.1, platforms;android-36, build-tools;36.0.0, emulator 37.2.12, system-images;android-36;google_apis;x86_64 into `~/.local/share/android-sdk` (5.6 GB). `ANDROID_HOME` still unset. §2.5 updated. |
| 0.2.6 | 2026-10-10 | Stage 3D executed: session-only env verified (`adb` 37.0.1, `emulator` 37.2.12.0, `sdkmanager` 1.0.16500706, no AVDs); no shell startup-file edits. §2.5 updated. |
| 0.2.7 | 2026-10-10 | Stage 4 executed: AVD `meno_api36` created (pixel_6, google_apis/x86_64, API 36) with KVM accel; emulator launched headless, booted (`sys.boot_completed=1`). Running as `emulator-5554`. No scaffold/deps/rc/commits. §2.5 updated. |
| 0.2.8 | 2026-10-11 | Stage 5 executed: scaffolded minimal Expo **SDK 57** app (`expo-template-default@57.0.29`) with `create-expo@5.0.3` under fnm Node 22.23.3; installed deps (`expo 57.0.27`, `react-native 0.86.3`, `react 19.2.3`, `typescript 6.0.3`); added `expo-sqlite 57.0.4` via `npx expo install`; ran `reset-project`. Verified: `expo-doctor` 21/21 passed, `tsc --noEmit` exit 0. No commits created. §1, §2.5, §4, §7 updated. |
