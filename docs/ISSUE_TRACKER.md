# GitHub Issue Tracker

Repository: [cyberEagleOne/meno](https://github.com/cyberEagleOne/meno/issues). The initial review found no existing issues or duplicates. Eleven task issues were created during the initial tracking pass; two verified, fixed historical bug records were added later as #16 and #17. Final live count: 13 Issues, 5 labeled `bug`.

| # | Issue | Type | Priority | Status |
|---:|---|---|---|---|
| 3 | [Notification denial kept stale `canAskAgain`](https://github.com/cyberEagleOne/meno/issues/3) | Verified bug | P1 | Closed; fixed in `882ae88` and regression-tested |
| 4 | [Goal-form load effect caused lint failure](https://github.com/cyberEagleOne/meno/issues/4) | Verified build/lint defect | P2 | Closed; fixed in `871548b` |
| 5 | [Decide Bible translation license and replace sample reader text](https://github.com/cyberEagleOne/meno/issues/5) | Content decision | P1 | Open |
| 6 | [Verify SQLite CRUD persistence across Android restart](https://github.com/cyberEagleOne/meno/issues/6) | Acceptance test | P1 | Open |
| 7 | [Exercise Android notification permission and scheduling paths](https://github.com/cyberEagleOne/meno/issues/7) | Acceptance test | P1 | Open |
| 8 | [Verify shake navigation sensor lifecycle and cooldown](https://github.com/cyberEagleOne/meno/issues/8) | Acceptance test | P1 | Open |
| 9 | [Verify biometric and PIN lock fallback paths](https://github.com/cyberEagleOne/meno/issues/9) | Acceptance test | P1 | Open |
| 10 | [Capture UI, keyboard and accessibility review evidence](https://github.com/cyberEagleOne/meno/issues/10) | UX/accessibility | P2 | Open |
| 11 | [Upgrade deprecated artifact action and confirm hosted build](https://github.com/cyberEagleOne/meno/issues/11) | CI maintenance | P2 | Open |
| 12 | [Review remaining npm audit advisories](https://github.com/cyberEagleOne/meno/issues/12) | Dependency security | P1 | Open |
| 13 | [Android launch falls into SQLite bootstrap error](https://github.com/cyberEagleOne/meno/issues/13) | Verified x86_64 packaging/runtime defect | P0 for x86_64 | Open; ARM64-only build verified in CI |
| 14 | Daily Verse "Baca Pasal Lengkap" navigation fails with missing chapter error due to unmapped external OSIS book ID | Verified bug / navigation defect (local finding) | P1 | Closed; finalized via safe `normalizeApiBookId`, reference parsing fallback, and 66-book regression tests |
| 15 | Reading Goal validation accepts non-integer numeric strings and fails to enforce 200-character maximum note limit | Verified form validation defect (local finding) | P2 | Closed; fixed via strict integer regex and 200-char boundary check |
| 16 | [Daily Verse did not normalize external Bible book IDs before navigation (fixed)](https://github.com/cyberEagleOne/meno/issues/16) | Historical bug | Closed; fixed in `db4063f`, regression-tested |
| 17 | [Reading Goal accepted fractional targets and overlong notes (fixed)](https://github.com/cyberEagleOne/meno/issues/17) | Historical bug | Closed; fixed in `db4063f`, regression-tested |

Rows #14 and #15 are local Milestone 2 regression findings recorded in this document; they are now filed as GitHub Issues #16 and #17. A read-only GitHub check on 2026-11-26 confirmed GitHub numbers #14 and #15 are merged Pull Requests, so those local finding numbers must not be used as GitHub Issue numbers. GitHub Issues #16 and #17 are closed retrospective records of fixed bugs, not active defects.

### Honest Defect and Bug Count Classification

Reviewing defect classifications against the assignment's five-bug requirement:
- **Verified Runtime & Packaging Defects (4 genuine bugs):**
  1. **Issue #3 (P1):** Notification denial showed stale permission guidance (`canAskAgain`).
  2. **Issue #13 (P0 for x86_64):** Pre-existing release APK advertised x86/x86_64 while packaging Expo SQLite JNI only for ARM64, causing an immediate SQLite bootstrap crash on x86_64 devices/emulators.
  3. **GitHub Issue #16 (local finding #14, P1):** Daily Verse REST API returned external OSIS/USFM book IDs (`"JHN"`, `"PSA"`) which did not map to Meno's Indonesian canonical book IDs (`"yohanes"`, `"mazmur"`), causing "Baca Pasal Lengkap" navigation to fail with a missing chapter error. The prior code also defaulted missing identifiers to `"joh"` and chapter `3`; it now safely returns `undefined` (no guessed book or chapter) and the UI hides navigation when unverified.
  4. **GitHub Issue #17 (local finding #15, P2):** Reading Goal form validation used loose `parseInt`, permitting non-integer numbers (e.g., `"5.8"`) and alphanumeric strings, and omitted the documented 200-character maximum limit on user reflection notes.

- **Verified Build & Lint Defect (1 defect):**
  - **Issue #4 (P2):** Goal-form load effect triggered synchronous state updates causing React/ESLint failures and redundant re-renders. While a genuine defect in the repository build lifecycle, this is an internal lint/build failure rather than an observed user-facing runtime crash.

**Evaluation of the 5-Bug Quota:**
- If build/lint defects are counted alongside runtime defects, 5 authentic defects are tracked as GitHub Issues (#3, #4, #13, #16, #17).
- If the lecturer strictly requires 5 *user-facing runtime bugs*, four user-facing/runtime defects are established (#3, #13, #16, #17); #4 is an authentic build/lint defect rather than a runtime crash.
- Per project integrity guidelines, #16 and #17 record historical defects already fixed in `db4063f`; they are not described as active failures. Issue #4 is not misclassified as a user-facing runtime crash, and artificial defects were not fabricated to close the gap. The remaining eight issues (#5–#12) represent genuine feature, security, or device acceptance milestones.

---

## Detailed Defect Records (Milestone 2 Remediation)

### GitHub Issue #16 (local finding #14): Daily Verse "Baca Pasal Lengkap" Navigation Failure
- **Affected Feature and File:** Daily Verse Integration / Navigation, `src/data/dailyVerseRepository.ts`, `src/components/ui/DailyVerseCard.tsx`
- **Preconditions:** Daily verse is successfully fetched on the Home screen (e.g. from `https://bible-api.com/john+3:16`).
- **Exact Reproduction Steps:**
  1. Call `fetchDailyVerseFromApi()`, which retrieves a daily verse from an external API with `book_id: "JHN"` and `chapter: 3`.
  2. The repository parsed this into `{ bookId: "JHN", chapter: 3 }` (or fallback `"joh"`).
  3. On `DailyVerseCard`, user clicks "Baca Pasal Lengkap".
  4. Router pushes to `/reader/JHN/3` (or `/reader/joh/3`).
  5. `ReaderScreen` searches `placeholderBible.books` via `getBook(placeholderBible, "JHN")`.
- **Expected Behavior:** The book identifier should map to Meno's Indonesian canonical ID (`"yohanes"`), opening Yohanes Pasal 3. If the book cannot be identified, the system must not guess or fall back to an arbitrary book, and the UI must omit the navigation button.
- **Actual Behavior (prior to fix):** `getBook` returned `undefined` because Meno's canon IDs are Indonesian (`"yohanes"`). The reader rendered the error state: *"Pasal tidak ditemukan. Pasal ini tidak ada dalam data contoh."* Furthermore, a missing `book_id` previously fell back silently to `"joh"` (an English OSIS code that still did not match Meno's Indonesian IDs) and chapter `3`, so users were routed to a guessed book and chapter regardless of what was quoted. No path now falls back to `"yohanes"`, `"joh"`, or a default chapter.
- **Severity and Impact:** P1 (High). Breaks an interactive core user journey on the Home screen.
- **Root Cause:** `dailyVerseRepository.ts` passed third-party English/OSIS book identifiers (`"JHN"`, `"joh"`, `"psa"`) directly into the domain model without canonical normalization, and subsequent normalization logic lacked safe handling for unidentified books.
- **Implementation & Remediation:**
  1. `normalizeApiBookId`: Maps all 66 canonical Bible books, their OSIS/USFM codes, and English aliases. Safely returns `undefined` (no guessing or `"yohanes"` fallback) when given unknown, missing, blank, or malformed book IDs.
  2. `parseReference`: Reliably parses book name and chapter from reference strings (e.g. `"John 3:16"` or `"Mazmur 23:1"`) if `book_id` is missing in the API payload.
  3. `DailyVerseCard`: Checks `placeholderBible.books` to verify that `verse.bookId` and `verse.chapter` exist and are in-bounds before rendering the "Baca Pasal Lengkap" button. If unidentified, the button is omitted gracefully.
- **Regression Tests:**
  - `src/data/__tests__/dailyVerse.test.ts` includes table-driven tests for all 66 canonical Bible books and their external identifiers in lowercase, uppercase, and with whitespace; boundary tests verifying `undefined` for unknown/empty/null/non-string values; `parseReference` tests covering all 66 canonical names; API integration tests; a table of malformed `book_id` payloads (missing, blank, whitespace, null, number, object, array, unknown); alternative payload shapes (`book_name`, `verses[0]`); and invalid chapter guards.
  - `src/components/ui/__tests__/DailyVerseCard.test.tsx` tests that the "Baca Pasal Lengkap" button renders for valid canonical books and is cleanly omitted for undefined, blank, whitespace-only, unknown, out-of-bounds, missing, fractional, or zero chapter values, including the exact maximum chapter (renders) and maximum + 1 (omitted).

### GitHub Issue #17 (local finding #15): Reading Goal Form Validation Incomplete
- **Affected Feature and File:** Reading Goal Form State Management & Validation, `src/domain/settingsValidation.ts`
- **Preconditions:** User is setting or editing reading goals in the Settings screen (`src/app/settings.tsx`).
- **Exact Reproduction Steps:**
  1. User enters a non-integer float (e.g., `"3.5"` or `"5.8"`) or a string with non-numeric suffixes (e.g., `"2 chapters"`).
  2. User enters a commitment note exceeding 200 characters (e.g., 201 characters).
  3. Form calls `validateReadingGoal({ targetChapters: "3.5", reflectionNote: "..." })`.
- **Expected Behavior:** Validation should reject non-integer strings (`targetError: "Target wajib diisi angka antara 1 sampai 50 pasal."`) and reject notes longer than 200 characters (`noteError: "Catatan komitmen maksimal 200 karakter."`), setting `valid: false`.
- **Actual Behavior:** `parseInt("3.5", 10)` parsed to `3` and passed validation as integer. Notes longer than 200 characters were accepted because only `length < 5` was checked, violating the specifications in `docs/STATE_MANAGEMENT.md` and `docs/TESTING.md`.
- **Severity and Impact:** P2 (Medium). Accepts out-of-spec input that violates the documented 5–200 character note rule and the integer-only target rule. No truncation to 200 characters was observed; the note is stored as entered after trimming.
- **Root Cause:** `validateReadingGoal` lacked a strict whole-number pattern check (`/^\d+$/`) and omitted the upper bound check `reflectionNote.trim().length > 200`.
- **Regression Test:** `src/domain/__tests__/settingsValidation.test.ts` includes dedicated cases testing rejection of floats (`"3.5"`), strings with letters (`"2 chapters"`), and reflection notes exceeding 200 characters, as well as acceptance of notes at exactly 200 characters.

The issue was updated with the successful ARM64 CI result and the remaining physical-device verification step in [comment 7010440584](https://github.com/cyberEagleOne/meno/issues/13#issuecomment-7010440584).

Failure evidence: `docs/evidence/android/02-x86_64-storage-error.png`, `02-x86_64-logcat.txt`, and `02-install-verification.txt`. This records a failed x86_64 run, not successful phone acceptance. The four passing UI screenshots and accessibility review remain outstanding.
