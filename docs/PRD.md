# Meno — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.2.0 (scope review) |
| Last updated | 2026-10-11 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |
| Companion docs | `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/ASSIGNMENT_TRACEABILITY.md`, `docs/12_MEETING_PLAN.md` |

> Evidence policy: This document records **planned** behaviour and the agreed MVP scope. As of 2026-10-11 the repository contains a scaffolded Expo SDK 57 app and **one commit** (`b6e1533 Initial project scaffold and planning docs`); the Bible Reader slice exists only as **uncommitted** working-tree changes. A navigation test file with **22 cases exists**, but its **results are not captured in the repository** — any earlier "tests pass" report is a **historical development note, not repository evidence**. No test output, screenshots, or device evidence are captured. Items are labelled **[Confirmed]**, **[Assumption]**, **[Open Question]**, or **[Deferred]** throughout.

---

## 1. Vision

Meno is a mobile Bible-reading app that borrows the habit-building mechanics that make language apps like Duolingo compelling (streaks, daily goals, gentle progress feedback) and applies them to consistent Scripture reading. It aims to be **Scripture-first**: the Bible text is the centre of the experience, and gamification is a calm, supportive layer — never a noisy, attention-stealing one.

## 2. Problem statement

Many people want to read the Bible regularly but struggle to build and sustain the habit. Existing reading apps are either utilitarian (no motivation) or heavily gamified in ways that can feel disrespectful of the text. Meno targets the gap: a calm, respectful reading experience with light, encouraging habit mechanics and reliable progress tracking.

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
- **[Confirmed 2026-10-11]** The project is scaffolded: an Expo SDK 57 app (`package.json`, `src/app/` routes) with **one commit** (`b6e1533 Initial project scaffold and planning docs`). A Bible Reader vertical slice (book list + chapter reader + a pure navigation module + a 22-case test file) exists only as **uncommitted** working-tree changes.
- **[Confirmed]** Required process is `Brief → Plan → Build → Verify → Commit`, per `meno-workflow`.
- **[Confirmed]** The proposed stack is React Native + Expo + TypeScript + Expo Router + Expo SQLite (to be validated — see `docs/ARCHITECTURE.md`).
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

The first two MVP features are **Bible Reader** and **Reading Progress**. They are specified in detail below so they can be built and tested incrementally. Every other feature (translation switching, streaks, daily goals, reading plans, bookmarks, dark theme) is **deferred** (see §10).

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
- **AC-1.6** **[Pending]** Given the app is closed and reopened, then the reader returns to the last-read book and chapter. (Last-read restoration is not yet implemented/verified.)
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
- **AC-2.3** **[Pending]** Given completion records exist, when the app is restarted, then the records are still present and stats are unchanged. (Persistence is not yet implemented/verified.)
- **AC-2.4** **[Deferred]** Streak boundary behaviour (consecutive days, missed-day reset, timezone rule) is **out of MVP scope** and is not required to pass the demonstration.
- **AC-2.5** Given no completions exist, when progress is shown, then **completed chapters = 0** and **distinct local reading days = 0** (no crash).
- **AC-2.6** Given a chapter completed on day N and re-completed on day N+1, when stats are computed, then **completed chapters** counts that chapter **once** while **distinct local reading days** counts **two** distinct local dates.
- **AC-2.7** Given a chapter is only opened (not marked complete), when progress is computed, then the last-read location updates but the chapter is **not** counted as completed.

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

## 9. Testing requirements (planned)

Meaningful unit tests on the **domain layer** (no UI, no device required):
- Reader navigation edge cases: first/last chapter, book boundaries, empty chapters (FR-3) — **tests present** (22 cases) in `src/domain/__tests__/bibleNavigation.test.ts`; **results are not captured in the repository** (an earlier development run reportedly passed, but that is a historical note, not repository evidence).
- Duplicate completion is a no-op (BR-1) — **planned** (Feature 2 not built).
- Progress persistence round-trip through the repository boundary (BR-5) — **planned**.
- **[Deferred]** Streak boundaries: first day, consecutive days, missed day, longest-streak tracking (BR-3, BR-4).
- **[Deferred]** Reading-plan validation (when plans are introduced).

> Tests are executed during Build/Verify and the **actual command and result** recorded in `docs/TESTING.md`, which **does not yet exist**. This PRD does not claim any test has passed: navigation **test cases are present** (22, uncommitted) but **no results are captured as repository evidence**; progress/domain tests and the SQLite persistence round-trip remain **planned, not implemented or verified**. **The overall testing requirement is therefore not yet satisfied.**

## 10. Success metrics (measurable for the assignment)

**Required to pass the MVP demonstration (in scope):**
- The non-deferred acceptance criteria for Features 1–2 pass in a live demo: **AC-1.1–AC-1.7** and **AC-2.1, AC-2.2, AC-2.3, AC-2.5, AC-2.6, AC-2.7**.
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
