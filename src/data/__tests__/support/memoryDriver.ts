import type { SqlDriver } from "../../sqlDriver";

interface LastReadRow {
  id: number;
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

export interface MemoryDriver extends SqlDriver {
  /** Statements passed to exec() — lets tests assert schema setup. */
  readonly execLog: string[];
  /** Raw last_read row (single-row table), or null. */
  lastReadRow(): LastReadRow | null;
  /** Raw completed rows — lets tests assert DB-level idempotency (one row per chapter). */
  completedRows(): CompletedRow[];
  /** Raw reading-day rows — lets tests assert AC-2.6 day idempotency. */
  readingDayRows(): { day: string }[];
  /** Serializes state so a second driver can simulate an app restart. */
  snapshot(): { lastRead: LastReadRow | null; completed: CompletedRow[]; readingDays: { day: string }[] };
  /** Fail a future run call, counted from the next SQL statement. */
  failOnNextRun(offset?: number): void;
}

export interface MemorySeed {
  lastRead?: LastReadRow | null;
  completed?: CompletedRow[];
  readingDays?: { day: string }[];
}

/**
 * In-memory fake of the exact SQL statements db.ts issues. Statements are
 * recognised explicitly and anything unknown throws, so SQL drift in db.ts
 * fails tests instead of being silently ignored. Upsert semantics mirror
 * SQLite's ON CONFLICT DO UPDATE for the statements the app uses.
 */
export function createMemoryDriver(seed?: MemorySeed): MemoryDriver {
  let lastRead: LastReadRow | null = seed?.lastRead ?? null;
  const completed = new Map<string, CompletedRow>();
  for (const row of seed?.completed ?? []) {
    completed.set(`${row.book_id}:${row.chapter}`, row);
  }
  const readingDays = new Map<string, { day: string }>();
  for (const row of seed?.readingDays ?? []) {
    readingDays.set(row.day, row);
  }
  const execLog: string[] = [];
  let runCount = 0;
  let failureRun: number | null = null;

  function unsupported(sql: string): never {
    throw new Error(`memoryDriver: unsupported SQL: ${sql.trim().replace(/\s+/g, " ").slice(0, 80)}`);
  }

  return {
    execLog,
    lastReadRow: () => lastRead,
    completedRows: () => [...completed.values()],
    readingDayRows: () => [...readingDays.values()],
    snapshot: () => ({
      lastRead,
      completed: [...completed.values()],
      readingDays: [...readingDays.values()],
    }),
    failOnNextRun(offset = 1) {
      failureRun = runCount + offset;
    },
    async transaction(task) {
      const beforeLastRead = lastRead;
      const beforeCompleted = new Map(completed);
      const beforeReadingDays = new Map(readingDays);
      try {
        await task({ run: this.run.bind(this) });
      } catch (error) {
        lastRead = beforeLastRead;
        completed.clear();
        beforeCompleted.forEach((row, key) => completed.set(key, row));
        readingDays.clear();
        beforeReadingDays.forEach((row, key) => readingDays.set(key, row));
        throw error;
      }
    },
    async exec(sql) {
      execLog.push(sql);
      if (/^\s*PRAGMA/i.test(sql) || /CREATE TABLE IF NOT EXISTS/i.test(sql)) return;
      unsupported(sql);
    },
    async getFirst<T>(sql: string): Promise<T | null> {
      if (/FROM last_read/i.test(sql)) return lastRead as unknown as T | null;
      unsupported(sql);
    },
    async getAll<T>(sql: string): Promise<T[]> {
      if (/FROM reading_day/i.test(sql)) return [...readingDays.values()] as unknown as T[];
      if (/FROM completed/i.test(sql)) return [...completed.values()] as unknown as T[];
      unsupported(sql);
    },
    async run(sql: string, ...params: unknown[]) {
      runCount += 1;
      if (runCount === failureRun) {
        failureRun = null;
        throw new Error(`memoryDriver: injected failure on run ${runCount}`);
      }
      if (/INSERT INTO last_read/i.test(sql)) {
        const [book_id, chapter, scroll_y, opened_at] = params as [string, number, number, string];
        lastRead = { id: 1, book_id, chapter, scroll_y, opened_at };
        return;
      }
      if (/INSERT INTO completed/i.test(sql)) {
        const [book_id, chapter, completed_at] = params as [string, number, string];
        completed.set(`${book_id}:${chapter}`, { book_id, chapter, completed_at });
        return;
      }
      if (/INSERT OR IGNORE INTO reading_day/i.test(sql)) {
        const [day] = params as [string];
        // INSERT OR IGNORE: keep the first row for a day, ignore later inserts.
        if (!readingDays.has(day)) readingDays.set(day, { day });
        return;
      }
      if (/DELETE FROM completed/i.test(sql)) {
        const [book_id, chapter] = params as [string, number];
        completed.delete(`${book_id}:${chapter}`);
        return;
      }
      unsupported(sql);
    },
  };
}
