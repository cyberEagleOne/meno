# Meno — Testing

| Field | Value |
|---|---|
| Document status | Living record of **actual** test runs — update on every Verify phase |
| Last updated | 2026-11-27 |
| Environment | Node **v22.23.3** via fnm (`fnm exec --using=22`), jest **29.7.0**, jest-expo **~57.0.6**. The system Node v20.19.2 cannot load `node:sqlite`, so the disk-SQLite suite must run under fnm's Node 22. |

> Evidence policy: historical results below retain their original dates. The latest
> captured local run is the 2026-11-26 output in
> `docs/evidence/P11/unit-tests-restored.txt`; the latest GitHub Actions run is
> separately linked below. A successful CI job and a local pass count describe
> different environments.

Related: [`../HowToRun.md`](../HowToRun.md) (setup/run),
[`../checklist_mvp.md`](../checklist_mvp.md) (AC evidence map).

## 1. How to run

```bash
fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand'  # all unit tests, CI mode
fnm exec --using=22 -- npx tsc --noEmit    # typecheck
fnm exec --using=22 -- npm run lint        # eslint (expo config)
```

## 2. Test inventory (26 test files in the captured local suite)

The 2026-11-26 captured run reports **26 suites / 316 tests passed / 0 failed / 0 skipped**. Test files present in the repository are:

- `src/app/__tests__/random-chapter.test.tsx`
- `src/app/__tests__/settingsReminder.test.tsx`
- `src/app/reader/__tests__/readerCompletion.test.tsx`
- `src/components/ui/__tests__/AppLockScreen.test.tsx`
- `src/components/ui/__tests__/BadgeCard.test.tsx`
- `src/components/ui/__tests__/DailyVerseCard.test.tsx`
- `src/components/ui/__tests__/ReadingGoalForm.test.tsx`
- `src/data/__tests__/bibleBookMap.test.ts`
- `src/data/__tests__/bibleDailyVerse.test.ts`
- `src/data/__tests__/canon.test.ts`
- `src/data/__tests__/dailyVerse.test.ts`
- `src/data/__tests__/db.test.ts`
- `src/data/__tests__/dbCompletion.test.ts`
- `src/data/__tests__/goalRepository.test.ts`
- `src/data/__tests__/progressContext.test.tsx`
- `src/data/__tests__/sqlitePersistence.test.ts`
- `src/domain/__tests__/appLock.test.ts`
- `src/domain/__tests__/badges.test.ts`
- `src/domain/__tests__/bibleNavigation.test.ts`
- `src/domain/__tests__/progress.test.ts`
- `src/domain/__tests__/settingsValidation.test.ts`
- `src/services/__tests__/authService.test.ts`
- `src/services/__tests__/logger.test.ts`
- `src/services/__tests__/notificationService.test.ts`
- `src/services/__tests__/sensorService.test.ts`
- `src/utils/__tests__/formatters.test.ts`

**How the database is tested without a device:** `src/data/db.ts` issues all
SQL through an injected `SqlDriver` (`src/data/sqlDriver.ts`). Production
installs an expo-sqlite driver (`src/data/sqliteDriver.ts`) from
`ProgressProvider`. Tests install an in-memory fake
(`src/data/__tests__/support/memoryDriver.ts`) that recognises the exact
statements the app uses, mirrors `ON CONFLICT … DO UPDATE` and
`INSERT OR IGNORE` semantics (including the `reading_day` table), and
**throws on any unknown SQL**, so query drift in `db.ts` fails tests instead of
passing silently.

**Determinism note (AC-2.6 dates):** `markCompleted` receives the local day
(`YYYY-MM-DD`) as an explicit argument; tests always pass fixed day strings or
construct `Date`s with local-noon components (`new Date(2026, 9, 15, 12)`).
No test reads the real current time or depends on the host timezone.

## 3. Historical captured runs (2026-10-22)

### 3.1 Unit tests (95 cases)

Command: `npm test`

```
PASS src/data/__tests__/dailyVerse.test.ts
PASS src/domain/__tests__/badges.test.ts
PASS src/data/__tests__/canon.test.ts
PASS src/domain/__tests__/progress.test.ts
PASS src/data/__tests__/progressContext.test.tsx
PASS src/domain/__tests__/settingsValidation.test.ts
PASS src/data/__tests__/db.test.ts
PASS src/data/__tests__/dbCompletion.test.ts
PASS src/domain/__tests__/bibleNavigation.test.ts
PASS src/app/reader/__tests__/readerCompletion.test.tsx

Test Suites: 10 passed, 10 total
Tests:       95 passed, 95 total
Snapshots:   0 total
Ran all test suites.
```

### 3.2 Typecheck

Command: `fnm exec --using=22 -- npx tsc --noEmit` — exit code 0, no output (clean).

### 3.3 Lint

Command: `fnm exec --using=22 -- npm run lint` (`expo lint`) — exit code 0, no findings.

### 3.4 Bundling (Metro/Hermes)

Command: `fnm exec --using=22 -- npx expo export --platform android`

```
_expo/static/js/android/entry-9d10ded5c18c535b495af26319413509.hbc (3.1MB)
```

This verifies the Expo/Metro Android JavaScript and Hermes bundle export. It is
**not** a native APK build or APK/device test.

Web export last passed on 2026-10-15; it was not rerun on 2026-10-22.

## 4. Expo Go smoke test and remaining evidence

An Android emulator smoke test was observed in Expo Go. Home, opening a
chapter, marking completion, undoing completion, and opening Progress were
exercised. After force-stopping Expo Go and relaunching the project, completion
and progress were still present. This is an observed managed Expo Go flow; it
does not verify a standalone/native APK or SQLite rollback behavior.

- **Not verified:** native SQLite transaction rollback and real storage-failure
  recovery. Automated injected-driver failures exercise application error
  handling with a fake driver; they do not prove native SQLite rollback or
  recovery from a real device storage failure.
- **Not verified:** native APK build/install behavior, native scrolling and
  performance on a standalone build.
- **Screenshots:** historical emulator/UI and physical-device startup/reader
  captures exist under `docs/evidence/`. They do not cover a full current-build
  acceptance walkthrough. The demo video is outside this repository; submission
  has not been confirmed.
- **Not verified:** accessibility walkthrough (TalkBack, font scaling), or a
  complete live acceptance-criteria demonstration.

The database unit tests use `memoryDriver.ts`; they do not directly test native
SQLite transaction rollback. Expo Go persistence above was observed, but no
controlled storage-failure/recovery scenario was performed.

## 6. Fresh audit run (2026-11-19)

Commands run in the project workspace using Node 24.19.0:

```text
npm test -- --runInBand --silent
Test Suites: 15 passed, 15 total
Tests:       253 passed, 253 total
Time:        25.52 s

npx tsc --noEmit
exit 0, no diagnostics

npm run lint
exit 0, no findings

npx expo export --platform android
success after SDK patch alignment; Hermes bundle entry-86903f44c8c66242f9633e3b5e233280.hbc, 3.3 MB

npx expo-doctor
21/21 checks passed after SDK patch alignment

npm audit
6 findings remain: 3 high, 3 moderate, 0 critical; details in SECURITY_AUDIT.md
```

The test suite rose from 118 to 252 cases by adding per-book previous/next boundary checks for all 66 canonical books and notification permission cases. These exercise real navigation boundaries and permission transitions; they are not repeated no-op assertions. Lint and TypeScript were rerun after source changes. The 3.3 MB Expo export validates the JS bundle only. Native APK
build/install and device runtime are unverified in this environment.

An intermediate failed run (1 failed / 117 passed) occurred during the lint
cleanup after an exception binding was accidentally removed. The failing API
regression exposed the mistake; the catch was restored. A dedicated failing-
test demonstration was subsequently performed with a deliberately incorrect
expected book name in the isolated navigation test. The controlled run failed
as expected (1 failed / 153 passed in that file); the original expectation was
restored immediately. Captured output is in
`docs/evidence/testing/controlled-failure.log`. The restored suite at that checkpoint passed 252 tests after the notification permission fix; that dated suite later reached 253 after bootstrap-error coverage. No intentionally failing test remains in the source.

## 5. Latest runtime and suite update (2026-11-19)

After bootstrap-error logging coverage was added, the local suite passed **15 suites / 253 tests in 25.52 seconds**. TypeScript and lint passed. The prior controlled failure capture remains at `docs/evidence/testing/controlled-failure.log`.

The release APK from CI run 44517378110 was installed on an API 37 x86_64 AVD. It showed the SQLite bootstrap error; Logcat reported `libexpo-sqlite.so` missing for x86_64, and APK inspection found the library only in the ARM64 directory. This is packaging/runtime evidence for that x86_64 APK, not a test of SQLite on a supported ARM64 device. ARM64-only CI run 44529697756 succeeded and the APK metadata/signature were verified. Native persistence across restart on a supported phone is not verified.

## 6. Deferred by design (PRD §10 — not required to pass)

Correction to the runtime update above: ARM64-only CI run 44529697756 succeeded. The produced APK targets `arm64-v8a` and includes the matching Expo SQLite JNI library; its signature was verified. It was later installed and started on a connected Android test device (RMX2103) on 2026-11-19; see `docs/evidence/physical-android/startup-validation.md`. Feature-level physical testing remains outstanding, and the ARM64-only restriction still excludes 32-bit devices.

- Streak-boundary tests (BR-3, BR-4) — streaks deferred from the MVP.
- Reading-plan validation tests — plans out of MVP.
- Snapshot tests — not planned. UI component tests are included in the current
  suite: `src/components/ui/__tests__/DailyVerseCard.test.tsx`,
  `src/components/ui/__tests__/ReadingGoalForm.test.tsx`, and
  `src/app/reader/__tests__/readerCompletion.test.tsx`. They use mocked
  repositories and cover navigation visibility, form behavior, and reader
  completion flows.

## 7. Historical Milestone 2 verification (2026-11-23)

Issue #14 hardening was verified with the documented Node 22 toolchain. Captured
results:

```text
fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand --silent'
Test Suites: 19 passed, 19 total
Tests:       306 passed, 306 total
Snapshots:   0 total

fnm exec --using=22 -- npx tsc --noEmit
exit 0, no diagnostics

fnm exec --using=22 -- npm run lint
exit 0, no findings

git diff --check
exit 0, no whitespace errors
```

Environment caveat: the system interpreter is Node v20.19.2, which predates
`node:sqlite`. Running `npm test` or `npm run lint` with that interpreter makes
`src/data/__tests__/sqlitePersistence.test.ts` fail to load and raises an
`import/no-unresolved` lint error for the same module. Under Node 22.23.3
(fnm) all 19 suites and 306 tests pass and lint is clean. This is an
environment constraint, not a code regression.

Historical baseline provenance: the committed baseline at that checkpoint was
**277 tests / 18 suites** at `00fdae2`. The then-uncommitted changes added 29
tests to reach 306. Those are dated historical counts, not current worktree
status. The latest captured run is documented in §8. The figure 281 has no
documented or Git-verifiable test-count source and is not used.


## 8. Latest captured local and hosted verification (2026-11-26)

The captured local result in `docs/evidence/P11/unit-tests-restored.txt` is **26 suites / 316 passed / 0 failed / 0 skipped** (`npm test -- --runInBand --silent`, Node 22). The controlled failure and recovery captures are indexed in `docs/P11_P12_EVIDENCE_GUIDE.md`. TypeScript, lint, and `git diff --check` results are documented in the P11 audit snapshot; they were not rerun as part of this documentation review.

The latest live Actions run checked during this review is [45860247144](https://github.com/cyberEagleOne/meno/actions/runs/45860247144), on `master` at `6a174c56445dbdf1117fd5aeb3748a84b8526b37`, conclusion **success**. Unit Tests, Type check, and Lint succeeded. Android bundle export, native project generation, JDK setup, APK build, and artifact upload were **skipped** because the ILT3 database is not present in the public checkout. Therefore this run did not build an APK and did not deploy the app. The current CI summary does not independently expose the exact Jest case count in the inspected run metadata; do not infer the local 316 count as its CI count.

The ILT3-dependent app runtime requires an authorized local database copy. The test suite's database coverage uses both injected in-memory drivers and Node's disk SQLite; neither by itself establishes native Android SQLite behavior.
