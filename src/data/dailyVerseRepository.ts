import { DailyVerse, validateDailyVerse } from "../domain/dailyVerse";

export class ApiHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
  }
}

export class ApiJsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiJsonError";
  }
}

export const DEFAULT_DAILY_VERSE_API_URL = "https://bible-api.com/john+3:16";

/**
 * Repository function to fetch Daily Verse from an external REST API.
 * Supports dependency injection of fetch for deterministic testing.
 */
export async function fetchDailyVerseFromApi(
  apiUrl: string = DEFAULT_DAILY_VERSE_API_URL,
  fetchFn: typeof fetch = fetch
): Promise<DailyVerse | null> {
  let response: Response;

  try {
    response = await fetchFn(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiHttpError(0, `Gagal menghubungi server API: ${msg}`);
  }

  if (!response.ok) {
    throw new ApiHttpError(
      response.status,
      `HTTP Error ${response.status}: Permintaan ke API ayat gagal.`
    );
  }

  let textPayload: string;
  try {
    textPayload = await response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Read error";
    throw new ApiHttpError(response.status, `Gagal membaca respons server: ${msg}`);
  }

  // Handle completely empty body
  if (!textPayload || textPayload.trim().length === 0) {
    return null;
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(textPayload);
  } catch {
    throw new ApiJsonError("Format data respons bukan JSON yang valid (JSON rusak).");
  }

  // Handle empty JSON object or empty array
  if (
    !rawJson ||
    (typeof rawJson === "object" && Object.keys(rawJson as object).length === 0)
  ) {
    return null;
  }

  // Normalize possible third-party API shapes (e.g. bible-api.com returns { reference, text, translation_name })
  const rawObj = rawJson as Record<string, unknown>;

  // If payload has an empty text or null, treat as empty data
  if (!rawObj.text || typeof rawObj.text !== "string" || rawObj.text.trim().length === 0) {
    return null;
  }

  const normalized = {
    reference: (rawObj.reference as string) || (rawObj.verse as string) || "",
    text: ((rawObj.text as string) || "").replace(/\n/g, " ").trim(),
    translation: (rawObj.translation_name as string) || (rawObj.translation as string) || "Alkitab Digital",
    bookId: (rawObj.book_id as string) || "joh",
    chapter: typeof rawObj.chapter === "number" ? rawObj.chapter : 3,
  };

  return validateDailyVerse(normalized);
}
