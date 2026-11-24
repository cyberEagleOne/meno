import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getAppSetting,
  initProgressDb,
  loadProgress,
  markCompleted,
  saveLastRead,
  setAppSetting,
  unmarkCompleted,
} from "../db";
import { deleteReadingGoal, getReadingGoal, saveReadingGoal } from "../goalRepository";
import { setSqlDriver, type SqlDriver, type SqlParam } from "../sqlDriver";

/** Uses Node's real SQLite engine and a disk file, not the memory test driver. */
function openDiskDriver(file: string): SqlDriver & { close: () => void } {
  const db = new DatabaseSync(file);
  const bind = (params: SqlParam[]) => params as (string | number | null | Uint8Array)[];
  const run = async (sql: string, ...params: SqlParam[]) => {
    db.prepare(sql).run(...bind(params));
  };
  return {
    exec: async (sql) => { db.exec(sql); },
    getFirst: async <T,>(sql: string, ...params: SqlParam[]) =>
      (db.prepare(sql).get(...bind(params)) as T | undefined) ?? null,
    getAll: async <T,>(sql: string, ...params: SqlParam[]) =>
      db.prepare(sql).all(...bind(params)) as T[],
    run,
    transaction: async (task) => {
      db.exec("BEGIN IMMEDIATE");
      try {
        await task({ run });
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    close: () => db.close(),
  };
}

describe("disk-backed SQLite repository integration", () => {
  let directory: string;
  let file: string;
  let driver: ReturnType<typeof openDiskDriver> | null;

  const reopen = () => {
    driver?.close();
    driver = openDiskDriver(file);
    setSqlDriver(driver);
  };

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "meno-sqlite-"));
    file = join(directory, "meno.db");
    driver = openDiskDriver(file);
    setSqlDriver(driver);
  });

  afterEach(() => {
    setSqlDriver(null);
    driver?.close();
    driver = null;
    rmSync(directory, { recursive: true, force: true });
  });

  it("initializes idempotently and exposes all application tables", async () => {
    await initProgressDb();
    await initProgressDb();
    const rows = await driver!.getAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    expect(rows.map(({ name }) => name)).toEqual([
      "app_settings", "completed", "last_read", "reading_day", "reading_goal",
    ]);
  });

  it("persists create and read operations after closing and reopening the file", async () => {
    await initProgressDb();
    await saveLastRead({ bookId: "kejadian", chapter: 3, scrollY: 24, openedAt: "2026-11-19T08:00:00.000Z" });
    await markCompleted("kejadian", 3, "2026-11-19T08:01:00.000Z", "2026-11-19");
    reopen();
    await initProgressDb();
    await expect(loadProgress()).resolves.toEqual({
      lastRead: { bookId: "kejadian", chapter: 3, scrollY: 24, openedAt: "2026-11-19T08:00:00.000Z" },
      completed: { "kejadian:3": "2026-11-19T08:01:00.000Z" },
      readingDays: ["2026-11-19"],
    });
  });

  it("updates an existing last-read record and completion without duplicate rows", async () => {
    await initProgressDb();
    await saveLastRead({ bookId: "kejadian", chapter: 1, scrollY: 2, openedAt: "2026-11-18T08:00:00.000Z" });
    await saveLastRead({ bookId: "kejadian", chapter: 2, scrollY: 8, openedAt: "2026-11-19T08:00:00.000Z" });
    await markCompleted("kejadian", 2, "2026-11-19T08:01:00.000Z", "2026-11-19");
    await markCompleted("kejadian", 2, "2026-11-19T08:02:00.000Z", "2026-11-19");
    const state = await loadProgress();
    expect(state.lastRead).toMatchObject({ chapter: 2, scrollY: 8 });
    expect(state.completed).toEqual({ "kejadian:2": "2026-11-19T08:02:00.000Z" });
    expect(state.readingDays).toEqual(["2026-11-19"]);
  });

  it("deletes a completion and keeps it deleted after reopening", async () => {
    await initProgressDb();
    await markCompleted("kejadian", 1, "2026-11-19T08:00:00.000Z", "2026-11-19");
    await unmarkCompleted("kejadian", 1);
    reopen();
    await expect(loadProgress()).resolves.toMatchObject({ completed: {}, readingDays: ["2026-11-19"] });
  });

  it("creates and reads a saved reading goal from disk after reopening", async () => {
    await initProgressDb();
    await saveReadingGoal({ target: 3, note: "Membaca dengan tenang", updatedAt: "2026-11-19T08:00:00.000Z" });
    reopen();
    await initProgressDb();
    await expect(getReadingGoal()).resolves.toEqual({
      target: 3,
      note: "Membaca dengan tenang",
      updatedAt: "2026-11-19T08:00:00.000Z",
    });
  });

  it("updates a saved reading goal in the singleton row", async () => {
    await initProgressDb();
    await saveReadingGoal({ target: 2, note: "Awal", updatedAt: "2026-11-18T08:00:00.000Z" });
    await saveReadingGoal({ target: 5, note: "Diperbarui", updatedAt: "2026-11-19T08:00:00.000Z" });
    await expect(driver!.getAll("SELECT id FROM reading_goal")).resolves.toHaveLength(1);
    await expect(getReadingGoal()).resolves.toEqual({
      target: 5,
      note: "Diperbarui",
      updatedAt: "2026-11-19T08:00:00.000Z",
    });
  });

  it("deletes a reading goal and leaves it absent after reopening", async () => {
    await initProgressDb();
    await saveReadingGoal({ target: 4, note: "Akan dihapus", updatedAt: "2026-11-19T08:00:00.000Z" });
    await deleteReadingGoal();
    reopen();
    await expect(getReadingGoal()).resolves.toBeNull();
  });

  it("rolls back completion creation when a later transaction write fails", async () => {
    await initProgressDb();
    await driver!.exec("CREATE TRIGGER reject_reading_day BEFORE INSERT ON reading_day BEGIN SELECT RAISE(ABORT, 'test failure'); END;");
    await expect(markCompleted("kejadian", 4, "2026-11-19T08:00:00.000Z", "2026-11-19")).rejects.toThrow("test failure");
    await expect(loadProgress()).resolves.toMatchObject({ completed: {}, readingDays: [] });
  });

  it("persists a non-sensitive app setting after reopening", async () => {
    await initProgressDb();
    await expect(getAppSetting("app_lock_enabled")).resolves.toBeNull();
    await setAppSetting("app_lock_enabled", "true");
    reopen();
    await expect(getAppSetting("app_lock_enabled")).resolves.toBe("true");
    await setAppSetting("app_lock_enabled", "false");
    await expect(getAppSetting("app_lock_enabled")).resolves.toBe("false");
    await expect(driver!.getAll("SELECT key FROM app_settings")).resolves.toHaveLength(1);
  });

  it("reports schema initialization errors instead of silently continuing", async () => {
    const sqlite = driver!;
    setSqlDriver({
      ...sqlite,
      exec: async () => { throw new Error("database is read-only"); },
    });
    await expect(initProgressDb()).rejects.toThrow("database is read-only");
  });
});
