import { initProgressDb, loadProgress, markCompleted, unmarkCompleted } from "../db";
import { setSqlDriver } from "../sqlDriver";
import { createMemoryDriver } from "./support/memoryDriver";

/**
 * Completion idempotency at the database layer (PRD BR-1, FR-7, RQ-5):
 * one row per (book_id, chapter) regardless of how often it is marked,
 * and one row per local day for reading days (PRD AC-2.6).
 */
describe("db completion idempotency", () => {
  afterEach(() => setSqlDriver(null));

  async function setup() {
    const driver = createMemoryDriver();
    setSqlDriver(driver);
    await initProgressDb();
    return driver;
  }

  it("marking the same chapter twice stores exactly one row", async () => {
    const driver = await setup();
    await markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15");
    await markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15");
    expect(driver.completedRows()).toHaveLength(1);
    expect(driver.readingDayRows()).toEqual([{ day: "2026-10-15" }]);
  });

  it("rolls back completion when the reading-day write fails", async () => {
    const driver = await setup();
    driver.failOnNextRun(2);

    await expect(
      markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15"),
    ).rejects.toThrow("injected failure");

    expect(driver.completedRows()).toEqual([]);
    expect(driver.readingDayRows()).toEqual([]);
  });

  it("does not write a reading day when the completion write fails", async () => {
    const driver = await setup();
    driver.failOnNextRun();

    await expect(
      markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15"),
    ).rejects.toThrow("injected failure");

    expect(driver.completedRows()).toEqual([]);
    expect(driver.readingDayRows()).toEqual([]);
  });

  it("re-marking on a later day updates the timestamp but not the row count", async () => {
    const driver = await setup();
    await markCompleted("kejadian", 1, "2026-10-14T08:00:00.000Z", "2026-10-14");
    await markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15");
    expect(driver.completedRows()).toEqual([
      { book_id: "kejadian", chapter: 1, completed_at: "2026-10-15T08:00:00.000Z" },
    ]);
    // The completed row's first day is lost to the overwrite, but the reading_day
    // history keeps both days — this is what makes AC-2.6 computable.
    expect(driver.readingDayRows()).toEqual([{ day: "2026-10-14" }, { day: "2026-10-15" }]);
    const state = await loadProgress();
    expect(state.readingDays).toEqual(["2026-10-14", "2026-10-15"]);
  });

  it("multiple chapters completed on one day count as exactly one reading day", async () => {
    const driver = await setup();
    await markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15");
    await markCompleted("kejadian", 2, "2026-10-15T08:01:00.000Z", "2026-10-15");
    await markCompleted("matius", 1, "2026-10-15T22:59:00.000Z", "2026-10-15");
    expect(driver.completedRows()).toHaveLength(3);
    expect(driver.readingDayRows()).toEqual([{ day: "2026-10-15" }]);
    const state = await loadProgress();
    expect(state.readingDays).toEqual(["2026-10-15"]);
  });

  it("completions across different days produce one row per day (AC-2.6)", async () => {
    await setup();
    await markCompleted("kejadian", 1, "2026-10-14T08:00:00.000Z", "2026-10-14");
    await markCompleted("kejadian", 2, "2026-10-15T08:00:00.000Z", "2026-10-15");
    await markCompleted("matius", 1, "2026-10-17T08:00:00.000Z", "2026-10-17");
    const state = await loadProgress();
    expect(state.readingDays).toEqual(["2026-10-14", "2026-10-15", "2026-10-17"]);
  });

  it("repeated completion on the same day never doubles the day count", async () => {
    await setup();
    for (let i = 0; i < 5; i += 1) {
      await markCompleted("yohanes", 3, `2026-10-15T08:0${i}:00.000Z`, "2026-10-15");
    }
    const state = await loadProgress();
    expect(state.completed).toEqual({ "yohanes:3": "2026-10-15T08:04:00.000Z" });
    expect(state.readingDays).toEqual(["2026-10-15"]);
  });

  it("unmarking removes exactly that chapter's row but keeps the reading day", async () => {
    const driver = await setup();
    await markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15");
    await markCompleted("kejadian", 2, "2026-10-15T08:01:00.000Z", "2026-10-15");
    await unmarkCompleted("kejadian", 1);
    expect(driver.completedRows()).toEqual([
      { book_id: "kejadian", chapter: 2, completed_at: "2026-10-15T08:01:00.000Z" },
    ]);
    // Reading days are historical: undoing a chapter does not erase the day.
    expect(driver.readingDayRows()).toEqual([{ day: "2026-10-15" }]);
    const state = await loadProgress();
    expect(state.readingDays).toEqual(["2026-10-15"]);
  });

  it("mark → unmark → mark ends with one row", async () => {
    const driver = await setup();
    await markCompleted("kejadian", 1, "2026-10-15T08:00:00.000Z", "2026-10-15");
    await unmarkCompleted("kejadian", 1);
    await markCompleted("kejadian", 1, "2026-10-15T09:00:00.000Z", "2026-10-15");
    expect(driver.completedRows()).toHaveLength(1);
    const state = await loadProgress();
    expect(state.completed).toEqual({ "kejadian:1": "2026-10-15T09:00:00.000Z" });
    expect(state.readingDays).toEqual(["2026-10-15"]);
  });

  it("the loaded count never doubles after repeated marking", async () => {
    await setup();
    for (let i = 0; i < 5; i += 1) {
      await markCompleted("yohanes", 3, `2026-10-15T08:0${i}:00.000Z`, "2026-10-15");
    }
    const state = await loadProgress();
    expect(Object.keys(state.completed)).toEqual(["yohanes:3"]);
    expect(state.readingDays).toEqual(["2026-10-15"]);
  });

  it("reading days survive a simulated restart", async () => {
    const driverA = await setup();
    await markCompleted("kejadian", 1, "2026-10-14T21:00:00.000Z", "2026-10-14");
    await markCompleted("kejadian", 2, "2026-10-15T21:00:00.000Z", "2026-10-15");
    setSqlDriver(createMemoryDriver(driverA.snapshot()));
    const state = await loadProgress();
    expect(state.readingDays).toEqual(["2026-10-14", "2026-10-15"]);
  });
});
