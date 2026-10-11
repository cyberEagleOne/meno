import type { Bible, Book, Chapter, Verse } from "../domain/types";

/**
 * PLACEHOLDER CONTENT — NOT SCRIPTURE.
 *
 * This dataset exists only to exercise reading and navigation while the
 * Bible-translation licensing question is unresolved (docs/PRD.md §5.4).
 * It contains no ILT3 text and no real Bible translation. Chapter counts are
 * reduced placeholders, not the true counts of any translation.
 */
export const PLACEHOLDER_NOTICE =
  "Synthetic placeholder content for development only. Not Scripture, not ILT3, not any real Bible translation.";

function makeVerse(bookName: string, chapter: number, verseNumber: number): Verse {
  return {
    number: verseNumber,
    text: `[Placeholder ${bookName} ${chapter}:${verseNumber}] Synthetic text for development only — not Scripture.`,
  };
}

function makeChapter(bookName: string, chapterNumber: number, verseCount: number): Chapter {
  return {
    number: chapterNumber,
    verses: Array.from({ length: verseCount }, (_, index) =>
      makeVerse(bookName, chapterNumber, index + 1),
    ),
  };
}

function makeBook(
  id: string,
  name: string,
  canonicalOrder: number,
  chapterCount: number,
  versesPerChapter: number,
): Book {
  return {
    id,
    name,
    canonicalOrder,
    chapters: Array.from({ length: chapterCount }, (_, index) =>
      makeChapter(name, index + 1, versesPerChapter),
    ),
  };
}

export const placeholderBible: Bible = {
  books: [
    makeBook("genesis", "Genesis", 1, 3, 3),
    makeBook("exodus", "Exodus", 2, 2, 3),
    makeBook("leviticus", "Leviticus", 3, 1, 3),
  ],
};
