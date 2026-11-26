import { loadDailyVerse } from "../bibleRepository";
import { getDailyVerseOffset } from "../dailyVerseRepository";

describe("ILT3 daily verse database lookup", () => {
  it("returns the actual ordered database verse and canonical reader reference", async () => {
    const row = { book_id: 42, book_name: "Yohanes", chapter: 3, verse: 16, text: "Teks ILT3" };
    const db = {
      getFirstAsync: jest.fn()
        .mockResolvedValueOnce({ count: 40000 })
        .mockResolvedValueOnce(row),
    };

    await expect(loadDailyVerse(db as never, "2026-11-26")).resolves.toEqual({
      reference: "Yohanes 3:16",
      text: "Teks ILT3",
      translation: "ILT3",
      bookId: "yohanes",
      chapter: 3,
    });

    expect(db.getFirstAsync).toHaveBeenCalledTimes(2);
    expect(db.getFirstAsync.mock.calls[1][1]).toBe(getDailyVerseOffset("2026-11-26", 40000));
    expect(db.getFirstAsync.mock.calls[1][0]).toContain("JOIN books");
  });

  it("returns empty when the bundled verse table is empty", async () => {
    const db = { getFirstAsync: jest.fn().mockResolvedValue({ count: 0 }) };
    await expect(loadDailyVerse(db as never, "2026-11-26")).resolves.toBeNull();
    expect(db.getFirstAsync).toHaveBeenCalledTimes(1);
  });
});
