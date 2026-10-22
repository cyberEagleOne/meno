import type { Bible, Book } from "../domain/types";
import { placeholderBible } from "./placeholderBible";

export type Testament = "PL" | "PB";

export const TESTAMENT_LABEL: Record<Testament, string> = {
  PL: "Perjanjian Lama",
  PB: "Perjanjian Baru",
};

/** First 39 books (by canonical order) are Old Testament; the rest New Testament. */
export function testamentOf(book: Book): Testament {
  return book.canonicalOrder <= 39 ? "PL" : "PB";
}

export const TOTAL_CHAPTERS = placeholderBible.books.reduce(
  (n, book) => n + book.chapters.length,
  0,
);

export const TESTAMENT_TOTALS: Record<Testament, { books: number; chapters: number }> = {
  PL: { books: 0, chapters: 0 },
  PB: { books: 0, chapters: 0 },
};
for (const book of placeholderBible.books) {
  const t = testamentOf(book);
  TESTAMENT_TOTALS[t].books += 1;
  TESTAMENT_TOTALS[t].chapters += book.chapters.length;
}

export function getBookById(bible: Bible, bookId: string): Book | undefined {
  return bible.books.find((book) => book.id === bookId);
}

export function booksByTestament(bible: Bible, testament: Testament): Book[] {
  return bible.books.filter((book) => testamentOf(book) === testament);
}

export function isValidChapter(bible: Bible, bookId: string, chapter: number): boolean {
  const book = getBookById(bible, bookId);
  return (
    !!book &&
    Number.isInteger(chapter) &&
    chapter >= 1 &&
    chapter <= book.chapters.length
  );
}

export function chapterKey(bookId: string, chapter: number): string {
  return `${bookId}:${chapter}`;
}
