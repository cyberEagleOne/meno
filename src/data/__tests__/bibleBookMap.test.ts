import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { SQLiteDatabase } from "expo-sqlite";

import { loadBibleMetadata, loadChapter } from "../bibleRepository";
import { CANONICAL_BOOKS } from "../canonicalBooks";
import {
  BIBLE_BOOK_IDS,
  canonicalIdForDatabaseId,
  databaseIdForCanonicalId,
} from "../bibleBookMap";

const DATABASE_PATH = join(process.cwd(), "assets/database/ilt3.sqlite");
const testWithBundledDatabase = existsSync(DATABASE_PATH) ? it : it.skip;

function adapter(db: DatabaseSync): SQLiteDatabase {
  return {
    getAllAsync: async (sql: string, ...params: unknown[]) =>
      db.prepare(sql).all(...(params as (string | number)[])),
    getFirstAsync: async (sql: string, ...params: unknown[]) =>
      db.prepare(sql).get(...(params as (string | number)[])) ?? null,
  } as unknown as SQLiteDatabase;
}

describe("ILT3 canonical mapping", () => {
  it("maps all 66 database IDs to stable canonical IDs", () => {
    expect(BIBLE_BOOK_IDS).toHaveLength(66);
    expect(canonicalIdForDatabaseId(0)).toBe("kejadian");
    expect(canonicalIdForDatabaseId(5)).toBe("yosua");
    expect(canonicalIdForDatabaseId(6)).toBe("hakim-hakim");
    expect(canonicalIdForDatabaseId(39)).toBe("matius");
    expect(canonicalIdForDatabaseId(65)).toBe("wahyu");
    expect(canonicalIdForDatabaseId(-1)).toBeUndefined();
    expect(canonicalIdForDatabaseId(66)).toBeUndefined();
    expect(databaseIdForCanonicalId("yosua")).toBe(5);
    expect(databaseIdForCanonicalId("tidak-ada")).toBeUndefined();
  });

  testWithBundledDatabase("matches the bundled ILT3 book order, names, and chapter counts", () => {
    const db = new DatabaseSync(DATABASE_PATH);
    try {
      const rows = db
        .prepare("SELECT book_id, name, chapter_count FROM books ORDER BY book_id")
        .all() as { book_id: number; name: string; chapter_count: number }[];
      expect(rows).toHaveLength(CANONICAL_BOOKS.length);
      rows.forEach((row, index) => {
        expect(row.book_id).toBe(index);
        // ILT3 spells Yosua as "Yoshua"; the stable app ID remains `yosua`.
        const expectedName = index === 5 ? "Yoshua" : CANONICAL_BOOKS[index]!.name;
        expect(row.name.toLowerCase()).toBe(expectedName.toLowerCase());
        expect(row.chapter_count).toBe(CANONICAL_BOOKS[index]!.chapterCount);
      });
      expect(rows.reduce((sum, row) => sum + row.chapter_count, 0)).toBe(1189);
    } finally {
      db.close();
    }
  });

  testWithBundledDatabase("loads validated metadata and real verses through the repository boundary", async () => {
    const db = new DatabaseSync(DATABASE_PATH);
    try {
      const bible = await loadBibleMetadata(adapter(db));
      expect(bible.books).toHaveLength(66);
      expect(bible.books.reduce((sum, book) => sum + book.chapters.length, 0)).toBe(1189);
      expect(bible.translation).toMatchObject({
        shortName: "ILT3",
        locale: "in",
        copyright: "Yayasan Lentera Bangsa",
      });

      const chapter = await loadChapter(adapter(db), "kejadian", 1);
      expect(chapter?.number).toBe(1);
      expect(chapter?.verses.length).toBeGreaterThan(0);
      expect(chapter?.verses[0]).toEqual({
        number: 1,
        text: expect.any(String),
      });
      await expect(loadChapter(adapter(db), "tidak-ada", 1)).resolves.toBeNull();
      await expect(loadChapter(adapter(db), "kejadian", 0)).resolves.toBeNull();
    } finally {
      db.close();
    }
  });

  testWithBundledDatabase("opens the real translation with integrity and Indonesian metadata", () => {
    const db = new DatabaseSync(DATABASE_PATH);
    try {
      expect(db.prepare("PRAGMA integrity_check").get()).toEqual({ integrity_check: "ok" });
      expect(db.prepare("SELECT COUNT(*) AS count FROM verses").get()).toEqual({ count: 31167 });
      expect(
        db.prepare("SELECT short_name, long_name, locale FROM translation WHERE id = 1").get(),
      ).toEqual({
        short_name: "ILT3",
        long_name: "Indonesian Literal Translation 3",
        locale: "in",
      });
      expect(
        db.prepare("SELECT text FROM verses WHERE book_id = 0 AND chapter = 1 AND verse = 1").get(),
      ).toEqual(expect.objectContaining({ text: expect.any(String) }));
    } finally {
      db.close();
    }
  });
});
