import { initProgressDb, loadProgress, saveLastRead } from "../db";
import { setSqlDriver } from "../sqlDriver";
import { createMemoryDriver } from "./support/memoryDriver";

/** Persistence round-trip through the repository boundary (PRD FR-8, BR-5, RQ-4). */
describe("db persistence round-trip", () => {
  afterEach(() => setSqlDriver(null));

  it("initProgressDb creates the last_read, completed, and reading_day tables", async () => {
    const driver = createMemoryDriver();
    setSqlDriver(driver);
    await initProgressDb();
    const sql = driver.execLog.join("\n");
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS last_read/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS completed/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS reading_day/i);
  });

  it("an empty database loads as empty progress", async () => {
    setSqlDriver(createMemoryDriver());
    await initProgressDb();
    await expect(loadProgress()).resolves.toEqual({ lastRead: null, completed: {}, readingDays: [] });
  });

  it("saveLastRead round-trips last-read through loadProgress", async () => {
    setSqlDriver(createMemoryDriver());
    await initProgressDb();
    const lastRead = {
      bookId: "kejadian",
      chapter: 3,
      scrollY: 120.5,
      openedAt: "2026-10-15T08:00:00.000Z",
    };
    await saveLastRead(lastRead);
    const state = await loadProgress();
    expect(state.lastRead).toEqual(lastRead);
    expect(state.completed).toEqual({});
  });

  it("saveLastRead upserts the single last_read row", async () => {
    const driver = createMemoryDriver();
    setSqlDriver(driver);
    await initProgressDb();
    await saveLastRead({ bookId: "kejadian", chapter: 1, scrollY: 0, openedAt: "2026-10-15T08:00:00.000Z" });
    await saveLastRead({ bookId: "matius", chapter: 5, scrollY: 42, openedAt: "2026-10-15T09:00:00.000Z" });
    expect(driver.completedRows()).toHaveLength(0);
    expect(driver.lastReadRow()).toMatchObject({ book_id: "matius", chapter: 5, scroll_y: 42 });
    const state = await loadProgress();
    expect(state.lastRead).toMatchObject({ bookId: "matius", chapter: 5, scrollY: 42 });
  });

  it("state written before a simulated restart is still readable after it", async () => {
    const driverA = createMemoryDriver();
    setSqlDriver(driverA);
    await initProgressDb();
    await saveLastRead({ bookId: "mazmur", chapter: 23, scrollY: 7, openedAt: "2026-10-14T21:00:00.000Z" });
    await driverA.run(
      "INSERT INTO completed (book_id, chapter, completed_at) VALUES (?, ?, ?)",
      "kejadian",
      1,
      "2026-10-14T21:05:00.000Z",
    );
    await driverA.run("INSERT OR IGNORE INTO reading_day (day) VALUES (?)", "2026-10-14");

    // A fresh driver seeded from the old driver's state models an app restart.
    setSqlDriver(createMemoryDriver(driverA.snapshot()));
    const state = await loadProgress();
    expect(state.lastRead).toMatchObject({ bookId: "mazmur", chapter: 23, scrollY: 7 });
    expect(state.completed).toEqual({ "kejadian:1": "2026-10-14T21:05:00.000Z" });
    expect(state.readingDays).toEqual(["2026-10-14"]);
  });

  it("corrupt rows are dropped by validation and never surface", async () => {
    setSqlDriver(
      createMemoryDriver({
        lastRead: {
          id: 1,
          book_id: "buku-tidak-ada",
          chapter: 99,
          scroll_y: 0,
          opened_at: "2026-10-15T08:00:00.000Z",
        },
        completed: [
          { book_id: "buku-tidak-ada", chapter: 1, completed_at: "2026-10-15T08:00:00.000Z" },
          { book_id: "kejadian", chapter: 999, completed_at: "2026-10-15T08:00:00.000Z" },
          { book_id: "kejadian", chapter: 2, completed_at: "2026-10-15T08:00:00.000Z" },
        ],
        readingDays: [{ day: "2026-10-15" }, { day: "not-a-day" }, { day: "15-10-2026" }],
      }),
    );
    const state = await loadProgress();
    expect(state.lastRead).toBeNull();
    expect(state.completed).toEqual({ "kejadian:2": "2026-10-15T08:00:00.000Z" });
    expect(state.readingDays).toEqual(["2026-10-15"]);
  });

  it("fails loudly when no driver is installed", async () => {
    setSqlDriver(null);
    await expect(loadProgress()).rejects.toThrow(/driver not installed/i);
  });
});
