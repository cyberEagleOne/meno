import type { SqlDriver, SqlParam } from "./sqlDriver";

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

const STORAGE_KEYS = {
  LAST_READ: "meno_db_last_read",
  COMPLETED: "meno_db_completed",
  READING_DAYS: "meno_db_reading_days",
};

const loadJson = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return fallback;
};

const saveJson = <T>(key: string, value: T): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // ignore
  }
};

/**
 * Web-compatible storage driver using localStorage.
 * Does NOT import expo-sqlite to prevent Metro web bundling worker chunk errors.
 */
export async function createExpoSqliteDriver(): Promise<SqlDriver> {
  let lastRead: LastReadRow | null = loadJson<LastReadRow | null>(STORAGE_KEYS.LAST_READ, null);
  const completedMap: Record<string, CompletedRow> = loadJson<Record<string, CompletedRow>>(
    STORAGE_KEYS.COMPLETED,
    {},
  );
  const readingDaysMap: Record<string, { day: string }> = loadJson<Record<string, { day: string }>>(
    STORAGE_KEYS.READING_DAYS,
    {},
  );

  const run = async (sql: string, ...params: SqlParam[]): Promise<void> => {
    if (/INSERT INTO last_read/i.test(sql)) {
      const [book_id, chapter, scroll_y, opened_at] = params as [
        string,
        number,
        number,
        string,
      ];
      lastRead = { book_id, chapter, scroll_y, opened_at };
      saveJson(STORAGE_KEYS.LAST_READ, lastRead);
      return;
    }
    if (/INSERT INTO completed/i.test(sql)) {
      const [book_id, chapter, completed_at] = params as [string, number, string];
      completedMap[`${book_id}:${chapter}`] = { book_id, chapter, completed_at };
      saveJson(STORAGE_KEYS.COMPLETED, completedMap);
      return;
    }
    if (/INSERT OR IGNORE INTO reading_day/i.test(sql)) {
      const [day] = params as [string];
      if (!readingDaysMap[day]) {
        readingDaysMap[day] = { day };
        saveJson(STORAGE_KEYS.READING_DAYS, readingDaysMap);
      }
      return;
    }
    if (/DELETE FROM completed/i.test(sql)) {
      const [book_id, chapter] = params as [string, number];
      delete completedMap[`${book_id}:${chapter}`];
      saveJson(STORAGE_KEYS.COMPLETED, completedMap);
      return;
    }
  };

  return {
    async exec(_sql: string) {
      // Schema is simulated in localStorage key-value storage
    },
    async getFirst<T>(sql: string): Promise<T | null> {
      if (/FROM last_read/i.test(sql)) {
        return (lastRead as unknown as T) ?? null;
      }
      return null;
    },
    async getAll<T>(sql: string): Promise<T[]> {
      if (/FROM reading_day/i.test(sql)) {
        return Object.values(readingDaysMap) as unknown as T[];
      }
      if (/FROM completed/i.test(sql)) {
        return Object.values(completedMap) as unknown as T[];
      }
      return [];
    },
    run,
    async transaction(task) {
      await task({ run });
    },
  };
}
