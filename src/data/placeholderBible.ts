import type { Bible, Book, Chapter, Verse } from "../domain/types";

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

const raw: [string, number][] = [
  ["Kejadian", 50], ["Keluaran", 40], ["Imamat", 27], ["Bilangan", 36], ["Ulangan", 34],
  ["Yosua", 24], ["Hakim-hakim", 21], ["Rut", 4], ["1 Samuel", 31], ["2 Samuel", 24],
  ["1 Raja-raja", 22], ["2 Raja-raja", 25], ["1 Tawarikh", 29], ["2 Tawarikh", 36], ["Ezra", 10],
  ["Nehemia", 13], ["Ester", 10], ["Ayub", 42], ["Mazmur", 150], ["Amsal", 31],
  ["Pengkhotbah", 12], ["Kidung Agung", 8], ["Yesaya", 66], ["Yeremia", 52], ["Ratapan", 5],
  ["Yehezkiel", 48], ["Daniel", 12], ["Hosea", 14], ["Yoel", 3], ["Amos", 9],
  ["Obaja", 1], ["Yunus", 4], ["Mikha", 7], ["Nahum", 3], ["Habakuk", 3],
  ["Zefanya", 3], ["Hagai", 2], ["Zakharia", 14], ["Maleakhi", 4],
  ["Matius", 28], ["Markus", 16], ["Lukas", 24], ["Yohanes", 21], ["Kisah Para Rasul", 28],
  ["Roma", 16], ["1 Korintus", 16], ["2 Korintus", 13], ["Galatia", 6], ["Efesus", 6],
  ["Filipi", 4], ["Kolose", 4], ["1 Tesalonika", 5], ["2 Tesalonika", 3], ["1 Timotius", 6],
  ["2 Timotius", 4], ["Titus", 3], ["Filemon", 1], ["Ibrani", 13], ["Yakobus", 5],
  ["1 Petrus", 5], ["2 Petrus", 3], ["1 Yohanes", 5], ["2 Yohanes", 1], ["3 Yohanes", 1],
  ["Yudas", 1], ["Wahyu", 22],
];

export const placeholderBible: Bible = {
  books: raw.map(([name, chapterCount], index) =>
    makeBook(
      name.toLowerCase().replace(/\s+/g, "-"),
      name,
      index + 1,
      chapterCount,
    ),
  ),
};
