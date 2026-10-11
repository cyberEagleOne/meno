export interface Verse {
  number: number;
  text: string;
}

export interface Chapter {
  number: number;
  verses: readonly Verse[];
}

export interface Book {
  id: string;
  name: string;
  canonicalOrder: number;
  chapters: readonly Chapter[];
}

export interface Bible {
  /** Books in canonical order; navigation sequencing relies on this order. */
  books: readonly Book[];
}

export interface ChapterLocation {
  bookId: string;
  chapterNumber: number;
}
