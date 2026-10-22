# Meno — Architecture

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.3.3 (implementation and verification sync) |
| Last updated | 2026-10-22 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |

> Evidence policy: §2 records the 2026-10-10/11 toolchain validation and scaffold (Stages 1–5, verbatim logs). This document describes the current working-tree implementation. Current host verification is **7 suites / 73 tests**, with TypeScript, lint, and Android Expo bundle export passing (`docs/TESTING.md`). An Expo Go emulator smoke test observed selected UI flows and completion/progress persistence after force-stop/relaunch; it does not verify native APK behavior, native SQLite rollback, or real storage-failure recovery. Historical stage logs are not rewritten.

---

## 1. Stack (validated in Stage 5)

| Layer | Choice | Status |
|---|---|---|
| Language | TypeScript | **Verified** — `typescript 6.0.3` |
| Framework | React Native via Expo | **Verified** — Expo SDK 57 (`expo 57.0.27`, `react-native 0.86.3`, `react 19.2.3`) |
| Navigation | Expo Router (file-based) | **Verified** — `expo-router 57.0.25` |
| Local database | Expo SQLite (`expo-sqlite`) | **Verified compatible / installed** — `expo-sqlite 57.0.4`; schema + driver seam implemented (see §3.1) |
| Unit testing | Jest + `jest-expo` | **Verified** — jest 29.7.0; 7 suites / 73 tests passing (2026-10-22, `docs/TESTING.md`) |

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
| Python | 3.13.5 | Originally satisfies `ui-ux-pro-max` requirement (skill removed from the working tree 2026-10-15 for licensing review; Python retained). |
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

**Stage 6–7 — MVP implementation (working tree, uncommitted).** The Bible Reader vertical slice committed earlier (`c2bb19d`) was extended with the two-tab shell, design system, and persistent-progress feature (Expo SQLite behind a driver seam), plus tests. Current verification is recorded in `docs/TESTING.md`; emulator observations are Expo Go only. Optional later: persistent env wiring (rc edit — not approved).

## 3. Logical architecture (as implemented)

```
┌──────────────────────────────────────────────────────────┐
│ UI layer — Expo Router screens + shared components        │
│ src/app (routes) + src/components/ui + theme tokens        │
│ (src/theme/colors.ts; no ad-hoc colours)                   │
└───────────────▲──────────────────────────────────────────┘
                │ hooks (useProgress) — typed context API
┌───────────────┴──────────────────────────────────────────┐
│ State/bootstrap layer — ProgressProvider                   │
│ src/data/progressContext.tsx: installs the SQLite driver,  │
│ runs initProgressDb() once, loads progress, exposes        │
│ openChapter / saveScroll / setCompleted                    │
└───────────────▲──────────────────────────────────────────┘
                │ plain function calls (no React imports)
┌───────────────┴──────────────────────────────────────────┐
│ Domain layer — pure TypeScript                             │
│ src/domain/bibleNavigation.ts (prev/next, canon edges)     │
│ src/domain/progress.ts (BR-1 idempotency, counts,          │
│ milestones, sanitizeProgress)                              │
└───────────────▲──────────────────────────────────────────┘
                │ persistence functions (no SQL in domain)
┌───────────────┴──────────────────────────────────────────┐
│ Data layer — src/data/db.ts                                │
│ initProgressDb / loadProgress / saveLastRead /             │
│ markCompleted / unmarkCompleted; placeholderBible dataset  │
└───────────────▲──────────────────────────────────────────┘
                │ SqlDriver interface (src/data/sqlDriver.ts)
┌───────────────┴──────────────────────────────────────────┐
│ Driver implementations                                     │
│ sqliteDriver.ts → expo-sqlite (production)                 │
│ __tests__/support/memoryDriver.ts → in-memory fake (tests) │
└──────────────────────────────────────────────────────────┘
```

**Rules (as implemented):**
- Domain modules import neither React, Expo, nor the database — unit-tested with no device (ADR-004; seven Jest suites currently pass on the host).
- All SQL is issued through the injected `SqlDriver`; `db.ts` never imports `expo-sqlite` directly, and tests never touch the native module (ADR-010).
- Streak calculation is **not** part of the domain: streaks are deferred per PRD §8 (BR-3/BR-4) and §10. No `streak.ts` exists.
- There is **no repository layer**; earlier drafts that named `BibleRepository`/`ProgressRepository` were plans that were not implemented and have been removed from this document.

### 3.1 Persistence: schema and driver seam

- **Driver interface** (`src/data/sqlDriver.ts`): `exec` / `getFirst` / `getAll` / `run`, plus `setSqlDriver` / `getSqlDriver` module registry.
- **Production driver** (`src/data/sqliteDriver.ts`): wraps one lazily-opened `expo-sqlite` database (`meno.db`).
- **Bootstrap** (`src/data/progressContext.tsx`): on first load, `ProgressProvider` installs the expo-sqlite driver, then awaits `initProgressDb()`, then `loadProgress()`. Retry re-runs the sequence if bootstrap failed (idempotent).
- **Schema** (created in `initProgressDb`, WAL mode):
  - `last_read(id INTEGER PRIMARY KEY CHECK (id=1), book_id, chapter, scroll_y, opened_at)` — single-row last-read + scroll position.
  - `completed(book_id, chapter, completed_at, PRIMARY KEY (book_id, chapter))` — one row per chapter; the primary key enforces BR-1 idempotency (`ON CONFLICT … DO UPDATE` refreshes the timestamp only). *Date caveat:* the overwrite means the table alone cannot answer "which days did this chapter get completed on".
  - `reading_day(day TEXT PRIMARY KEY)` — append-only history of device-local calendar days (`YYYY-MM-DD`, BR-2) with ≥1 explicit completion (FR-9, AC-2.6). Written with `INSERT OR IGNORE` on every `markCompleted`, so same-day completions collapse to one row while completions on later days keep adding rows — this is what makes the distinct-days count survive the `completed` timestamp overwrite. **Deliberate decisions:** (a) undoing a chapter does **not** delete its day — reading days are historical facts, not a live projection of `completed`; (b) no backfill: rows written before this table existed contribute only their *latest* `completed_at`, and inferring a local day from a stored UTC instant would be timezone-fragile, so pre-existing installs simply start counting from the first completion after the upgrade. This is an **additive** migration (`CREATE TABLE IF NOT EXISTS`); existing tables are untouched.
- **Validation:** `loadProgress` always passes stored rows through domain `sanitizeProgress`, so stale/corrupt rows never surface in the UI. Reading days are validated as plain `YYYY-MM-DD` strings, deduplicated, and sorted; entries with any other format are dropped.
- **Test injection:** tests call `setSqlDriver(createMemoryDriver())`; the fake recognises the exact statements `db.ts` issues and throws on any unknown SQL, so query drift fails tests (see `docs/TESTING.md` §2).

## 4. Project structure (as implemented, working tree)

```
src/app/
  _layout.tsx                 # root Stack; font loading; mounts ProgressProvider
  (tabs)/
    _layout.tsx               # Tabs with custom MenoTabBar; library + chapters hidden (href: null)
    index.tsx                 # Baca home: last-read resume, milestone nudge, continue CTA
    library.tsx               # book list, search, PL/PB sections, per-book rings
    chapters/[book].tsx       # chapter grid + legend + done counts
    progress.tsx              # Kemajuan: totals, distinct reading days, milestones path, per-testament bars, started books
  reader/[book]/[chapter].tsx # reader (outside tabs): banner, FlatList verses, footer nav
src/data/
  db.ts                       # persistence API (schema in §3.1)
  sqlDriver.ts                # SqlDriver interface + registry
  sqliteDriver.ts             # expo-sqlite driver
  progressContext.tsx         # ProgressProvider / useProgress
  placeholderBible.ts         # synthetic labelled dataset (66 books, 1189 chapters)
  canon.ts                    # testament helpers, totals, isValidChapter, chapterKey
  __tests__/                  # db, dbCompletion, canon tests + support/memoryDriver.ts
src/domain/
  bibleNavigation.ts          # getBook/getChapter/nextChapter/previousChapter
  progress.ts                 # withCompletion, localDayKey/reading days, counts, milestones, sanitizeProgress
  types.ts                    # Bible/Book/Chapter/Verse types
src/theme/colors.ts           # palette, fonts, radius, space tokens
src/components/ui/            # Button, Card, ChapterCell, Chip, Icons (react-native-svg),
                              # Mascot, PlaceholderBanner, ProgressBar, ProgressRing,
                              # ScreenHeader, StateMessage, VerseRow
assets/meno/                  # 8 mascot PNGs (Calm, Celebrating, Curious, Encouraging,
                              # Happy, Proud, ReadyToRead, Welcome)
metro.config.js               # adds "wasm" to assetExts (expo-sqlite on web)
```

> Note: this layout exists as **uncommitted working-tree changes** as of 2026-10-15; the committed tree (`c2bb19d`) still contains the earlier single-route reader slice.

## 5. Data flow (as implemented)

1. **Open a chapter (Baca → library → chapters → reader):** Expo Router passes `(book, chapter)` params → reader validates with `isValidChapter` (`src/data/canon.ts`) and reads verses from the bundled `placeholderBible` dataset → renders a virtualized `FlatList` of `VerseRow`s. `useProgress().openChapter(bookId, chapter)` updates **last-read only** (BR-5) via `saveLastRead` → single-row SQL upsert. Opening never completes a chapter.
2. **Scroll persistence:** the reader debounces scroll callbacks (500 ms) and calls `saveScroll`, which updates `last_read.scroll_y` for the current chapter only (ignored if last-read has since changed).
3. **Mark a chapter complete:** footer action → `setCompleted(bookId, chapter, true)` → domain `withCompletion` (idempotent map update) + `withReadingDay` (day added once to the in-memory list) + `markCompleted(bookId, chapter, completedAt, day)` → `INSERT … ON CONFLICT(book_id, chapter) DO UPDATE` (one row per chapter, BR-1) followed by `INSERT OR IGNORE INTO reading_day` (one row per local day, AC-2.6). The `day` argument is computed by domain `localDayKey(now)` — device-local calendar date, BR-2 — and passed in explicitly so tests never depend on the real clock or timezone. Explicit unmark deletes the chapter row but leaves the reading day (historical).
4. **Restart / first launch:** `ProgressProvider` effect → `createExpoSqliteDriver()` → `setSqlDriver` → `initProgressDb()` (WAL + `CREATE TABLE IF NOT EXISTS`) → `loadProgress()` → row mapping + `sanitizeProgress` → context state (`status: loading → ready|error`). Expo Go smoke testing observed completion/progress persistence after force-stop/relaunch; last-read restoration was not separately verified in that walkthrough.
5. **Kemajuan stats:** computed on each render from the context state — `completedCount` (total), `nextMilestone`, per-testament `doneInBook` vs `TESTAMENT_TOTALS`, started-books list, and **distinct reading days** (`readingDays.length`, PRD FR-9 / AC-2.6), shown in both the filled state ("X hari membaca" pill under the cheer row) and the empty state (explicit "0 hari membaca" line). PRD §10 still defers the daily-goal model; the day count is a pure historical total, not a goal or streak.

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
| ADR-010 | Persistence goes through an injectable `SqlDriver` seam | **Accepted (implemented, working tree 2026-10-14/15)** | `db.ts` never imports `expo-sqlite`; production driver in `sqliteDriver.ts`, tests inject `memoryDriver.ts`. Recorded here because the implementation exists and is host-verified (66 tests); not a retroactive claim about earlier stages. |
| ADR-011 | Ship only a clearly-labelled synthetic placeholder dataset until licensing is resolved | **Accepted (implemented, working tree 2026-10-14/15)** | 66 books / 1189 chapters of canon metadata with synthetic verses; every verse text carries a "not Scripture" marker, guarded by `bibleNavigation.test.ts`. Real translation still blocked by ADR-005. |
| ADR-012 | Two-tab shell (Baca, Kemajuan); reader pushed outside the tab navigator | **Accepted (implemented, working tree 2026-10-14/15)** | Matches PRD §6 navigation scope; library/chapters routes hidden from the tab bar (`href: null`). |
| ADR-013 | Adopt the design-handoff token set and mascot artwork as the visual identity | **Accepted (implemented, working tree 2026-10-14/15)** | Tokens in `src/theme/colors.ts`; Plus Jakarta Sans via `@expo-google-fonts`; 8 mascot PNGs in `assets/meno/`. Provenance and superseded earlier proposals recorded in `docs/DESIGN_SYSTEM.md`. |

> ADR-010…ADR-013 document decisions **as they exist in the implemented working tree** (dates 2026-10-14/15). They were not separate historical decision meetings; they are recorded now so the documentation matches the code. All remain **uncommitted** pending student review.

## 8. Risk register

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-1 | Node 20 incompatible with Expo tooling | Cannot scaffold | **Mitigated (ADR-007):** upgrade to Node ≥ 22.13.0. |
| R-2 | Bible translation licence unclear | Cannot ship content | Choose public-domain translation; record attribution. |
| R-3 | Copyrighted translation used without permission | Legal/academic integrity | Restrict to public-domain set until licence obtained. |
| R-4 | Long chapters cause list jank | Poor UX | Virtualized list + memoized rows (`ui-ux-pro-max` guidance). |
| R-5 | Streak timezone bugs | Wrong stats | **[Deferred]** streaks are out of MVP scope (PRD §8 BR-3/BR-4, §10); no streak code exists. Revisit only if the lecturer requires streaks (unresolved RQ-6 conflict — `docs/ASSIGNMENT_TRACEABILITY.md`). |
| R-6 | Scope creep across 12 meetings | Unfinished MVP | Follow `12_MEETING_PLAN.md`; approve new deps first. |
| R-7 | Android build/JDK mismatch | Build failure | Validate Gradle/JDK before native build. |

## 9. Testing strategy (as implemented)

- **Domain unit tests** (Jest, host): `bibleNavigation.test.ts` (22), `progress.test.ts` (21 — incl. `localDayKey` / reading-day helpers).
- **Data-layer tests via the `SqlDriver` seam** (Jest, host, no device): `db.test.ts` (7), `dbCompletion.test.ts` (11), `canon.test.ts` (7), and `progressContext.test.tsx` (2). The completion suite uses the injected memory driver; it does not directly verify native SQLite rollback.
- **Observed Expo Go smoke checks:** Home, chapter open, completion/undo, Progress, and completion/progress after force-stop/relaunch. This is not a native APK test.
- **Not verified:** native SQLite rollback, real storage-failure recovery, native APK behavior, reader performance, TalkBack, and a complete live acceptance-criteria walkthrough.
- Commands and verbatim outputs: `docs/TESTING.md`. MVP acceptance-criteria mapping: `checklist_mvp.md` (repo root).

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
| 0.3.0 | 2026-10-15 | Rewrote §3–§5 to describe the **actual implemented** architecture (route tree, ProgressProvider bootstrap, `db.ts` API, `SqlDriver` seam, real data flows); removed nonexistent repository layer, `streak.ts`, and placeholder-`index.tsx` references; added ADR-010…ADR-013 (recorded against the working-tree implementation, not retroactive); annotated R-5 as deferred; updated §9 testing strategy and §1 evidence policy. §1–2 stage logs left intact as history. |
| 0.3.1 | 2026-10-15 | Implemented AC-2.6 / FR-9 distinct reading days: additive `reading_day` table (§3.1), `markCompleted` day parameter, domain `localDayKey` / `withReadingDay`, "X hari membaca" stat on Kemajuan (filled + zero state). Recorded the completed-timestamp-overwrite caveat and the two deliberate semantics (no undo deletion, no historical backfill). Tests 53 → 62. |
| 0.3.2 | 2026-10-15 | Reader virtualization + scroll restoration (AC-1.5, AC-1.6 device half): `reader/[book]/[chapter].tsx` now renders verses through a virtualized `FlatList` (header/footer slots, per-verse dashed-border wrapper) instead of a full-chapter `ScrollView` + `map`; `VerseRow` is reused and restyled to the implemented theme; scroll restoration is keyed per chapter (`readyKey` layout-event gate + `restoredForKey` latch) with the pure decision helper `restoreScrollOffset` in `src/domain/progress.ts`. Tests 62 → **66** (four `restoreScrollOffset` cases in `progress.test.ts` 17 → 21). Native scrolling and on-device restoration remain **NOT YET VERIFIED**. |
| 0.3.3 | 2026-10-22 | Current verification and smoke-test status synced: seven suites / 73 tests; TypeScript, lint, and Android Expo bundle export pass; limited Expo Go emulator flow observed. Clarified that this is not native APK testing and does not verify native SQLite rollback or real storage-failure recovery. |
