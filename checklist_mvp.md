# Meno — MVP Acceptance-Criteria Checklist

One entry per acceptance criterion in `docs/PRD.md` §6 (26 checklist rows
covering 24 distinct AC IDs; AC-2.4 is deferred). **Evidence-based only** — a
criterion is never marked passed because the app merely builds or the tests
merely exist.

| Legend | Meaning |
|---|---|
| **VERIFIED (automated)** | Covered by a passing test in the captured 2026-10-22 run (`docs/TESTING.md` §3.1). |
| **PARTIAL** | Automated host coverage exists for the underlying rule, but the on-device/UI half of the criterion is **NOT YET VERIFIED**. |
| **OBSERVED (Expo Go)** | Directly observed in the Android emulator Expo Go smoke test; this does not mean native APK behavior was tested. |
| **NOT YET VERIFIED** | Implemented (or believed implemented) but **no captured evidence** exists. |
| **DEFERRED** | Explicitly out of MVP scope per `docs/PRD.md` §10. |

> **Evidence note:** A limited Android emulator Expo Go smoke test was observed:
> Home, chapter open, completion/undo, Progress, and completion/progress still
> present after force-stop/relaunch. This was not a full acceptance-criteria
> walkthrough. Screenshots are not in the repository; the demo video is outside
> the repository and submission is unconfirmed. Native APK behavior, native
> SQLite rollback, and real storage-failure recovery remain unverified.

## Feature 1 — Bible Reader

| AC | Criterion (summary) | Type | Status | Evidence / gap |
|---|---|---|---|---|
| AC-1.1 | Book list for the (single) translation is displayed | Manual device | **NOT YET VERIFIED** | Implemented: `src/app/(tabs)/library.tsx`. No screenshot/walkthrough captured. |
| AC-1.2 | Selecting a book + chapter renders all verses in canonical order | Manual + dataset rule | **PARTIAL** | Canonical ordering guarded on host: `src/data/__tests__/canon.test.ts` (sequential `canonicalOrder`, unique ids) and dataset invariants in `bibleNavigation.test.ts`. Verse rendering itself **NOT YET VERIFIED** on device. |
| AC-1.3 | "Next" at a book's last chapter steps to the next book; disabled at the Bible's final chapter | Automated rule + manual UI | **PARTIAL** | Host-verified: `bibleNavigation.test.ts` cross-book boundary and `null`-at-canon-end cases (part of the 73/73 run, 2026-10-22). UI disabled-state of the footer button **NOT YET VERIFIED** on device. |
| AC-1.4 | "Previous" disabled at Genesis 1 (no crash, no negative navigation) | Automated rule + manual UI | **PARTIAL** | Host-verified: `bibleNavigation.test.ts` first-chapter/`null` cases. UI disabled-state **NOT YET VERIFIED** on device. |
| AC-1.5 | Long chapters stay scroll-performant via virtualization | Manual device | **NOT YET VERIFIED** | Implemented with `FlatList` + memoized `VerseRow` in `src/app/reader/[book]/[chapter].tsx`. No performance measurement captured. |
| AC-1.6 | App closed/reopened → reader returns to last-read book/chapter | Automated (simulated) + device restart | **PARTIAL** | Host-verified simulated restart: `src/data/__tests__/db.test.ts` ("state written before a simulated restart is still readable"). **Real device kill/relaunch NOT YET VERIFIED** (TESTING.md §4, RQ-4). |
| AC-1.7 | Shell shows exactly two tabs (Baca, Kemajuan) and no others | Manual device | **NOT YET VERIFIED** | Implemented: `src/app/(tabs)/_layout.tsx` (custom `MenoTabBar`; `library` and `chapters/[book]` registered with `href: null`). Not observed on device. |
| AC-1.7a | Android Back from the reader returns to the originating screen | Manual device | **NOT YET VERIFIED** | Implemented via Expo Router stack structure (reader outside the tab group). Not exercised on device. |
| AC-1.7b | Prev/next replaces the reader route (no back-stack growth) | Manual device | **NOT YET VERIFIED** | Implemented (router replace in the reader). Not exercised on device. |

## Feature 1 (continued) — US-3: Finding a book to read (`docs/PRD.md` §6.3)

| AC | Criterion (summary) | Type | Status | Evidence / gap |
|---|---|---|---|---|
| AC-3.1 | Book list grouped by testament (PL/PB); each row shows the book name and its completed-chapter count | Manual device | **NOT YET VERIFIED** | Implemented in `src/app/(tabs)/library.tsx` (PL/PB section headers; per-row `N selesai` via `doneInBook`). UI-only; no screenshot/walkthrough captured. |
| AC-3.2 | A search term filters the book list to matching names, still grouped by testament | Manual device | **NOT YET VERIFIED** | Implemented in `src/app/(tabs)/library.tsx` (query filter over PL/PB sections). UI-only; no captured evidence. |
| AC-3.3 | A search matching no book shows an explanatory empty state with a way to clear the search; no crash | Manual device | **NOT YET VERIFIED** | Implemented in `src/app/(tabs)/library.tsx` ("Tidak ada kitab yang cocok…" + "Hapus pencarian"). UI-only; no captured evidence. |

## Feature 1 (continued) — US-4: Reading a chapter and marking it done (`docs/PRD.md` §6.4)

| AC | Criterion (summary) | Type | Status | Evidence / gap |
|---|---|---|---|---|
| AC-4.1 | "Tandai selesai" on an incomplete chapter records it complete and the control switches to "Batalkan penandaan" | Manual device | **OBSERVED (Expo Go)** | Completion was marked in the Android emulator Expo Go smoke test; persisted completion was still present after force-stop/relaunch. Not a native APK test. |
| AC-4.2 | "Batalkan penandaan" on a completed chapter removes it from the completed set and the control reverts to "Tandai selesai" | Manual device | **OBSERVED (Expo Go)** | Completion was undone in the Android emulator Expo Go smoke test. Not a native APK test. |
| AC-4.3 | The placeholder notice is visible so the synthetic text is not mistaken for Scripture | Manual device | **NOT YET VERIFIED** | Implemented: `PlaceholderBanner` rendered in the reader (`PLACEHOLDER_NOTICE` = "TEKS CONTOH — BUKAN KITAB SUCI"; every verse carries the `not Scripture` marker, test-guarded). On-device visibility **NOT YET VERIFIED**. |

## Feature 2 — Persistent Reading Progress

| AC | Criterion (summary) | Type | Status | Evidence / gap |
|---|---|---|---|---|
| AC-2.1 | Marking a chapter complete reflects it in the completed set | Automated + manual UI | **PARTIAL** | Host-verified data path: `dbCompletion.test.ts` (row written; `loadProgress` returns the key) and `progress.test.ts` (map update). On-device toggle **NOT YET VERIFIED**. |
| AC-2.2 | Same-day double completion is a no-op; count unchanged | Automated | **VERIFIED (automated)** | `progress.test.ts` + `dbCompletion.test.ts` (one row per chapter; idempotent repeated completion). Verified in the 73/73 run, 2026-10-22. |
| AC-2.3 | Completion records survive app restart; stats unchanged | Automated (simulated) + device restart | **PARTIAL** | Host-verified simulated restart: `db.test.ts`. Expo Go smoke test observed completion/progress still present after force-stop/relaunch. Native APK behavior, native SQLite rollback, and real storage-failure recovery remain unverified. |
| AC-2.4 | Streak boundary behaviour | — | **DEFERRED** | Out of MVP scope per PRD §8 (BR-3/BR-4) and §10. **Unresolved conflict:** `docs/ASSIGNMENT_TRACEABILITY.md` RQ-6 still lists streak tests as a requirement row — confirm with the lecturer; do not silently treat either way. |
| AC-2.5 | Empty progress shows zeros, no crash | Automated + manual UI | **PARTIAL** | Host-verified: `db.test.ts` ("an empty database loads as empty progress" → `{ lastRead: null, completed: {}, readingDays: [] }`). Kemajuan empty-state UI (incl. "0 hari membaca" line) **NOT YET VERIFIED**. |
| AC-2.6 | Chapter completed on day N and re-completed on day N+1 → chapters counted once, distinct days = two | Automated + manual UI | **PARTIAL** | Implemented 2026-10-15 via append-only `reading_day` table + `markCompleted(..., day)` (see `docs/ARCHITECTURE.md` §3.1). Host-verified: `dbCompletion.test.ts` ("completions across different days produce one row per day"; later-day re-mark keeps one completed row but two day rows) and "multiple chapters completed on one day count as exactly one reading day" / "repeated completion never doubles" for the idempotent halves. Kemajuan shows "X hari membaca" in filled + zero states; **on-device display NOT YET VERIFIED**. |
| AC-2.7 | Opening a chapter updates last-read but does **not** count as completed | Automated + manual UI | **PARTIAL** | Host-verified separation: `db.test.ts` last-read round-trip leaves `completed` empty; BR-5 documented in `src/domain/progress.ts`/`progressContext.tsx` (`openChapter` never calls `markCompleted`). On-device behaviour **NOT YET VERIFIED**. |

## Feature 2 (continued) — US-5: Seeing progress and continuing where I left off (`docs/PRD.md` §6.5)

| AC | Criterion (summary) | Type | Status | Evidence / gap |
|---|---|---|---|---|
| AC-5.1 | With ≥1 completion, the progress tab shows completed-chapter total, distinct reading days, and per-testament progress as non-negative counts | Manual device | **PARTIAL** | Progress was opened and persisted progress observed after Expo Go force-stop/relaunch. The full set of displayed totals and per-testament counts was not checked against this criterion. |
| AC-5.2 | With no completions, the progress tab shows completed chapters and reading days as 0 and an empty state; no crash | Manual device | **NOT YET VERIFIED** | Implemented in `src/app/(tabs)/progress.tsx` (zero-state card incl. "0 hari membaca"). Empty load is host-tested via AC-2.5, but the on-device empty state **NOT YET VERIFIED**. |
| AC-5.3 | With a last-read location, the home screen shows a resume affordance that navigates to that book/chapter | Manual device | **NOT YET VERIFIED** | Implemented in `src/app/(tabs)/index.tsx` ("Lanjutkan membaca" → reader). Last-read persistence is host-tested via AC-1.6/AC-2.x, but the on-device resume **NOT YET VERIFIED**. |
| AC-5.4 | With no last-read location, the home screen shows an empty state inviting the reader to choose a book; no crash | Manual device | **NOT YET VERIFIED** | Implemented in `src/app/(tabs)/index.tsx` ("Yuk, mulai membaca." → book list). On-device behaviour **NOT YET VERIFIED**. |

## Summary

| Status | Count | ACs |
|---|---|---|
| VERIFIED (automated) | 1 | AC-2.2 |
| OBSERVED (Expo Go) | 2 | AC-4.1, AC-4.2 |
| PARTIAL | 10 | AC-1.2, AC-1.3, AC-1.4, AC-1.6, AC-2.1, AC-2.3, AC-2.5, AC-2.6, AC-2.7, AC-5.1 |
| NOT YET VERIFIED | 12 | AC-1.1, AC-1.5, AC-1.7, AC-1.7a, AC-1.7b (1.7a/b are sub-checks of AC-1.7); AC-3.1, AC-3.2, AC-3.3, AC-4.3, AC-5.2, AC-5.3, AC-5.4 |
| DEFERRED (unresolved RQ-6) | 1 | AC-2.4 |

**Overall:** automated coverage of the domain/data rules passes (7 suites / 73
tests, 2026-10-22). A limited Expo Go smoke test was observed, but the full MVP
acceptance checklist, native APK behavior, accessibility, native SQLite
rollback, and storage-failure recovery are not verified. Next evidence steps
are listed in `docs/TESTING.md` §4 and the student-review section of
`docs/ASSIGNMENT_TRACEABILITY.md` §4.1.
