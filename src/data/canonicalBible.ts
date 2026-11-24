import type { Bible, Book } from "../domain/types";
import { CANONICAL_BOOKS } from "./canonicalBooks";

/**
 * Metadata-only Bible used for navigation, progress validation, and random
 * chapter selection. Chapters intentionally contain no verses; reading content
 * is loaded from the ILT3 SQLite database.
 */
export const canonicalBible: Bible = {
  books: CANONICAL_BOOKS.map<Book>((book) => ({
    id: book.id,
    name: book.name,
    canonicalOrder: book.canonicalOrder,
    chapters: Array.from({ length: book.chapterCount }, (_, index) => ({
      number: index + 1,
      verses: [],
    })),
  })),
};
