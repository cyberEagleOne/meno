import { DailyVerse, validateDailyVerse } from "../domain/dailyVerse";
import { logger } from "../services/logger";

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
  logger.info("API_INTEGRATION", "daily_verse_fetch_started", { endpoint: apiUrl });
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
    const httpError = new ApiHttpError(0, `Gagal menghubungi server API: ${msg}`);
    logger.error("API_INTEGRATION", "daily_verse_fetch_failed", httpError, {
      endpoint: apiUrl,
      errorType: "ApiHttpError",
      statusCode: 0,
    });
    throw httpError;
  }

  if (!response.ok) {
    const httpError = new ApiHttpError(
      response.status,
      `HTTP Error ${response.status}: Permintaan ke API ayat gagal.`
    );
    logger.error("API_INTEGRATION", "daily_verse_http_error", httpError, {
      endpoint: apiUrl,
      errorType: "ApiHttpError",
      statusCode: response.status,
    });
    throw httpError;
  }

  let textPayload: string;
  try {
    textPayload = await response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Read error";
    const httpError = new ApiHttpError(response.status, `Gagal membaca respons server: ${msg}`);
    logger.error("API_INTEGRATION", "daily_verse_read_error", httpError, {
      endpoint: apiUrl,
      errorType: "ApiHttpError",
      statusCode: response.status,
    });
    throw httpError;
  }

  // Handle completely empty body
  if (!textPayload || textPayload.trim().length === 0) {
    logger.info("API_INTEGRATION", "daily_verse_empty_body", { endpoint: apiUrl });
    return null;
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(textPayload);
  } catch (err: unknown) {
    const jsonError = new ApiJsonError("Format data respons bukan JSON yang valid (JSON rusak).");
    logger.error("API_INTEGRATION", "daily_verse_json_error", jsonError, {
      endpoint: apiUrl,
      errorType: "ApiJsonError",
    });
    throw jsonError;
  }

  // Handle empty JSON object or empty array
  if (
    !rawJson ||
    (typeof rawJson === "object" && Object.keys(rawJson as object).length === 0)
  ) {
    logger.info("API_INTEGRATION", "daily_verse_empty_json", { endpoint: apiUrl });
    return null;
  }

  // Normalize possible third-party API shapes (e.g. bible-api.com returns { reference, text, translation_name })
  const rawObj = rawJson as Record<string, unknown>;

  // If payload has an empty text or null, treat as empty data
  if (!rawObj.text || typeof rawObj.text !== "string" || rawObj.text.trim().length === 0) {
    logger.info("API_INTEGRATION", "daily_verse_empty_text", { endpoint: apiUrl });
    return null;
  }

  const normalized = {
    reference: (rawObj.reference as string) || (rawObj.verse as string) || "",
    text: ((rawObj.text as string) || "").replace(/\n/g, " ").trim(),
    translation: (rawObj.translation_name as string) || (rawObj.translation as string) || "Alkitab Digital",
    bookId: (rawObj.book_id as string) || "joh",
    chapter: typeof rawObj.chapter === "number" ? rawObj.chapter : 3,
  };

  const validated = validateDailyVerse(normalized);
  logger.info("API_INTEGRATION", "daily_verse_fetch_success", {
    reference: validated.reference,
    bookId: validated.bookId,
    chapter: validated.chapter,
  });
  return validated;
}
