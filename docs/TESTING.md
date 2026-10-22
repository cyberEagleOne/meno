# Meno — Testing

| Field | Value |
|---|---|
| Document status | Living record of **actual** test runs — update on every Verify phase |
| Last updated | 2026-10-22 |
| Environment | Node **v22.23.3** via fnm (`fnm exec --using=22`), jest **29.7.0**, jest-expo **~57.0.5** |

> Evidence policy: every result below was produced by running the printed
> command and copying its real output. Nothing here is paraphrased or
> remembered. No test is claimed to pass unless it appears in a captured run.

Related: [`../HowToRun.md`](../HowToRun.md) (setup/run),
[`../checklist_mvp.md`](../checklist_mvp.md) (AC evidence map).

## 1. How to run

```bash
fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand'  # all unit tests, CI mode
fnm exec --using=22 -- npx tsc --noEmit    # typecheck
fnm exec --using=22 -- npm run lint        # eslint (expo config)
```

## 2. Test inventory (7 files, 73 cases)

| File | Cases | What it verifies |
|---|---|---|
| `src/domain/__tests__/bibleNavigation.test.ts` | 22 | Book/chapter lookup, prev/next within book, cross-book boundaries (Maleakhi 4 → Matius 1), `null` at canon ends, unknown locations, empty-chapter boundaries, dataset invariants |
| `src/domain/__tests__/progress.test.ts` | 21 | `withCompletion` idempotency (same/different day), unmark, `completedCount` / `doneInBook`, milestone thresholds, `sanitizeProgress` (valid / invalid / corrupt / reading-day validation), `localDayKey` (local-date formatting, padding, local-vs-UTC), `isValidReadingDay`, `withReadingDay` (AC-2.6 day idempotency + ordering), `restoreScrollOffset` (reader scroll-restoration decision: match → offset, mismatch/missing → wait, zero/NaN → 0) |
| `src/app/reader/__tests__/readerCompletion.test.tsx` | 3 | Reader completion behavior: success feedback waits for the write, duplicate taps are suppressed while pending, and failed writes show/re-scope a retry action |
| `src/data/__tests__/db.test.ts` | 7 | Persistence API behavior using the injected in-memory driver: schema initialization, empty state, last-read round-trip, simulated restart, corrupt-row filtering, and missing-driver failure |
| `src/data/__tests__/dbCompletion.test.ts` | 11 | Completion/day writes through the injected in-memory driver: idempotency, multi-day history, undo semantics, simulated restart, and injected write failures |
| `src/data/__tests__/canon.test.ts` | 7 | Testament split at 39/40, canonical totals (66 books, 1189 chapters; PL 39/929, PB 27/260), unique sequential ids, `getBookById`, `booksByTestament`, `isValidChapter` bounds, `chapterKey` |
| `src/data/__tests__/progressContext.test.tsx` | 2 | Injected write failures during completion/undo leave context consistent, and a later successful retry updates state |

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

## 3. Captured runs (2026-10-22)

### 3.1 Unit tests (73 cases)

Command: `fnm exec --using=22 -- bash -c 'CI=1 npm test -- --runInBand'`

```
PASS src/app/reader/__tests__/readerCompletion.test.tsx
PASS src/domain/__tests__/progress.test.ts
PASS src/domain/__tests__/bibleNavigation.test.ts
PASS src/data/__tests__/dbCompletion.test.ts
PASS src/data/__tests__/progressContext.test.tsx
PASS src/data/__tests__/canon.test.ts
PASS src/data/__tests__/db.test.ts

Test Suites: 7 passed, 7 total
Tests:       73 passed, 73 total
Snapshots:   0 total
Time:        3.199 s
Ran all test suites.
```

The 73-case total includes the reader completion and progress-provider suites,
which were added after the earlier 66-case run.

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
- **Not captured in this repository:** screenshots. The demo video is stored
  outside the repository; submission of that video has not been confirmed.
- **Not verified:** accessibility walkthrough (TalkBack, font scaling), or a
  complete live acceptance-criteria demonstration.

The database unit tests use `memoryDriver.ts`; they do not directly test native
SQLite transaction rollback. Expo Go persistence above was observed, but no
controlled storage-failure/recovery scenario was performed.

## 5. Deferred by design (PRD §10 — not required to pass)

- Streak-boundary tests (BR-3, BR-4) — streaks deferred from the MVP.
- Reading-plan validation tests — plans out of MVP.
- UI component tests and snapshot tests — not planned for the MVP; the domain
  and data layers carry the automated coverage.
