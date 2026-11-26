import { CANONICAL_BOOKS } from "./canonicalBooks";

/**
 * Explicit bridge between ILT3's numeric `books.book_id` values (0..65) and
 * Meno's stable canonical IDs. The order is the Protestant 66-book canon.
 */
export const BIBLE_BOOK_IDS: readonly string[] = CANONICAL_BOOKS.map((book) => book.id);

const DATABASE_ID_BY_CANONICAL_ID = new Map(
  BIBLE_BOOK_IDS.map((bookId, databaseId) => [bookId, databaseId] as const),
);

export function canonicalIdForDatabaseId(databaseId: number): string | undefined {
  if (!Number.isInteger(databaseId) || databaseId < 0 || databaseId >= BIBLE_BOOK_IDS.length) {
    return undefined;
  }
  return BIBLE_BOOK_IDS[databaseId];
}

export function databaseIdForCanonicalId(bookId: string): number | undefined {
  return DATABASE_ID_BY_CANONICAL_ID.get(bookId);
}
