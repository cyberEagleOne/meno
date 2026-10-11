import type { Bible, Book, Chapter, ChapterLocation } from "./types";

/**
 * Ordering contract: sequencing relies on array order, not on the
 * `canonicalOrder` field. `bible.books` must be supplied in canonical order and
 * each `book.chapters` in ascending chapter order — the same convention already
 * used for chapters and verses. `canonicalOrder` is retained as metadata
 * (display / future use) but is never read here. The invariant test
 * "placeholder dataset is in canonical order" guards this against regressions.
 */
export function getBook(bible: Bible, bookId: string): Book | undefined {
  return bible.books.find((book) => book.id === bookId);
}

export function getChapter(
  bible: Bible,
  bookId: string,
  chapterNumber: number,
): Chapter | undefined {
  const book = getBook(bible, bookId);
  if (!book) {
    return undefined;
  }
  return book.chapters.find((chapter) => chapter.number === chapterNumber);
}

function locate(
  bible: Bible,
  bookId: string,
  chapterNumber: number,
): { bookIndex: number; chapterIndex: number } | null {
  const bookIndex = bible.books.findIndex((book) => book.id === bookId);
  if (bookIndex === -1) {
    return null;
  }
  const chapterIndex = bible.books[bookIndex].chapters.findIndex(
    (chapter) => chapter.number === chapterNumber,
  );
  if (chapterIndex === -1) {
    return null;
  }
  return { bookIndex, chapterIndex };
}

export function getNextChapter(
  bible: Bible,
  bookId: string,
  chapterNumber: number,
): ChapterLocation | null {
  const spot = locate(bible, bookId, chapterNumber);
  if (!spot) {
    return null;
  }
  const book = bible.books[spot.bookIndex];
  if (spot.chapterIndex < book.chapters.length - 1) {
    return {
      bookId: book.id,
      chapterNumber: book.chapters[spot.chapterIndex + 1].number,
    };
  }
  const nextBook = bible.books[spot.bookIndex + 1];
  if (!nextBook || nextBook.chapters.length === 0) {
    return null;
  }
  return { bookId: nextBook.id, chapterNumber: nextBook.chapters[0].number };
}

export function getPreviousChapter(
  bible: Bible,
  bookId: string,
  chapterNumber: number,
): ChapterLocation | null {
  const spot = locate(bible, bookId, chapterNumber);
  if (!spot) {
    return null;
  }
  const book = bible.books[spot.bookIndex];
  if (spot.chapterIndex > 0) {
    return {
      bookId: book.id,
      chapterNumber: book.chapters[spot.chapterIndex - 1].number,
    };
  }
  const previousBook = bible.books[spot.bookIndex - 1];
  if (!previousBook || previousBook.chapters.length === 0) {
    return null;
  }
  const lastChapter = previousBook.chapters[previousBook.chapters.length - 1];
  return { bookId: previousBook.id, chapterNumber: lastChapter.number };
}
