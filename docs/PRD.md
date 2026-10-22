# Meno — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.5.0 (verification sync) |
| Last updated | 2026-10-22 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |
| Companion docs | `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/TESTING.md`, `docs/ASSIGNMENT_TRACEABILITY.md`, `docs/12_MEETING_PLAN.md` |

> Evidence policy: This document records the agreed MVP scope and current evidence. As of 2026-10-22 the repository contains four historical commits and the current MVP implementation remains uncommitted. **Seven test suites / 73 tests pass**; TypeScript, lint, and Expo Android bundle export pass (results in `docs/TESTING.md`). An Android Expo Go smoke test observed Home, chapter open, completion/undo, Progress, and completion/progress persistence after force-stop/relaunch. This does not establish native APK behavior, SQLite rollback, or recovery from real storage failures. The demo video is stored outside this repository; submission is unconfirmed. Items are labelled **[Confirmed]**, **[Assumption]**, **[Open Question]**, or **[Deferred]** throughout.

---

## 1. Vision

Meno is a mobile Bible-reading app that borrows the habit-building mechanics that make language apps like Duolingo compelling (streaks, daily goals, gentle progress feedback) and applies them to consistent Scripture reading. It aims to be **Scripture-first**: the Bible text is the centre of the experience, and gamification is a calm, supportive layer — never a noisy, attention-stealing one.

## 2. Problem statement

Many people want to read the Bible regularly but struggle to build and sustain the habit. Existing reading apps are either utilitarian (no motivation) or heavily gamified in ways that can feel disrespectful of the text. Meno targets the gap: a calm, respectful reading experience with light, encouraging habit mechanics and reliable progress tracking.

### 2.1 Benefits

Derived only from the problem above, the personas in §4, and the MVP features in §6. Each benefit is tied to a real feature; anything requiring user research to confirm is marked **[Assumption]**.

| # | Benefit | For whom | Delivered by | Notes |
|---|---|---|---|---|
| B-1 | **Continuity without re-deciding:** the app remembers the exact book/chapter (and scroll position) so a returning reader resumes in one tap instead of re-navigating. | Returning Reader | FR-5 last-read restore; `last_read` persistence (FR-8) | **[Assumption]** that one-tap resume measurably reduces habit friction. |
| B-2 | **Trustworthy progress counting:** marking the same chapter twice never inflates stats, so the numbers a reader sees are ones they can believe. | Both | BR-1 idempotent completion (FR-7); unique DB key | Covered by automated tests (`docs/TESTING.md`). |
| B-3 | **Progress that survives restarts and reinstall-free use:** no account, no network, no backend — activity is stored on the device (SQLite). | Both | FR-8; ADR-006 (no backend) | **[Assumption]** that local-only storage is also perceived as a privacy benefit. |
| B-4 | **Agency over "what counts":** completion is an explicit user action (a button), never a silent side-effect of opening a chapter — the reader decides what counts as done. | Both | FR-6; BR-5 (open ≠ complete) | Implemented as the "Tandai selesai" toggle. |
| B-5 | **Encouragement without noise:** gentle milestones (first chapter, 10, 50, …) and calm visual feedback mark progress without points, leaderboards, or streak pressure. | Returning Reader; New Reader | Milestone thresholds (implemented); deferred: streaks, goals, XP (§10) | **[Assumption]** that milestone-only feedback matches the "calm" positioning; no user study exists. |
| B-6 | **Low cognitive load to start reading:** two tabs only (Baca, Kemajuan); book list → chapter grid → reader is a three-tap path. | New Reader | Navigation scope (§6 note); ADR-012 | **[Assumption]** that fewer choices help early-in-faith readers. |
| B-7 | **Structure without pressure for the New Reader:** per-book and per-testament progress rings/bars show gentle structure (where you are, how much is left) without targets or guilt mechanics. | New Reader | Library rings; Kemajuan bars; FR-9 counts-based stats, including the distinct reading-days display ("X hari membaca") on the Kemajuan screen, in both the empty state (explicit "0 hari membaca") and the filled state | Honest scope: implemented stats are completed-chapter counts, distinct reading days, milestones, and per-testament progress. Streaks and daily goals stay deferred (§10); the day count is a plain historical total, not a streak. |

> **Integrity note:** no benefits claim above is backed by user research. B-1, B-3, B-5, and B-6 are explicitly assumptions until the student validates them (e.g., in a demo or with lecturer feedback).

## 3. Goals and non-goals

### 3.1 Goals (MVP)
- Provide a dependable **Bible Reader** that renders Scripture chapter-by-chapter.
- Provide **persistent Reading Progress** that survives app restarts.
- Establish a distinctive, calm, Scripture-first visual identity.
- Keep the app runnable at every milestone and independently testable at the domain layer.

### 3.2 Non-goals (explicitly out of scope for now)
- User accounts, cloud sync, or backend services.
- Social features, leaderboards, or sharing.
- Audio Bible, offline commentary, or devotionals.
- Multiple Bible translations at launch beyond the licenced/bundled set.
- Monetisation, ads, or paid content.

## 4. Target users

- **Primary persona — "The Returning Reader" [Assumption]:** a young adult who wants to read the Bible daily but has fallen out of the habit. Values simplicity and encouragement; reads on a phone during commutes or before bed.
- **Secondary persona — "The New Reader" [Assumption]:** someone early in their faith journey who benefits from structured, low-pressure daily reading.

## 5. Confirmed facts, assumptions, and open questions

### 5.1 Confirmed facts
- **[Confirmed]** This is a university assignment delivered over 12 meetings, per the `meno-workflow` skill.
- **[Confirmed 2026-10-22]** Two MVP features are implemented in the working tree: the Bible Reader and Persistent Reading Progress (Expo SQLite integration behind an injectable `SqlDriver` seam; idempotent completion; Kemajuan screen). Seven suites / 73 tests pass, with the emulator smoke-test scope and limitations recorded in `docs/TESTING.md`. The current implementation is uncommitted.
- **[Confirmed]** Required process is `Brief → Plan → Build → Verify → Commit`, per `meno-workflow`.
- **[Confirmed]** The stack is React Native + Expo + TypeScript + Expo Router + Expo SQLite; validated 2026-10-10 — see `docs/ARCHITECTURE.md` §2.
- **[Confirmed]** Environment: system Node v20.19.2 is too old for the Expo scaffolder, so **Node 22 LTS via fnm** (`v22.23.3`) is used; Python 3.13.5, Git 2.47.3. User-local Android SDK Platform 36 + emulator (`meno_api36`) and Temurin JDK 17 are set up. See `docs/ARCHITECTURE.md` §2.5.
- **[Confirmed 2026-10-11]** UI language is **Indonesian**.
- **[Confirmed 2026-10-11]** The intended demonstration target is **Android-first** (sideloadable APK / Expo development build). iOS and web are **not** required for the demonstration.

### 5.2 Assumptions (need confirmation)
- **[Assumption]** Reading progress is stored **locally only** (device SQLite), consistent with the no-backend non-goal.

### 5.3 Open questions (blocking/non-blocking)
- **[Open Question — blocking]** Which Bible **translation** will be bundled, and its **content source and licence**? (See licensing analysis in §5.4.) This must be resolved before any Bible content is added.
- **[Open Question]** Should reading progress support `web` (Expo supports it) as a bonus platform, or is mobile-only acceptable? (Not required for the Android-first demonstration.)
- **[Deferred]** Daily-goal model is **out of MVP scope**. A "day read" is simply a local calendar date with ≥1 explicit completion record (§8, BR-2). No daily target or ring is shown.

### 5.4 Bible translation licensing — research notes

> **Placeholder content (2026-10-11):** until licensing is resolved the app uses **only a synthetic placeholder dataset**, rendered with an explicit on-screen label (e.g. `TEKS CONTOH — BUKAN KITAB SUCI` / `PLACEHOLDER_NOTICE`) so it can never be mistaken for Scripture. **No real Bible text is added, bundled, or downloaded.** The intended embedded translation is **ILT3**, whose **redistribution/embedding permission is unresolved** and must not be assumed granted. Public-domain options below are **fallbacks only, and only after verifying the exact translation, source, and reuse terms**. No Bible text is bundled until the licence is confirmed and recorded.

Researched on 2026-10-10. **Public-domain / freely licensable options (US):**
- King James Version (KJV) — public domain in the USA (Crown copyright/letters patent applies in the UK).
- American Standard Version (ASV, 1901) — public domain.
- World English Bible (WEB) — public domain; **"World English Bible" is a trademark**, used only to identify faithful copies.
- English Revised Version, Geneva (1599), Darby, Young's Literal Translation, Bible in Basic English — public domain (verify jurisdiction).
- Berean Standard Bible (BSB), Open English Bible (OEB) — public-domain dedication / CC0.

**Copyrighted (require permission/licence):** NIV, ESV, NLT, NASB, NET, and most modern translations.

> **[Open Question — blocking]** Translation choice must be made by the student and recorded here with its licence/attribution text before any content is bundled. Meno will **not** fabricate or paraphrase Bible text.

## 6. MVP feature scope

The two MVP features are **Bible Reader** and **Reading Progress**, expressed as **five user stories** (three of them newly added to satisfy the assignment's five-story requirement, P6) so that each discrete user-facing capability has its own observable, testable acceptance criteria. Every other feature (translation switching, streaks, daily goals, reading plans, bookmarks, dark theme) is **deferred** (see §10).

> **Navigation scope (2026-10-11):** the MVP exposes exactly **two tabs — Baca (Reader) and Kemajuan (Progress)**. There is no dashboard or Settings tab. The Reader is pushed **above** the tab bar; previous/next chapter **replaces** the current reader route (no stack growth); Android Back returns to the **originating screen**.

> **Content scope (2026-10-11):** the MVP renders a **clearly labelled synthetic placeholder dataset only**. No real Bible text is bundled until its exact source and reuse rights are resolved (see §5.4).

### 6.1 Feature 1 — Bible Reader (Milestone 1)

**User story**
> As a reader, I want to open a Bible book and chapter, read its text in a chosen translation, and move to the next or previous chapter — so that I can read Scripture without friction.

**Functional requirements**
- **FR-1** Browse the list of books available in the bundled translation.
- **FR-2** Open a selected book and chapter and render its verses.
- **FR-3** Move to the previous/next chapter from within the reader. At the first chapter of the Bible the **previous** control is disabled; at the last chapter of the Bible the **next** control is disabled (no wrap-around). Crossing a book boundary steps to the adjacent book. Moving prev/next **replaces** the current reader route (no back-stack growth), and Android Back returns to the screen that launched the reader (book list or Kemajuan).
- **FR-4** Keep `translationId` in the data model. The MVP uses a single placeholder translation; user-facing translation switching is deferred.
- **FR-5** Restore the reader to the last-read location on reopen (shared with Feature 2). Last-read updates when a chapter is **opened** (BR-5); opening does not complete it.

**Acceptance criteria (Given/When/Then, measurable)**
- **AC-1.1** Given the app is opened, when the reader is shown, then the list of books for the selected translation is displayed.
- **AC-1.2** Given a book is selected, when a chapter is chosen, then all verses of that chapter are rendered in canonical order.
- **AC-1.3** Given the last chapter of a book (not the last book), when "next" is requested, then the app moves to the first chapter of the next book. Given the final chapter of the Bible (last book's last chapter), the **next** control is **disabled** (no wrap-around). Symmetrically, at the first chapter of the Bible "previous" is disabled (AC-1.4).
- **AC-1.4** Given the first chapter of Genesis, when "previous" is requested, then the control is disabled (no crash, no negative navigation).
- **AC-1.5** Given the reader is scrolled/positioned in a chapter, then long chapters remain scroll-performant using a virtualized list (no full-chapter `ScrollView` of hundreds of views without virtualization).
- **AC-1.6** **[Partial]** Given the app is closed and reopened, then the reader returns to the last-read book and chapter. Host tests cover a simulated restart; the Expo Go smoke test observed completion/progress persistence after force-stop and relaunch, but did not verify last-read restoration as a distinct acceptance check.
- **AC-1.7** Given the app is opened, then the shell shows **exactly two tabs — Baca (Reader) and Kemajuan (Progress)** — and no others. The following are independent checks on the same shell:
  - **AC-1.7a** Given a chapter is open, when the reader is dismissed with Android Back, then the app returns to the **screen that launched the reader** (book list or Kemajuan).
  - **AC-1.7b** Given a chapter is open, when the previous/next control is used, then the current reader route is **replaced** (no back-stack growth), and Android Back still returns to the originating screen.

### 6.2 Feature 2 — Persistent Reading Progress (Milestone 2)

**User story**
> As a reader, I want my reading activity to be remembered and counted, so that I can see my consistency and stay motivated.

**Functional requirements**
- **FR-6** Mark a chapter as read/completed (explicit user action).
- **FR-7** Completion is **idempotent**: completing the same chapter twice on the same local date does not double-count.
- **FR-8** Progress persists across app restarts (SQLite).
- **FR-9** Display counts-based stats: **completed chapters** and **distinct local reading days**. (Streak/goal display is deferred — §10.)

**Acceptance criteria**
- **AC-2.1** Given a chapter is marked complete, when progress is queried, then it is reflected in the completed set.
- **AC-2.2** Given a chapter was already completed on the same local calendar date, when it is completed again, then no new activity is recorded and the distinct-completed-chapters count is unchanged.
- **AC-2.3** **[Partial]** Given completion records exist, when the app is restarted, then the records are still present and stats are unchanged. Host tests cover a simulated restart; the Expo Go smoke test observed completion/progress persistence after force-stop and relaunch. Native SQLite rollback and real storage-failure recovery are unverified.
- **AC-2.4** **[Deferred]** Streak boundary behaviour (consecutive days, missed-day reset, timezone rule) is **out of MVP scope** and is not required to pass the demonstration.
- **AC-2.5** Given no completions exist, when progress is shown, then **completed chapters = 0** and **distinct local reading days = 0** (no crash).
- **AC-2.6** Given a chapter completed on day N and re-completed on day N+1, when stats are computed, then **completed chapters** counts that chapter **once** while **distinct local reading days** counts **two** distinct local dates.
- **AC-2.7** Given a chapter is only opened (not marked complete), when progress is computed, then the last-read location updates but the chapter is **not** counted as completed.

### 6.3 Feature 1 (continued) — Finding a book to read

**User story**
> As a reader with a particular book in mind, I want to find it quickly in the book list without scrolling through all 66 books — so that I can start reading sooner.

This story covers the browse-and-discover path *into* the reader (FR-1). It is separated from the in-reader reading/navigation story (§6.1) because its acceptance criteria are about list discovery, not about chapter text or prev/next behaviour.

**Functional requirements**
- **FR-10** Provide a book list grouped by testament (PL / PB), each row showing the book's name and how many of its chapters are complete.
- **FR-11** Provide a search field that filters the book list by name; a search with no matches shows an explanatory empty state with a way to clear the search.

**Acceptance criteria (Given/When/Then)**
- **AC-3.1** Given the reader tab, when "Pilih kitab" is opened, then books are listed grouped under testament headers, and each row shows the book name and its completed-chapter count.
- **AC-3.2** Given a search term is entered, when the list is filtered, then only books whose names contain the term are shown, still grouped by testament.
- **AC-3.3** Given a search term that matches no book, when the list is rendered, then an empty state explains that no book matched and offers an action to clear the search; no crash occurs.

### 6.4 Feature 1 (continued) — Reading a chapter and marking it done

**User story**
> As a reader, I want to see where I am in a chapter and record it as finished (or undo that) — so that my reading is deliberate and my progress reflects what I have actually completed.

This story covers in-reader state display, the explicit completion action, and undo (FR-6). It is separated from chapter navigation (§6.1) and from the stats overview (§6.5).

**Functional requirements**
- **FR-12** In the reader, show the current chapter's completion state and offer an explicit "Tandai selesai" action; when a chapter is already complete, offer "Batalkan penandaan" to undo it.
- **FR-13** Keep the on-screen notice that the bundled text is synthetic placeholder content, never to be mistaken for Scripture (§5.4).

**Acceptance criteria (Given/When/Then)**
- **AC-4.1** Given an incomplete chapter is open, when "Tandai selesai" is tapped, then the chapter is recorded as complete and the control changes to offer "Batalkan penandaan".
- **AC-4.2** Given a completed chapter is open, when "Batalkan penandaan" is tapped, then the chapter is removed from the completed set and the control reverts to "Tandai selesai".
- **AC-4.3** Given any chapter is rendered, when the reader is shown, then the placeholder notice is visible so the synthetic text is not mistaken for Scripture.

### 6.5 Feature 2 (continued) — Seeing progress and continuing where I left off

**User story**
> As a returning reader, I want to see a calm summary of how far I have come and pick up where I stopped — so that I stay encouraged and re-orient myself quickly.

This story covers the progress overview and last-read resume (FR-5, FR-9). It is separated from the act of marking a chapter done (§6.4).

**Functional requirements**
- **FR-14** Show a progress summary: total completed chapters, distinct local reading days, per-testament progress, and gentle chapter-count milestones — without streaks or daily goals (deferred, §10).
- **FR-15** Offer a one-tap resume of the last-read book/chapter; when nothing has been read yet, show an empty state that points to the book list.

**Acceptance criteria (Given/When/Then)**
- **AC-5.1** Given the progress tab is opened, when there is at least one completion, then completed chapters, distinct reading days, and per-testament progress are shown as non-negative counts.
- **AC-5.2** Given the progress tab is opened with no completions, when it renders, then completed chapters and distinct reading days both show as 0 and an empty state is shown (no crash).
- **AC-5.3** Given a last-read location exists, when the home screen is opened, then a resume affordance is shown that navigates to that book and chapter.
- **AC-5.4** Given no last-read location exists, when the home screen is opened, then an empty state invites the reader to choose a book (no crash).

## 7. Data model (planned)

```
Translation(id, name, abbreviation, language, licence, attribution)
Book(id, translationId, name, canonicalOrder, testament, chapterCount)
Chapter(translationId, bookId, number, verseCount)
Verse(translationId, bookId, chapterNumber, number, text)

ReadingCompletion(id, translationId, bookId, chapterNumber, completedOn /* local date YYYY-MM-DD */, createdAt)
ReadingProgressState(key, lastTranslationId, lastBookId, lastChapterNumber, updatedAt)
```

> **Record identity:** an activity record is identified by `(translationId, bookId, chapterNumber, completedOn)`, where `completedOn` is the **device's local calendar date**. `translationId` is retained even though the MVP ships a single placeholder translation.
>
> **Progress semantics:** **completed chapters** = distinct chapters with ≥1 completion record; **distinct local reading days** = distinct `completedOn` dates with ≥1 completion record. **Last-read** (`ReadingProgressState`) updates when a chapter is **opened** and does not by itself count as a completion.
>
> **Deferred:** `StreakState(currentStreak, longestStreak, lastQualifyingDate)` is **not** part of the MVP schema; it is listed only as an explicitly deferred future shape.
>
> Field names and exact schema are provisional and will be finalised during Milestone 1. The domain rules (below) are the source of truth and are testable independently of storage.

## 8. Business rules (deterministic, unit-testable)

- **BR-1** An activity record is uniquely identified by `(translationId, bookId, chapterNumber, completedOn)`. Inserting a duplicate is a no-op (same chapter, same local date → no change). A completion on a **later local date** is recorded as new activity for that date but does not increase the distinct-completed-chapters count.
- **BR-2** A "day" is the **device's local calendar date** (`completedOn`, `YYYY-MM-DD`). **Completed chapters** = distinct chapters completed; **distinct local reading days** = distinct local dates with ≥1 explicit completion record.
- **BR-3** **[Deferred]** Streak increment/reset rules are out of MVP scope and are not implemented or tested in the MVP.
- **BR-4** **[Deferred]** Longest-streak tracking is out of MVP scope.
- **BR-5** Last-read location updates whenever a chapter is **opened**, and is restored on launch. Opening a chapter does **not** mark it complete.
- **BR-6** Stats are derived purely from stored records (no cached counters that can drift), unless a later ADR justifies caching.

## 9. Testing requirements

Meaningful unit tests on the **domain and data layers** (no UI, no device required). As of 2026-10-22, **73 tests across 7 suites pass**; inventory and captured output are in `docs/TESTING.md`:
- Reader navigation edge cases: first/last chapter, book boundaries, empty chapters (FR-3) — `src/domain/__tests__/bibleNavigation.test.ts` (22 cases, committed in `c2bb19d`).
- Progress-domain rules: idempotent completion toggle, counts, milestones, corrupt-payload validation, scroll-restoration decisions (`restoreScrollOffset`) — `src/domain/__tests__/progress.test.ts` (21 cases).
- Progress persistence round-trip through the repository boundary (FR-8, BR-5) — `src/data/__tests__/db.test.ts` (7 cases), via an in-memory `SqlDriver` fake, including a simulated app restart.
- Duplicate completion is a no-op through the persistence API (BR-1, FR-7) — `src/data/__tests__/dbCompletion.test.ts` (11 cases; injected in-memory driver, not native SQLite rollback verification).
- Canon metadata and route-parameter validation (supports FR-1..FR-3) — `src/data/__tests__/canon.test.ts` (7 cases; 66 books / 1189 chapters guarded).
- **[Deferred]** Streak boundaries: first day, consecutive days, missed day, longest-streak tracking (BR-3, BR-4).
- **[Deferred]** Reading-plan validation (when plans are introduced).

> Tests are executed during Build/Verify and the **actual command and result** are recorded in **`docs/TESTING.md`**. The Android Expo Go smoke test observed completion/progress after force-stop and relaunch; native APK behavior, native SQLite rollback, real storage-failure recovery, reader virtualization performance, and last-read restoration after relaunch remain unverified. Screenshots are not in this repository. Streak-boundary and reading-plan tests remain **[Deferred]** per §10.

## 10. Success metrics (measurable for the assignment)

**Required to pass the MVP demonstration (in scope):**
- The non-deferred acceptance criteria for Features 1–2 pass in a live demo: **AC-1.1–AC-1.7**, **AC-2.1, AC-2.2, AC-2.3, AC-2.5, AC-2.6, AC-2.7**, **AC-3.1–AC-3.3**, **AC-4.1–AC-4.3**, and **AC-5.1–AC-5.4**.
- In-scope domain business rules are covered by unit tests with the real command/output captured in `docs/TESTING.md`.
- The app is runnable and demonstrable at each meeting milestone.
- Documentation (`PRD`, `ARCHITECTURE`, `DESIGN_SYSTEM`, `TESTING`, `README`) is accurate and maintained.

**Explicitly deferred (not required to pass; must not be reported as passed):**
- AC-2.4 and BR-3/BR-4 (streak calculation and streak-boundary tests).
- Daily-goal model and daily-goal ring.
- User-facing translation switching, dark theme, bookmarks, and reading plans.

## 11. Dependencies and constraints

- UI depends on the bundled Bible dataset (blocked by translation licensing decision); until then only a labelled synthetic placeholder is shown (§5.4).
- Progress feature depends on the SQLite persistence layer.
- No backend, auth, or paid service without prior approval per `meno-workflow`.

## 12. Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-10-10 | Initial planning draft created (no code implemented). |
| 0.2.0 | 2026-10-11 | Scope review: MVP limited to Bible Reader + persistent Reading Progress (two tabs, Baca/Kemajuan); progress counts completed chapters + distinct local reading days; Indonesian UI and Android-first demo target recorded; synthetic placeholder labelled as sample text (no real Bible text); streaks, daily goals, translation switching, bookmarks, reading plans, and dark theme deferred. |
| 0.3.0 | 2026-10-15 | Implementation evidence: both MVP features implemented (two-tab shell, design integration, SQLite persistence behind a driver seam); five test files / 53 tests passing with verbatim output in `docs/TESTING.md`; §9 testing section updated from "planned" to actual status; committed history = 2 commits, current work uncommitted pending student review; on-device demo + screenshots still outstanding. |
| 0.3.1 | 2026-10-15 | Added §2.1 Benefits (B-1…B-7), derived only from the problem, personas, and implemented/planned features; research assumptions marked. No other scope or AC changes. |
| 0.3.2 | 2026-10-15 | Corrected current-state claims to the verified run: 53 → **62 tests passing** across 5 files (§Evidence policy, §5.1, §9, with per-file counts). B-7 now states the distinct reading-days display ("X hari membaca") is **implemented** on the Kemajuan screen; streaks/daily goals remain deferred. No scope, AC, or code changes. |
| 0.4.0 | 2026-10-15 | Added three user stories to satisfy the five-story requirement (P6): §6.3 book discovery/search, §6.4 in-reader completion + undo + placeholder notice, §6.5 progress overview + resume. Introduced **new AC namespaces AC-3.x, AC-4.x, AC-5.x** so existing AC-1.x/AC-2.x IDs are **not renumbered**; §10 in-scope demo list updated to include them. No existing criteria, business rules, or code changed. |
| 0.4.1 | 2026-10-15 | Documentation sync with the reader-virtualization fix: current-state claims updated 62 → **66 tests passing** across 5 files (§Evidence policy, §5.1, §9, with `progress.test.ts` 17 → 21 cases incl. the new `restoreScrollOffset` scroll-restoration decisions). §9 now records that device virtualization/scroll-restoration evidence (AC-1.5/AC-1.6 device halves) is still outstanding. **AC-1.5's wording is unchanged** (it already describes the virtualized-list behaviour now implemented via `FlatList` + memoized `VerseRow`). No scope, AC, or business-rule changes. |
| 0.5.0 | 2026-10-22 | Updated current implementation/testing evidence to 7 suites / 73 tests and recorded TypeScript, lint, Android Expo export, and limited Expo Go smoke observations. Clarified that native APK behavior, SQLite rollback, real storage-failure recovery, screenshots, and video submission remain unverified or unconfirmed. ILT3 redistribution permission remains unresolved; no Bible text was added. |
