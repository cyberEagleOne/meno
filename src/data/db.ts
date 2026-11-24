import {
  sanitizeProgress,
  type LastRead,
  type ProgressState,
} from "../domain/progress";
import { getSqlDriver } from "./sqlDriver";
import { canonicalBible } from "./canonicalBible";
import { logger } from "../services/logger";

/**
 * Progress persistence. All SQL goes through the injected SqlDriver
 * (expo-sqlite in production; an in-memory fake in tests). Callers must
 * install a driver (setSqlDriver) before using these functions; the
 * ProgressProvider installs the production driver and runs initProgressDb
 * once at startup.
 */
export async function initProgressDb(): Promise<void> {
  const sql = getSqlDriver();
  try {
    await sql.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS last_read (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        book_id TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        scroll_y REAL NOT NULL DEFAULT 0,
        opened_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS completed (
        book_id TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        PRIMARY KEY (book_id, chapter)
      );
      CREATE TABLE IF NOT EXISTS reading_day (
        day TEXT PRIMARY KEY
      );
      CREATE TABLE IF NOT EXISTS reading_goal (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        target INTEGER NOT NULL,
        note TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    logger.info("DATABASE", "sqlite_init_success");
  } catch (err: unknown) {
    logger.error("DATABASE", "sqlite_init_failed", err);
    throw err;
  }
}

interface LastReadRow {
  book_id: string;
  chapter: number;
  scroll_y: number;
  opened_at: string;
}

interface CompletedRow {
  book_id: string;
  chapter: number;
  completed_at: string;
}

/** Loads persisted progress and validates it against the bundled dataset. */
export async function loadProgress(): Promise<ProgressState> {
  const sql = getSqlDriver();
  const [lastRow, completedRows, dayRows] = await Promise.all([
    sql.getFirst<LastReadRow>("SELECT * FROM last_read WHERE id = 1"),
    sql.getAll<CompletedRow>("SELECT * FROM completed"),
    sql.getAll<{ day: string }>("SELECT day FROM reading_day"),
  ]);
  const completed: Record<string, string> = {};
  for (const row of completedRows) {
    completed[`${row.book_id}:${row.chapter}`] = row.completed_at;
  }
  const raw = {
    lastRead: lastRow
      ? {
          bookId: lastRow.book_id,
          chapter: lastRow.chapter,
          scrollY: lastRow.scroll_y,
          openedAt: lastRow.opened_at,
        }
      : null,
    completed,
    readingDays: dayRows.map((row) => row.day),
  };
  // Validate against the dataset so stale/corrupt rows never surface in the UI.
  return sanitizeProgress(raw, canonicalBible);
}

export async function saveLastRead(lastRead: LastRead): Promise<void> {
  const sql = getSqlDriver();
  try {
    await sql.run(
      `INSERT INTO last_read (id, book_id, chapter, scroll_y, opened_at)
       VALUES (1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         book_id = excluded.book_id,
         chapter = excluded.chapter,
         scroll_y = excluded.scroll_y,
         opened_at = excluded.opened_at`,
      lastRead.bookId,
      lastRead.chapter,
      lastRead.scrollY,
      lastRead.openedAt,
    );
    logger.debug("DATABASE", "last_read_saved", {
      bookId: lastRead.bookId,
      chapter: lastRead.chapter,
    });
  } catch (err: unknown) {
    logger.error("DATABASE", "last_read_save_failed", err, {
      bookId: lastRead.bookId,
      chapter: lastRead.chapter,
    });
    throw err;
  }
}

/**
 * Records an explicit completion. Idempotent per chapter (BR-1: the row is
 * upserted, never duplicated) and per day (AC-2.6: reading_day is insert-
 * or-ignore, so N completions on one local day yield exactly one day row).
 * `day` is the device-local calendar date (YYYY-MM-DD) computed by the
 * caller via domain localDayKey — kept as an explicit parameter so tests
 * never depend on the real clock or timezone.
 */
export async function markCompleted(
  bookId: string,
  chapter: number,
  completedAt: string,
  day: string,
): Promise<void> {
  const sql = getSqlDriver();
  try {
    await sql.transaction(async (tx) => {
      await tx.run(
        `INSERT INTO completed (book_id, chapter, completed_at)
         VALUES (?, ?, ?)
         ON CONFLICT(book_id, chapter) DO UPDATE SET completed_at = excluded.completed_at`,
        bookId,
        chapter,
        completedAt,
      );
      await tx.run("INSERT OR IGNORE INTO reading_day (day) VALUES (?)", day);
    });
    logger.info("DATABASE", "chapter_marked_completed", { bookId, chapter, day });
  } catch (err: unknown) {
    logger.error("DATABASE", "mark_completed_failed", err, { bookId, chapter, day });
    throw err;
  }
}

export async function unmarkCompleted(bookId: string, chapter: number): Promise<void> {
  const sql = getSqlDriver();
  try {
    await sql.run("DELETE FROM completed WHERE book_id = ? AND chapter = ?", bookId, chapter);
    logger.info("DATABASE", "chapter_unmarked_completed", { bookId, chapter });
  } catch (err: unknown) {
    logger.error("DATABASE", "unmark_completed_failed", err, { bookId, chapter });
    throw err;
  }
}

export async function getAppSetting(key: string): Promise<string | null> {
  const sql = getSqlDriver();
  const row = await sql.getFirst<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ?",
    key,
  );
  return row?.value ?? null;
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  const sql = getSqlDriver();
  await sql.run(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    value,
    new Date().toISOString(),
  );
}
