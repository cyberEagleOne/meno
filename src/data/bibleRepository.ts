import * as SQLite from "expo-sqlite";
import { importDatabaseFromAssetAsync } from "expo-sqlite";

import type { Bible, Book, Chapter, Verse } from "../domain/types";
import { logger } from "../services/logger";
import {
  BIBLE_BOOK_IDS,
  canonicalIdForDatabaseId,
  databaseIdForCanonicalId,
} from "./bibleBookMap";

export const BIBLE_DATABASE_NAME = "ilt3";
function bibleDatabaseAsset(): number {
  // Literal path keeps Metro's asset resolver happy; lazy evaluation lets tests
  // import metadata helpers without loading the binary asset.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("../../assets/database/ilt3.sqlite") as number;
}
export const EXPECTED_BIBLE_BOOKS = 66;
export const EXPECTED_BIBLE_CHAPTERS = 1189;

export interface BibleTranslation {
  shortName: string;
  longName: string;
  description: string;
  locale: string;
  copyright: string | null;
}

export interface LoadedBible extends Bible {
  translation: BibleTranslation;
}

interface BookRow {
  book_id: number;
  name: string;
  chapter_count: number;
}

interface TranslationRow {
  short_name: string | null;
  long_name: string | null;
  description: string | null;
  locale: string | null;
}

interface VerseRow {
  verse: number;
  text: string;
}

/** Imports the bundled database only when it is not already present. */
export async function importBibleDatabase(): Promise<void> {
  await importDatabaseFromAssetAsync(BIBLE_DATABASE_NAME, {
    assetId: bibleDatabaseAsset(),
    forceOverwrite: false,
  });
}

export async function openBibleDatabase(): Promise<SQLite.SQLiteDatabase> {
  await importBibleDatabase();
  return SQLite.openDatabaseAsync(BIBLE_DATABASE_NAME);
}

function parseCopyright(description: string | null): string | null {
  if (!description) return null;
  const match = description.match(/Copyright\s+(.+?)\./i);
  return match?.[1]?.trim() ?? null;
}

/**
 * Reads and validates the book/chapter metadata. A malformed or mismatched
 * database fails loudly instead of silently rendering an incomplete canon.
 */
export async function loadBibleMetadata(db: SQLite.SQLiteDatabase): Promise<LoadedBible> {
  const [bookRows, translationRow] = await Promise.all([
    db.getAllAsync<BookRow>(
      "SELECT book_id, name, chapter_count FROM books ORDER BY book_id",
    ),
    db.getFirstAsync<TranslationRow>(
      "SELECT short_name, long_name, description, locale FROM translation WHERE id = 1",
    ),
  ]);

  if (bookRows.length !== EXPECTED_BIBLE_BOOKS) {
    throw new Error(
      `Bible database has ${bookRows.length} books; expected ${EXPECTED_BIBLE_BOOKS}.`,
    );
  }

  let totalChapters = 0;
  const books: Book[] = bookRows.map((row, index) => {
    const id = canonicalIdForDatabaseId(row.book_id);
    if (!id || row.book_id !== index) {
      throw new Error(`Unexpected Bible database book_id ${row.book_id} at row ${index}.`);
    }
    if (!Number.isInteger(row.chapter_count) || row.chapter_count < 1) {
      throw new Error(`Invalid chapter count for ${row.name}.`);
    }
    totalChapters += row.chapter_count;
    return {
      id,
      name: row.name,
      canonicalOrder: index + 1,
      chapters: Array.from({ length: row.chapter_count }, (_, chapterIndex) => ({
        number: chapterIndex + 1,
        verses: [],
      })),
    };
  });

  if (totalChapters !== EXPECTED_BIBLE_CHAPTERS) {
    throw new Error(
      `Bible database has ${totalChapters} chapters; expected ${EXPECTED_BIBLE_CHAPTERS}.`,
    );
  }

  if (!translationRow) {
    throw new Error("Bible database is missing its translation metadata.");
  }

  logger.info("BIBLE", "database_metadata_loaded", {
    books: books.length,
    chapters: totalChapters,
    translation: translationRow.short_name ?? "unknown",
  });

  return {
    books,
    translation: {
      shortName: translationRow.short_name ?? "ILT3",
      longName: translationRow.long_name ?? "Indonesian Literal Translation 3",
      description: translationRow.description ?? "",
      locale: translationRow.locale ?? "in",
      copyright: parseCopyright(translationRow.description),
    },
  };
}

export async function loadChapterVerses(
  db: SQLite.SQLiteDatabase,
  bookId: string,
  chapterNumber: number,
): Promise<readonly Verse[] | null> {
  const databaseId = databaseIdForCanonicalId(bookId);
  if (databaseId === undefined || !Number.isInteger(chapterNumber) || chapterNumber < 1) {
    return null;
  }

  const rows = await db.getAllAsync<VerseRow>(
    "SELECT verse, text FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse",
    databaseId,
    chapterNumber,
  );

  return rows.map((row) => ({ number: row.verse, text: row.text }));
}

export async function loadChapter(
  db: SQLite.SQLiteDatabase,
  bookId: string,
  chapterNumber: number,
): Promise<Chapter | null> {
  const verses = await loadChapterVerses(db, bookId, chapterNumber);
  if (verses === null) return null;
  return { number: chapterNumber, verses };
}

export function isKnownBibleBookId(bookId: string): boolean {
  return BIBLE_BOOK_IDS.includes(bookId);
}
