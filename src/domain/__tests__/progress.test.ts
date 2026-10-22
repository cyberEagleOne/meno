import { placeholderBible } from "../../data/placeholderBible";
import {
  MILESTONES,
  chapterKey,
  completedCount,
  doneInBook,
  isCompleted,
  isValidReadingDay,
  localDayKey,
  nextMilestone,
  restoreScrollOffset,
  sanitizeProgress,
  withCompletion,
  withReadingDay,
  type CompletedMap,
} from "../progress";

describe("withCompletion (explicit completion, idempotent)", () => {
  it("adds a record when marking done", () => {
    const completed = withCompletion({}, "kejadian", 1, true, new Date("2026-01-05T10:00:00Z"));
    expect(isCompleted(completed, "kejadian", 1)).toBe(true);
    expect(completed[chapterKey("kejadian", 1)]).toBe("2026-01-05T10:00:00.000Z");
  });

  it("does not double-count when marking the same chapter done twice on the same day", () => {
    let completed: CompletedMap = {};
    const morning = new Date("2026-01-05T08:00:00Z");
    const evening = new Date("2026-01-05T18:00:00Z");
    completed = withCompletion(completed, "kejadian", 2, true, morning);
    completed = withCompletion(completed, "kejadian", 2, true, evening);
    expect(completedCount(completed)).toBe(1);
    expect(doneInBook(completed, "kejadian", 50)).toBe(1);
  });

  it("keeps a single record per chapter across different days", () => {
    let completed: CompletedMap = {};
    completed = withCompletion(completed, "mazmur", 1, true, new Date("2026-01-05T08:00:00Z"));
    completed = withCompletion(completed, "mazmur", 1, true, new Date("2026-01-06T08:00:00Z"));
    expect(completedCount(completed)).toBe(1);
  });

  it("removes the record when unmarking, and is a no-op when already absent", () => {
    const done = withCompletion({}, "yohanes", 3, true);
    const undone = withCompletion(done, "yohanes", 3, false);
    expect(completedCount(undone)).toBe(0);
    const again = withCompletion(undone, "yohanes", 3, false);
    expect(again).toBe(undone);
  });
});

describe("completedCount / doneInBook", () => {
  it("counts distinct chapters only", () => {
    let completed: CompletedMap = {};
    for (const [book, ch] of [["kejadian", 1], ["kejadian", 2], ["rut", 1]] as const) {
      completed = withCompletion(completed, book, ch, true);
    }
    expect(completedCount(completed)).toBe(3);
    expect(doneInBook(completed, "kejadian", 50)).toBe(2);
    expect(doneInBook(completed, "rut", 4)).toBe(1);
    expect(doneInBook(completed, "imamat", 27)).toBe(0);
  });
});

describe("milestones", () => {
  it("returns the next threshold above the current total", () => {
    expect(nextMilestone(0)?.at).toBe(1);
    expect(nextMilestone(1)?.at).toBe(10);
    expect(nextMilestone(999)?.at).toBe(1189);
  });

  it("returns null once every milestone is reached", () => {
    expect(nextMilestone(1189)).toBeNull();
  });

  it("uses plain chapter-count thresholds", () => {
    expect(MILESTONES.map((m) => m.at)).toEqual([1, 10, 50, 100, 250, 500, 1189]);
  });
});

describe("sanitizeProgress", () => {
  const valid = {
    lastRead: { bookId: "kejadian", chapter: 3, scrollY: 120, openedAt: "2026-01-05T08:00:00.000Z" },
    completed: { "kejadian:1": "2026-01-05T08:00:00.000Z" },
  };

  it("keeps valid records and last-read", () => {
    const state = sanitizeProgress(valid, placeholderBible);
    expect(state.lastRead).toEqual(valid.lastRead);
    expect(isCompleted(state.completed, "kejadian", 1)).toBe(true);
  });

  it("drops records that point at missing chapters and invalid last-read", () => {
    const state = sanitizeProgress(
      {
        lastRead: { bookId: "kejadian", chapter: 999, scrollY: 10, openedAt: "x" },
        completed: { "kejadian:999": "x", "missing-book:1": "x", "kejadian:2": "y" },
      },
      placeholderBible,
    );
    expect(state.lastRead).toBeNull();
    expect(Object.keys(state.completed)).toEqual(["kejadian:2"]);
  });

  it("throws on corrupt payloads", () => {
    expect(() => sanitizeProgress(null, placeholderBible)).toThrow("corrupt");
    expect(() => sanitizeProgress({ completed: [] }, placeholderBible)).toThrow("corrupt");
    expect(() => sanitizeProgress("nope", placeholderBible)).toThrow("corrupt");
  });

  it("tolerates missing reading days and keeps valid ones sorted and deduped", () => {
    const noDays = sanitizeProgress(valid, placeholderBible);
    expect(noDays.readingDays).toEqual([]);
    const state = sanitizeProgress(
      {
        ...valid,
        readingDays: ["2026-01-06", "2026-01-05", "2026-01-05", "15-01-2026", "", 7],
      },
      placeholderBible,
    );
    expect(state.readingDays).toEqual(["2026-01-05", "2026-01-06"]);
  });
});

describe("localDayKey (device-local calendar day, BR-2)", () => {
  it("formats local dates as YYYY-MM-DD with padding", () => {
    expect(localDayKey(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
    expect(localDayKey(new Date(2026, 10, 15, 23, 59))).toBe("2026-11-15");
    expect(localDayKey(new Date(2026, 11, 31, 0, 0))).toBe("2026-12-31");
  });

  it("uses the local date, not the UTC one", () => {
    // Local-constructed dates near midnight: the day part must come from local getters.
    expect(localDayKey(new Date(2026, 2, 5, 0, 30))).toBe("2026-03-05");
    expect(localDayKey(new Date(2026, 2, 5, 23, 30))).toBe("2026-03-05");
  });
});

describe("isValidReadingDay", () => {
  it("accepts only plain YYYY-MM-DD strings", () => {
    expect(isValidReadingDay("2026-10-15")).toBe(true);
    expect(isValidReadingDay("2026-1-5")).toBe(false);
    expect(isValidReadingDay("2026-10-15T08:00:00.000Z")).toBe(false);
    expect(isValidReadingDay("")).toBe(false);
    expect(isValidReadingDay(7)).toBe(false);
    expect(isValidReadingDay(null)).toBe(false);
  });
});

describe("withReadingDay (AC-2.6 day idempotency)", () => {
  it("adds a day once and keeps ascending order", () => {
    let days = withReadingDay([], "2026-10-15");
    days = withReadingDay(days, "2026-10-14");
    days = withReadingDay(days, "2026-10-16");
    expect(days).toEqual(["2026-10-14", "2026-10-15", "2026-10-16"]);
  });

  it("is a no-op when the day already exists", () => {
    const days = withReadingDay(["2026-10-15"], "2026-10-15");
    expect(days).toEqual(["2026-10-15"]);
  });
});

describe("restoreScrollOffset (reader scroll restoration decision)", () => {
  const lastRead = { bookId: "kejadian", chapter: 5, scrollY: 420, openedAt: "2026-10-15T08:00:00.000Z" };

  it("returns the saved offset when the saved chapter matches the opened chapter", () => {
    expect(restoreScrollOffset(lastRead, "kejadian", 5)).toBe(420);
  });

  it("returns null while the saved last-read points at a different chapter", () => {
    expect(restoreScrollOffset(lastRead, "kejadian", 6)).toBeNull();
    expect(restoreScrollOffset(lastRead, "mazmur", 5)).toBeNull();
  });

  it("returns null when nothing has been read yet", () => {
    expect(restoreScrollOffset(null, "kejadian", 1)).toBeNull();
  });

  it("clamps a zero or invalid saved offset to 0 for the matching chapter", () => {
    expect(restoreScrollOffset({ ...lastRead, scrollY: 0 }, "kejadian", 5)).toBe(0);
    expect(restoreScrollOffset({ ...lastRead, scrollY: Number.NaN }, "kejadian", 5)).toBe(0);
  });
});
