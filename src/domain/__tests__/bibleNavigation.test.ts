import { placeholderBible } from "../../data/placeholderBible";
import {
  getBook,
  getChapter,
  getNextChapter,
  getPreviousChapter,
} from "../bibleNavigation";
import type { Bible } from "../types";

const bible: Bible = {
  books: [
    {
      id: "alpha",
      name: "Alpha",
      canonicalOrder: 1,
      chapters: [
        { number: 1, verses: [] },
        { number: 2, verses: [] },
      ],
    },
    {
      id: "beta",
      name: "Beta",
      canonicalOrder: 2,
      chapters: [{ number: 1, verses: [] }],
    },
    {
      id: "gamma",
      name: "Gamma",
      canonicalOrder: 3,
      chapters: [{ number: 1, verses: [] }, { number: 2, verses: [] }],
    },
  ],
};

describe("getBook / getChapter", () => {
  it("finds a book by id", () => {
    expect(getBook(bible, "beta")?.name).toBe("Beta");
  });

  it("returns undefined for an unknown book", () => {
    expect(getBook(bible, "missing")).toBeUndefined();
  });

  it("finds a chapter by number", () => {
    expect(getChapter(bible, "alpha", 2)?.number).toBe(2);
  });

  it("returns undefined for an unknown chapter", () => {
    expect(getChapter(bible, "alpha", 99)).toBeUndefined();
  });
});

describe("getNextChapter", () => {
  it("advances within a book", () => {
    expect(getNextChapter(bible, "alpha", 1)).toEqual({ bookId: "alpha", chapterNumber: 2 });
  });

  it("crosses into the first chapter of the next book", () => {
    expect(getNextChapter(bible, "alpha", 2)).toEqual({ bookId: "beta", chapterNumber: 1 });
  });

  it("crosses between later books", () => {
    expect(getNextChapter(bible, "beta", 1)).toEqual({ bookId: "gamma", chapterNumber: 1 });
  });

  it("returns null at the end of the dataset", () => {
    expect(getNextChapter(bible, "gamma", 2)).toBeNull();
  });

  it("returns null for an unknown location", () => {
    expect(getNextChapter(bible, "missing", 1)).toBeNull();
    expect(getNextChapter(bible, "alpha", 99)).toBeNull();
  });
});

describe("getPreviousChapter", () => {
  it("returns null at the beginning of the dataset", () => {
    expect(getPreviousChapter(bible, "alpha", 1)).toBeNull();
  });

  it("moves back within a book", () => {
    expect(getPreviousChapter(bible, "alpha", 2)).toEqual({ bookId: "alpha", chapterNumber: 1 });
  });

  it("crosses to the last chapter of the previous book", () => {
    expect(getPreviousChapter(bible, "beta", 1)).toEqual({ bookId: "alpha", chapterNumber: 2 });
  });

  it("crosses between later books to the last chapter", () => {
    expect(getPreviousChapter(bible, "gamma", 1)).toEqual({ bookId: "beta", chapterNumber: 1 });
  });

  it("returns null for an unknown location", () => {
    expect(getPreviousChapter(bible, "missing", 1)).toBeNull();
  });

  it("returns null for an unknown chapter in a known book", () => {
    expect(getPreviousChapter(bible, "alpha", 99)).toBeNull();
  });
});

describe("empty-chapter boundary handling", () => {
  const withEmptyChapters: Bible = {
    books: [
      { id: "empty", name: "Empty", canonicalOrder: 1, chapters: [] },
      { id: "one", name: "One", canonicalOrder: 2, chapters: [{ number: 1, verses: [] }] },
      { id: "trailing", name: "Trailing", canonicalOrder: 3, chapters: [] },
    ],
  };

  it("does not move next into a following book that has no chapters", () => {
    expect(getNextChapter(withEmptyChapters, "one", 1)).toBeNull();
  });

  it("does not move previous into a preceding book that has no chapters", () => {
    expect(getPreviousChapter(withEmptyChapters, "one", 1)).toBeNull();
  });

  it("returns undefined when reading a chapter from a book with no chapters", () => {
    expect(getChapter(withEmptyChapters, "empty", 1)).toBeUndefined();
  });
});

describe("placeholder dataset boundaries", () => {
  it("has no previous chapter before the first", () => {
    const firstBook = placeholderBible.books[0];
    expect(getPreviousChapter(placeholderBible, firstBook.id, 1)).toBeNull();
  });

  it("has no next chapter after the last", () => {
    const lastBook = placeholderBible.books[placeholderBible.books.length - 1];
    const lastChapter = lastBook.chapters[lastBook.chapters.length - 1];
    expect(getNextChapter(placeholderBible, lastBook.id, lastChapter.number)).toBeNull();
  });

  it("labels every synthetic verse as not Scripture", () => {
    for (const book of placeholderBible.books) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          expect(verse.text).toContain("not Scripture");
        }
      }
    }
  });

  it("keeps the placeholder dataset in canonical order", () => {
    const orders = placeholderBible.books.map((book) => book.canonicalOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});
