# Meno — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Document status | Draft — awaiting student review and approval |
| Version | 0.1.0 (planning) |
| Last updated | 2026-10-10 |
| Author | AI-assisted draft (opencode); not yet reviewed by the student |
| Companion docs | `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/ASSIGNMENT_TRACEABILITY.md`, `docs/12_MEETING_PLAN.md` |

> Evidence policy: This document records **planned** behaviour only. No feature has been built, no test has been run, and no commit exists yet. Items are labelled **[Confirmed]**, **[Assumption]**, or **[Open Question]** throughout.

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
- **[Confirmed]** The project directory currently contains only `.opencode/` (tooling/skills). There is no application code, no `package.json`, and **no Git commits yet** (verified with `git status`: "No commits yet").
- **[Confirmed]** Required process is `Brief → Plan → Build → Verify → Commit`, per `meno-workflow`.
- **[Confirmed]** The proposed stack is React Native + Expo + TypeScript + Expo Router + Expo SQLite (to be validated — see `docs/ARCHITECTURE.md`).
- **[Confirmed]** Environment detected on 2026-10-10: Node v20.19.2, npm 9.2.0, Python 3.13.5, Git 2.47.3, OpenJDK 25.0.4.1. `expo`, `watchman`, and `adb` were **not** found on `PATH`.

### 5.2 Assumptions (need confirmation)
- **[Assumption]** The first-release platform will be **Android** (sideloadable APK / Expo development build), because it avoids Apple Developer fees and is the simplest to demonstrate for a university submission.
- **[Assumption]** Launch language is **English**.
- **[Assumption]** The app ships a **bundled, public-domain Bible translation** stored locally (no network dependency at read time).
- **[Assumption]** Reading progress is stored **locally only** (device SQLite), consistent with the no-backend non-goal.

### 5.3 Open questions (blocking/non-blocking)
- **[Open Question — blocking]** Which Bible **translation** will be bundled? (See licensing analysis in §5.4.) This must be decided before Bible content is added.
- **[Open Question — blocking]** What is the **content source and licence** for the bundled text, and where will it be stored/attributed?
- **[Open Question]** **First-release platform**: Android only, iOS only, or both? (Architecture supports both; demonstration only needs one.)
- **[Open Question]** UI language(s) beyond English?
- **[Open Question]** Should reading progress support `web` (Expo supports it) as a bonus platform, or is mobile-only acceptable?
- **[Open Question]** What daily-goal model defines a "successful day" (e.g., one chapter, one verse, a time target)?

### 5.4 Bible translation licensing — research notes

Researched on 2026-10-10. **Public-domain / freely licensable options (US):**
- King James Version (KJV) — public domain in the USA (Crown copyright/letters patent applies in the UK).
- American Standard Version (ASV, 1901) — public domain.
- World English Bible (WEB) — public domain; **"World English Bible" is a trademark**, used only to identify faithful copies.
- English Revised Version, Geneva (1599), Darby, Young's Literal Translation, Bible in Basic English — public domain (verify jurisdiction).
- Berean Standard Bible (BSB), Open English Bible (OEB) — public-domain dedication / CC0.

**Copyrighted (require permission/licence):** NIV, ESV, NLT, NASB, NET, and most modern translations.

> **[Open Question — blocking]** Translation choice must be made by the student and recorded here with its licence/attribution text before any content is bundled. Meno will **not** fabricate or paraphrase Bible text.

## 6. MVP feature scope

The first two MVP features are **Bible Reader** and **Reading Progress**. They are specified in detail below so they can be built and tested incrementally.

### 6.1 Feature 1 — Bible Reader (Milestone 1)

**User story**
> As a reader, I want to open a Bible book and chapter, read its text in a chosen translation, and move to the next or previous chapter — so that I can read Scripture without friction.

**Functional requirements**
- **FR-1** Browse the list of books available in the bundled translation.
- **FR-2** Open a selected book and chapter and render its verses.
- **FR-3** Move to the previous/next chapter from within the reader.
- **FR-4** Select an available translation (at least one at launch).
- **FR-5** Restore the reader to the last-read location on reopen (shared with Feature 2).

**Acceptance criteria (Given/When/Then, measurable)**
- **AC-1.1** Given the app is opened, when the reader is shown, then the list of books for the selected translation is displayed.
- **AC-1.2** Given a book is selected, when a chapter is chosen, then all verses of that chapter are rendered in canonical order.
- **AC-1.3** Given the last chapter of the current book, when "next" is requested, then the app moves to the first chapter of the next book (and at the final chapter of the Bible, the control is disabled or wraps per a documented rule).
- **AC-1.4** Given the first chapter of Genesis, when "previous" is requested, then the control is disabled (no crash, no negative navigation).
- **AC-1.5** Given the reader is scrolled/positioned in a chapter, then long chapters remain scroll-performant using a virtualized list (no full-chapter `ScrollView` of hundreds of views without virtualization).
- **AC-1.6** Given the app is closed and reopened, then the reader returns to the last-read book and chapter.

### 6.2 Feature 2 — Persistent Reading Progress (Milestone 2)

**User story**
> As a reader, I want my reading activity to be remembered and counted, so that I can see my consistency and stay motivated.

**Functional requirements**
- **FR-6** Mark a chapter as read/completed.
- **FR-7** Completion is **idempotent**: completing the same chapter twice on the same day does not double-count.
- **FR-8** Progress persists across app restarts (SQLite).
- **FR-9** Display basic stats: chapters read, days read, and current streak.

**Acceptance criteria**
- **AC-2.1** Given a chapter is marked read, when progress is queried, then it is reflected in the read set.
- **AC-2.2** Given a chapter was already completed on the same calendar day, when it is completed again, then the stored count is unchanged and no duplicate record is created.
- **AC-2.3** Given completion records exist, when the app is restarted, then the records are still present and stats are unchanged.
- **AC-2.4** Given a user reads on day N and day N+1, when stats are computed, then the current streak is 2; given a missed day, the streak resets per a documented, timezone-aware rule.
- **AC-2.5** Given no completions exist, when stats are shown, then the streak is 0 and counts are 0 (no crash).

## 7. Data model (planned)

```
Translation(id, name, abbreviation, language, licence, attribution)
Book(id, translationId, name, canonicalOrder, testament, chapterCount)
Chapter(translationId, bookId, number, verseCount)
Verse(translationId, bookId, chapterNumber, number, text)

ReadingCompletion(id, translationId, bookId, chapterNumber, completedOn /* local date YYYY-MM-DD */, createdAt)
ReadingProgressState(key, lastTranslationId, lastBookId, lastChapterNumber, updatedAt)
StreakState(currentStreak, longestStreak, lastQualifyingDate)
```

> Field names and exact schema are provisional and will be finalised during Milestone 1. The domain rules (below) are the source of truth and are testable independently of storage.

## 8. Business rules (deterministic, unit-testable)

- **BR-1** A completion is uniquely identified by `(translationId, bookId, chapterNumber, completedOn)`. Inserting a duplicate is a no-op.
- **BR-2** A "day" is determined in the user's local timezone; the day boundary rule must be documented before streak logic is implemented.
- **BR-3** Current streak increments when there is a qualifying completion on consecutive days; a gap of ≥1 missed day resets current streak to 0 (or 1 on the day reading resumes).
- **BR-4** Longest streak = maximum of all historical consecutive-day runs.
- **BR-5** Last-read location updates whenever a chapter is opened (or completed — to be decided).
- **BR-6** Stats are derived purely from stored records (no cached counters that can drift), unless a later ADR justifies caching.

## 9. Testing requirements (planned)

Meaningful unit tests on the **domain layer** (no UI, no device required):
- Duplicate reading completion is a no-op (BR-1).
- Streak boundaries: first day, consecutive days, missed day, longest-streak tracking (BR-3, BR-4).
- Progress persistence round-trip through the repository boundary (BR-5).
- Reading-plan validation (when plans are introduced).
- Reader navigation edge cases: first/last chapter, book boundaries (FR-3).

> Tests will be executed during Build/Verify and the **actual command and result** recorded in `docs/TESTING.md`. This PRD does not claim any test has passed.

## 10. Success metrics (measurable for the assignment)

- All acceptance criteria for Features 1–2 pass in a live demo.
- Domain business rules covered by passing unit tests with the real command/output captured.
- The app is runnable and demonstrable at each meeting milestone.
- Documentation (`PRD`, `ARCHITECTURE`, `DESIGN_SYSTEM`, `TESTING`, `README`) is accurate and maintained.

## 11. Dependencies and constraints

- UI depends on the bundled Bible dataset (blocked by translation licensing decision).
- Progress feature depends on the SQLite persistence layer.
- No backend, auth, or paid service without prior approval per `meno-workflow`.

## 12. Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-10-10 | Initial planning draft created (no code implemented). |
