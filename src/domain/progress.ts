import type { Bible } from "./types";

export interface LastRead {
  bookId: string;
  chapter: number;
  scrollY: number;
  openedAt: string;
}

/** "bookId:chapter" -> ISO completion date. One record per chapter (idempotent). */
export type CompletedMap = Record<string, string>;

export interface ProgressState {
  lastRead: LastRead | null;
  completed: CompletedMap;
  /** Local calendar days (YYYY-MM-DD) with ≥1 explicit completion — see BR-2/AC-2.6. */
  readingDays: string[];
}

/** Device-local calendar day for an instant (BR-2: a "day" is the local date). */
export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** A persisted reading day must be a plain local calendar date. */
export function isValidReadingDay(day: unknown): day is string {
  return typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day);
}

/** Returns the day list with `day` added exactly once, kept in ascending order. */
export function withReadingDay(days: readonly string[], day: string): string[] {
  if (days.includes(day)) return days as string[];
  return [...days, day].sort();
}

export function chapterKey(bookId: string, chapter: number): string {
  return `${bookId}:${chapter}`;
}

/**
 * Scroll offset to restore when opening a chapter: `null` while the saved
 * last-read still points at a *different* chapter (the caller must wait for
 * the open to be recorded), otherwise the saved offset (clamped at 0).
 */
export function restoreScrollOffset(
  lastRead: LastRead | null,
  bookId: string,
  chapter: number,
): number | null {
  if (!lastRead || lastRead.bookId !== bookId || lastRead.chapter !== chapter) {
    return null;
  }
  return Number.isFinite(lastRead.scrollY) && lastRead.scrollY > 0 ? lastRead.scrollY : 0;
}

export function isCompleted(completed: CompletedMap, bookId: string, chapter: number): boolean {
  return chapterKey(bookId, chapter) in completed;
}

/**
 * Returns the completed map with the chapter set (true) or cleared (false).
 * Idempotent per chapter: marking an already-completed chapter simply keeps
 * a single record for that (bookId, chapter) key, so counts never double.
 */
export function withCompletion(
  completed: CompletedMap,
  bookId: string,
  chapter: number,
  done: boolean,
  now: Date = new Date(),
): CompletedMap {
  const key = chapterKey(bookId, chapter);
  if (done) {
    return { ...completed, [key]: now.toISOString() };
  }
  if (!(key in completed)) return completed;
  const next = { ...completed };
  delete next[key];
  return next;
}

export function completedCount(completed: CompletedMap): number {
  return Object.keys(completed).length;
}

export function doneInBook(
  completed: CompletedMap,
  bookId: string,
  chapterCount: number,
): number {
  let n = 0;
  for (let c = 1; c <= chapterCount; c += 1) {
    if (chapterKey(bookId, c) in completed) n += 1;
  }
  return n;
}

/** Reading milestones are plain chapter-count thresholds (no XP, no streaks). */
export interface Milestone {
  at: number;
  label: string;
}

export const MILESTONES: Milestone[] = [
  { at: 1, label: "Pasal pertama" },
  { at: 10, label: "10 pasal" },
  { at: 50, label: "50 pasal" },
  { at: 100, label: "100 pasal" },
  { at: 250, label: "250 pasal" },
  { at: 500, label: "500 pasal" },
  { at: 1189, label: "Seluruh Alkitab" },
];

export function nextMilestone(total: number): Milestone | null {
  return MILESTONES.find((m) => m.at > total) ?? null;
}

/**
 * Validates persisted progress against the dataset. Records that point at
 * missing books/chapters are dropped; an invalid last-read becomes null.
 * Throws only when the overall shape is unusable (corrupt payload).
 */
export function sanitizeProgress(raw: unknown, bible: Bible): ProgressState {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("corrupt");
  }
  const v = raw as Record<string, unknown>;
  const completedRaw = v.completed;
  if (!completedRaw || typeof completedRaw !== "object" || Array.isArray(completedRaw)) {
    throw new Error("corrupt");
  }
  const completed: CompletedMap = {};
  for (const [key, at] of Object.entries(completedRaw as Record<string, unknown>)) {
    const i = key.lastIndexOf(":");
    if (i <= 0 || typeof at !== "string") continue;
    const bookId = key.slice(0, i);
    const chapter = Number(key.slice(i + 1));
    const book = bible.books.find((b) => b.id === bookId);
    if (book && Number.isInteger(chapter) && chapter >= 1 && chapter <= book.chapters.length) {
      completed[key] = at;
    }
  }
  let lastRead: LastRead | null = null;
  const lr = v.lastRead;
  if (lr && typeof lr === "object" && !Array.isArray(lr)) {
    const cand = lr as Record<string, unknown>;
    if (typeof cand.bookId === "string" && typeof cand.chapter === "number") {
      const book = bible.books.find((b) => b.id === cand.bookId);
      const chapter = cand.chapter;
      if (book && Number.isInteger(chapter) && chapter >= 1 && chapter <= book.chapters.length) {
        lastRead = {
          bookId: cand.bookId,
          chapter,
          scrollY: Number(cand.scrollY) || 0,
          openedAt: String(cand.openedAt ?? new Date().toISOString()),
        };
      }
    }
  }
  // Reading days: tolerate absence (older payloads), drop malformed entries, dedupe.
  const readingDays: string[] = [];
  const daysRaw = v.readingDays;
  if (Array.isArray(daysRaw)) {
    for (const day of daysRaw) {
      if (isValidReadingDay(day) && !readingDays.includes(day)) readingDays.push(day);
    }
    readingDays.sort();
  }
  return { lastRead, completed, readingDays };
}
