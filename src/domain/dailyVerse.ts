export interface DailyVerse {
  reference: string;
  text: string;
  translation: string;
  bookId?: string;
  chapter?: number;
}

export class DailyVerseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DailyVerseValidationError";
  }
}

/**
 * Validates and transforms a raw object into a DailyVerse domain model.
 * Throws DailyVerseValidationError if any required fields are missing or invalid.
 */
export function validateDailyVerse(raw: unknown): DailyVerse {
  if (!raw || typeof raw !== "object") {
    throw new DailyVerseValidationError("Payload ayat tidak valid: bukan sebuah objek.");
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.reference !== "string" || obj.reference.trim().length === 0) {
    throw new DailyVerseValidationError("Field 'reference' wajib diisi dan berupa string non-kosong.");
  }

  if (typeof obj.text !== "string" || obj.text.trim().length === 0) {
    throw new DailyVerseValidationError("Field 'text' wajib diisi dan berupa string non-kosong.");
  }

  const translation = typeof obj.translation === "string" && obj.translation.trim().length > 0
    ? obj.translation.trim()
    : "Terjemahan Baru";

  const result: DailyVerse = {
    reference: obj.reference.trim(),
    text: obj.text.trim(),
    translation,
  };

  if (typeof obj.bookId === "string") {
    result.bookId = obj.bookId;
  }
  if (typeof obj.chapter === "number") {
    result.chapter = obj.chapter;
  }

  return result;
}
