import type { Bible, Book, Chapter, Verse } from "../domain/types";
import { CANONICAL_BOOKS } from "./canonicalBooks";

/**
 * PLACEHOLDER CONTENT — NOT SCRIPTURE.
 *
 * Book names and chapter counts are factual canon metadata only.
 * All verse text is synthetic filler generated below; licensing for any
 * real translation is unresolved (docs/PRD.md §5). Every verse string
 * carries the "not Scripture" marker, guarded by the domain test suite.
 */

export const PLACEHOLDER_NOTICE = "TEKS CONTOH — BUKAN KITAB SUCI";

const filler = [
  "Teks contoh ini hanya mengisi tata letak pembaca — not Scripture.",
  "Kalimat pengganti untuk menguji ritme baris dan jarak antarayat — not Scripture.",
  "Isi ayat yang sebenarnya akan dimuat setelah hak penggunaan terjemahan dipastikan — not Scripture.",
  "Contoh baris yang lebih panjang, supaya terlihat bagaimana teks mengalir dan terbungkus ke baris berikutnya dengan nyaman — not Scripture.",
  "Baris pendek untuk uji tata letak — not Scripture.",
  "Tidak ada makna rohani yang dimaksudkan dari kalimat ini — not Scripture.",
];

function makeVerse(bookId: string, chapter: number, verseNumber: number, seed: number): Verse {
  return {
    number: verseNumber,
    text: filler[(seed + verseNumber * 3) % filler.length],
  };
}

function makeChapter(bookId: string, chapterNumber: number): Chapter {
  let h = 7;
  for (const c of `${bookId}${chapterNumber}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const count = 12 + (h % 19);
  return {
    number: chapterNumber,
    verses: Array.from({ length: count }, (_, index) =>
      makeVerse(bookId, chapterNumber, index + 1, h),
    ),
  };
}

function makeBook(id: string, name: string, canonicalOrder: number, chapterCount: number): Book {
  return {
    id,
    name,
    canonicalOrder,
    chapters: Array.from({ length: chapterCount }, (_, index) =>
      makeChapter(id, index + 1),
    ),
  };
}

export const placeholderBible: Bible = {
  books: CANONICAL_BOOKS.map((book) =>
    makeBook(book.id, book.name, book.canonicalOrder, book.chapterCount),
  ),
};
