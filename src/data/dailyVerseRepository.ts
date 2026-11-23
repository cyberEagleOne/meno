import { DailyVerse, validateDailyVerse } from "../domain/dailyVerse";
import { placeholderBible } from "./placeholderBible";
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
 * Maps external OSIS/USFM and common English book identifiers to Meno's Indonesian canonical book IDs.
 */
const EXTERNAL_BOOK_TO_CANON_ID: Record<string, string> = {
  gen: "kejadian",
  genesis: "kejadian",
  exo: "keluaran",
  exodus: "keluaran",
  lev: "imamat",
  leviticus: "imamat",
  num: "bilangan",
  numbers: "bilangan",
  deu: "ulangan",
  dt: "ulangan",
  deuteronomy: "ulangan",
  jos: "yosua",
  joshua: "yosua",
  jdg: "hakim-hakim",
  judges: "hakim-hakim",
  rut: "rut",
  rth: "rut",
  ruth: "rut",
  "1sa": "1-samuel",
  "1samuel": "1-samuel",
  "2sa": "2-samuel",
  "2samuel": "2-samuel",
  "1ki": "1-raja-raja",
  "1kings": "1-raja-raja",
  "2ki": "2-raja-raja",
  "2kings": "2-raja-raja",
  "1ch": "1-tawarikh",
  "1chronicles": "1-tawarikh",
  "2ch": "2-tawarikh",
  "2chronicles": "2-tawarikh",
  ezr: "ezra",
  ezra: "ezra",
  neh: "nehemia",
  nehemiah: "nehemia",
  est: "ester",
  esther: "ester",
  job: "ayub",
  ayub: "ayub",
  psa: "mazmur",
  psalm: "mazmur",
  psalms: "mazmur",
  pro: "amsal",
  prv: "amsal",
  proverbs: "amsal",
  ecc: "pengkhotbah",
  ecclesiastes: "pengkhotbah",
  sng: "kidung-agung",
  song: "kidung-agung",
  songofsolomon: "kidung-agung",
  songofsongs: "kidung-agung",
  isa: "yesaya",
  isaiah: "yesaya",
  jer: "yeremia",
  jeremiah: "yeremia",
  lam: "ratapan",
  lamentations: "ratapan",
  ezk: "yehezkiel",
  ezekiel: "yehezkiel",
  dan: "daniel",
  daniel: "daniel",
  hos: "hosea",
  hosea: "hosea",
  jol: "yoel",
  joe: "yoel",
  joel: "yoel",
  amo: "amos",
  amos: "amos",
  oba: "obaja",
  obadiah: "obaja",
  jon: "yunus",
  jonah: "yunus",
  mic: "mikha",
  micah: "mikha",
  nam: "nahum",
  nahum: "nahum",
  hab: "habakuk",
  habakkuk: "habakuk",
  zep: "zefanya",
  zephaniah: "zefanya",
  hag: "hagai",
  haggai: "hagai",
  zec: "zakharia",
  zechariah: "zakharia",
  mal: "maleakhi",
  malachi: "maleakhi",
  mat: "matius",
  matt: "matius",
  matthew: "matius",
  mrk: "markus",
  mark: "markus",
  luk: "lukas",
  luke: "lukas",
  jhn: "yohanes",
  joh: "yohanes",
  john: "yohanes",
  act: "kisah-para-rasul",
  acts: "kisah-para-rasul",
  rom: "roma",
  romans: "roma",
  "1co": "1-korintus",
  "1corinthians": "1-korintus",
  "2co": "2-korintus",
  "2corinthians": "2-korintus",
  gal: "galatia",
  galatians: "galatia",
  eph: "efesus",
  ephesians: "efesus",
  php: "filipi",
  philippians: "filipi",
  col: "kolose",
  colossians: "kolose",
  "1th": "1-tesalonika",
  "1thessalonians": "1-tesalonika",
  "2th": "2-tesalonika",
  "2thessalonians": "2-tesalonika",
  "1ti": "1-timotius",
  "1timothy": "1-timotius",
  "2ti": "2-timotius",
  "2timothy": "2-timotius",
  tit: "titus",
  titus: "titus",
  phm: "filemon",
  philemon: "filemon",
  heb: "ibrani",
  hebrews: "ibrani",
  jas: "yakobus",
  james: "yakobus",
  "1pe": "1-petrus",
  "1peter": "1-petrus",
  "2pe": "2-petrus",
  "2peter": "2-petrus",
  "1jn": "1-yohanes",
  "1john": "1-yohanes",
  "2jn": "2-yohanes",
  "2john": "2-yohanes",
  "3jn": "3-yohanes",
  "3john": "3-yohanes",
  jud: "yudas",
  jude: "yudas",
  rev: "wahyu",
  revelation: "wahyu",
};

export function normalizeApiBookId(rawBook: unknown): string | undefined {
  if (typeof rawBook !== "string") {
    return undefined;
  }
  const trimmed = rawBook.trim();
  if (!trimmed) {
    return undefined;
  }
  const clean = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean && EXTERNAL_BOOK_TO_CANON_ID[clean]) {
    return EXTERNAL_BOOK_TO_CANON_ID[clean];
  }
  const formatted = trimmed.toLowerCase().replace(/\s+/g, "-");
  const directMatch = placeholderBible.books.find(
    (b) =>
      b.id === formatted ||
      b.name.toLowerCase() === trimmed.toLowerCase() ||
      b.id.replace(/[^a-z0-9]/g, "") === clean ||
      b.name.toLowerCase().replace(/[^a-z0-9]/g, "") === clean
  );
  if (directMatch) {
    return directMatch.id;
  }
  return undefined;
}

/**
 * Safely parses a Bible reference string like "John 3:16", "1 Korintus 13:4-8", or "Mazmur 23:1"
 * into a candidate book name and chapter number.
 * Returns undefined if the string does not match a recognizable reference pattern.
 */
export function parseReference(raw: unknown): { bookName: string; chapter: number } | undefined {
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  const match = trimmed.match(/^([1-3]?\s*[a-zA-Z\s-]+?)\s+(\d+)(?:[:.]\s*\d+(?:-\d+)?)?$/);
  if (!match) {
    return undefined;
  }
  const chapter = parseInt(match[2], 10);
  if (isNaN(chapter) || chapter <= 0) {
    return undefined;
  }
  return {
    bookName: match[1].trim(),
    chapter,
  };
}

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
  } catch {
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

  const rawReference =
    (typeof rawObj.reference === "string" ? rawObj.reference : "") ||
    (typeof rawObj.verse === "string" ? rawObj.verse : "");

  const firstVerseObj =
    Array.isArray(rawObj.verses) && rawObj.verses[0] && typeof rawObj.verses[0] === "object"
      ? (rawObj.verses[0] as Record<string, unknown>)
      : null;

  const rawBookCandidate =
    rawObj.book_id || rawObj.book_name || firstVerseObj?.book_id || firstVerseObj?.book_name;

  let resolvedBookId: string | undefined;
  if (rawBookCandidate) {
    resolvedBookId = normalizeApiBookId(rawBookCandidate);
  }

  const parsedRef = parseReference(rawReference);
  if (!resolvedBookId && parsedRef?.bookName) {
    resolvedBookId = normalizeApiBookId(parsedRef.bookName);
  }

  let resolvedChapter: number | undefined;
  if (typeof rawObj.chapter === "number" && Number.isInteger(rawObj.chapter) && rawObj.chapter > 0) {
    resolvedChapter = rawObj.chapter;
  } else if (
    typeof firstVerseObj?.chapter === "number" &&
    Number.isInteger(firstVerseObj.chapter) &&
    firstVerseObj.chapter > 0
  ) {
    resolvedChapter = firstVerseObj.chapter;
  } else if (parsedRef?.chapter !== undefined) {
    resolvedChapter = parsedRef.chapter;
  }

  const normalized: {
    reference: string;
    text: string;
    translation: string;
    bookId?: string;
    chapter?: number;
  } = {
    reference: rawReference,
    text: ((rawObj.text as string) || "").replace(/\n/g, " ").trim(),
    translation: (rawObj.translation_name as string) || (rawObj.translation as string) || "Alkitab Digital",
  };

  if (resolvedBookId) {
    normalized.bookId = resolvedBookId;
  }
  if (resolvedChapter !== undefined) {
    normalized.chapter = resolvedChapter;
  }

  const validated = validateDailyVerse(normalized);
  logger.info("API_INTEGRATION", "daily_verse_fetch_success", {
    reference: validated.reference,
    bookId: validated.bookId,
    chapter: validated.chapter,
  });
  return validated;
}
