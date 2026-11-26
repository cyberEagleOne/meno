import { getDailyVerseOffset, getLocalDateKey } from "../dailyVerseRepository";

describe("local Daily Verse date selection", () => {
  it("formats the device-local calendar date", () => {
    const date = new Date(2026, 10, 26, 23, 59);
    expect(getLocalDateKey(date)).toBe("2026-11-26");
  });

  it("selects the same ordinal for the same date and a new ordinal the next day", () => {
    expect(getDailyVerseOffset("2026-11-26", 1000)).toBe(
      getDailyVerseOffset("2026-11-26", 1000),
    );
    expect(getDailyVerseOffset("2026-11-27", 1000)).not.toBe(
      getDailyVerseOffset("2026-11-26", 1000),
    );
  });

  it("wraps ordinals within the available verses, including dates before epoch", () => {
    expect(getDailyVerseOffset("1970-01-01", 7)).toBe(0);
    expect(getDailyVerseOffset("1970-01-08", 7)).toBe(0);
    expect(getDailyVerseOffset("1969-12-31", 7)).toBe(6);
  });

  it("rejects invalid dates and empty verse inventories", () => {
    expect(() => getDailyVerseOffset("2026-02-30", 10)).toThrow("valid calendar date");
    expect(() => getDailyVerseOffset("2026-1-01", 10)).toThrow("YYYY-MM-DD");
    expect(() => getDailyVerseOffset("2026-11-26", 0)).toThrow("at least one verse");
  });
});
