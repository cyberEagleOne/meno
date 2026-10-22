import {
  TOTAL_CHAPTERS,
  TESTAMENT_TOTALS,
  booksByTestament,
  chapterKey,
  getBookById,
  isValidChapter,
  testamentOf,
} from "../canon";
import { placeholderBible } from "../placeholderBible";

/** Canon metadata and route-parameter validation helpers (supports FR-1..FR-3, RQ-3). */
describe("canon helpers", () => {
  const firstBook = placeholderBible.books[0]!;
  const matius = getBookById(placeholderBible, "matius")!;

  it("splits testaments at canonical order 39/40", () => {
    expect(testamentOf(firstBook)).toBe("PL");
    expect(testamentOf(getBookById(placeholderBible, "maleakhi")!)).toBe("PL");
    expect(testamentOf(matius)).toBe("PB");
    expect(testamentOf(getBookById(placeholderBible, "wahyu")!)).toBe("PB");
  });

  it("reports the canonical totals (66 books, 1189 chapters)", () => {
    expect(placeholderBible.books).toHaveLength(66);
    expect(TOTAL_CHAPTERS).toBe(1189);
    expect(TESTAMENT_TOTALS).toEqual({
      PL: { books: 39, chapters: 929 },
      PB: { books: 27, chapters: 260 },
    });
  });

  it("keeps canonical order sequential and ids unique", () => {
    const ids = new Set<string>();
    placeholderBible.books.forEach((book, index) => {
      expect(book.canonicalOrder).toBe(index + 1);
      expect(ids.has(book.id)).toBe(false);
      ids.add(book.id);
    });
  });

  it("getBookById finds books by slug and misses on unknown ids", () => {
    expect(firstBook.id).toBe("kejadian");
    expect(getBookById(placeholderBible, "kejadian")?.name).toBe("Kejadian");
    expect(getBookById(placeholderBible, "tidak-ada")).toBeUndefined();
  });

  it("booksByTestament partitions the canon without overlap", () => {
    const pl = booksByTestament(placeholderBible, "PL");
    const pb = booksByTestament(placeholderBible, "PB");
    expect(pl).toHaveLength(39);
    expect(pb).toHaveLength(27);
    expect(pl[0]?.id).toBe("kejadian");
    expect(pb[0]?.id).toBe("matius");
    expect(pl.length + pb.length).toBe(placeholderBible.books.length);
  });

  it("isValidChapter accepts only chapters inside the book", () => {
    expect(isValidChapter(placeholderBible, "kejadian", 1)).toBe(true);
    expect(isValidChapter(placeholderBible, "kejadian", 50)).toBe(true);
    expect(isValidChapter(placeholderBible, "kejadian", 51)).toBe(false);
    expect(isValidChapter(placeholderBible, "kejadian", 0)).toBe(false);
    expect(isValidChapter(placeholderBible, "kejadian", 1.5)).toBe(false);
    expect(isValidChapter(placeholderBible, "wahyu", 22)).toBe(true);
    expect(isValidChapter(placeholderBible, "wahyu", 23)).toBe(false);
    expect(isValidChapter(placeholderBible, "tidak-ada", 1)).toBe(false);
  });

  it("chapterKey formats the progress-map key", () => {
    expect(chapterKey("kejadian", 1)).toBe("kejadian:1");
  });
});
