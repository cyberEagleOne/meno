import { validateDailyVerse, DailyVerseValidationError } from "../../domain/dailyVerse";
import {
  fetchDailyVerseFromApi,
  normalizeApiBookId,
  parseReference,
  ApiHttpError,
  ApiJsonError,
} from "../dailyVerseRepository";
import { placeholderBible } from "../placeholderBible";

describe("P6: Integrasi API & Unit Tests (Daily Verse Feature)", () => {
  // 1. Pengujian: Model Valid
  it("1. Model Valid: berhasil memvalidasi payload ayat yang lengkap dan benar", () => {
    const rawPayload = {
      reference: "Yohanes 3:16",
      text: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal...",
      translation: "Terjemahan Baru",
      bookId: "joh",
      chapter: 3,
    };

    const verse = validateDailyVerse(rawPayload);
    expect(verse.reference).toBe("Yohanes 3:16");
    expect(verse.text).toContain("Karena begitu besar kasih Allah");
    expect(verse.translation).toBe("Terjemahan Baru");
    expect(verse.bookId).toBe("joh");
    expect(verse.chapter).toBe(3);
  });

  // 2. Pengujian: Model Invalid
  it("2. Model Invalid: melempar DailyVerseValidationError jika field wajib kosong atau bertipe salah", () => {
    const invalidPayloads = [
      null,
      {},
      { reference: "", text: "Ada teks" },
      { reference: "Yohanes 1:1", text: "   " },
      { reference: 123, text: "Teks" },
    ];

    for (const payload of invalidPayloads) {
      expect(() => validateDailyVerse(payload)).toThrow(DailyVerseValidationError);
    }
  });

  // 3. Pengujian: API Sukses
  it("3. API Sukses: berhasil memuat data dari API saat response HTTP 200", async () => {
    const mockSuccessResponse = {
      reference: "Mazmur 23:1",
      text: "TUHAN adalah gembalaku, takkan kekurangan aku.",
      translation_name: "Terjemahan Baru",
      book_id: "psa",
      chapter: 23,
    };

    const fakeFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockSuccessResponse),
    } as unknown as Response);

    const result = await fetchDailyVerseFromApi("https://api.test/verse", fakeFetch);
    expect(result).not.toBeNull();
    expect(result?.reference).toBe("Mazmur 23:1");
    expect(result?.text).toBe("TUHAN adalah gembalaku, takkan kekurangan aku.");
  });

  // 4. Pengujian: Data Kosong
  it("4. Data Kosong: mengembalikan null (empty state) jika respons API kosong atau bernilai null", async () => {
    const emptyBodies = ["", "{}", JSON.stringify({ text: "" })];

    for (const body of emptyBodies) {
      const fakeFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => body,
      } as unknown as Response);

      const result = await fetchDailyVerseFromApi("https://api.test/empty", fakeFetch);
      expect(result).toBeNull();
    }
  });

  // 5. Pengujian: HTTP Gagal
  it("5. HTTP Gagal: melempar ApiHttpError jika server merespons kode status error (misal 500 / 404) atau network failure", async () => {
    // 5a. HTTP 500 Internal Server Error
    const fakeHttpErrorFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as unknown as Response);

    await expect(
      fetchDailyVerseFromApi("https://api.test/error500", fakeHttpErrorFetch)
    ).rejects.toThrow(ApiHttpError);

    // 5b. Network Failure / Connection Refused
    const fakeNetworkFailFetch = jest.fn().mockRejectedValue(new Error("Network connection dropped"));
    await expect(
      fetchDailyVerseFromApi("https://api.test/network-drop", fakeNetworkFailFetch)
    ).rejects.toThrow(ApiHttpError);
  });

  // 6. Pengujian: JSON Rusak
  it("6. JSON Rusak: melempar ApiJsonError jika respons server bukan JSON valid", async () => {
    const malformedJsonBodies = [
      "<html><head><title>502 Bad Gateway</title></head></html>",
      '{"reference": "Yohanes 3:16", "text": "unclosed string...',
      "SyntaxError: unexpected token",
    ];

    for (const body of malformedJsonBodies) {
      const fakeMalformedFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => body,
      } as unknown as Response);

      await expect(
        fetchDailyVerseFromApi("https://api.test/malformed", fakeMalformedFetch)
      ).rejects.toThrow(ApiJsonError);
    }
  });

  // Canonical mapping of external OSIS/USFM codes and English aliases to Meno canonical IDs
  const CANONICAL_BOOK_EXTERNAL_ALIASES: Record<string, string[]> = {
    kejadian: ["gen", "genesis"],
    keluaran: ["exo", "exodus"],
    imamat: ["lev", "leviticus"],
    bilangan: ["num", "numbers"],
    ulangan: ["deu", "dt", "deuteronomy"],
    yosua: ["jos", "joshua"],
    "hakim-hakim": ["jdg", "judges"],
    rut: ["rut", "rth", "ruth"],
    "1-samuel": ["1sa", "1samuel"],
    "2-samuel": ["2sa", "2samuel"],
    "1-raja-raja": ["1ki", "1kings"],
    "2-raja-raja": ["2ki", "2kings"],
    "1-tawarikh": ["1ch", "1chronicles"],
    "2-tawarikh": ["2ch", "2chronicles"],
    ezra: ["ezr", "ezra"],
    nehemia: ["neh", "nehemiah"],
    ester: ["est", "esther"],
    ayub: ["job", "ayub"],
    mazmur: ["psa", "psalm", "psalms"],
    amsal: ["pro", "prv", "proverbs"],
    pengkhotbah: ["ecc", "ecclesiastes"],
    "kidung-agung": ["sng", "song", "songofsolomon", "songofsongs"],
    yesaya: ["isa", "isaiah"],
    yeremia: ["jer", "jeremiah"],
    ratapan: ["lam", "lamentations"],
    yehezkiel: ["ezk", "ezekiel"],
    daniel: ["dan", "daniel"],
    hosea: ["hos", "hosea"],
    yoel: ["jol", "joe", "joel"],
    amos: ["amo", "amos"],
    obaja: ["oba", "obadiah"],
    yunus: ["jon", "jonah"],
    mikha: ["mic", "micah"],
    nahum: ["nam", "nahum"],
    habakuk: ["hab", "habakkuk"],
    zefanya: ["zep", "zephaniah"],
    hagai: ["hag", "haggai"],
    zakharia: ["zec", "zechariah"],
    maleakhi: ["mal", "malachi"],
    matius: ["mat", "matt", "matthew"],
    markus: ["mrk", "mark"],
    lukas: ["luk", "luke"],
    yohanes: ["jhn", "joh", "john"],
    "kisah-para-rasul": ["act", "acts"],
    roma: ["rom", "romans"],
    "1-korintus": ["1co", "1corinthians"],
    "2-korintus": ["2co", "2corinthians"],
    galatia: ["gal", "galatians"],
    efesus: ["eph", "ephesians"],
    filipi: ["php", "philippians"],
    kolose: ["col", "colossians"],
    "1-tesalonika": ["1th", "1thessalonians"],
    "2-tesalonika": ["2th", "2thessalonians"],
    "1-timotius": ["1ti", "1timothy"],
    "2-timotius": ["2ti", "2timothy"],
    titus: ["tit", "titus"],
    filemon: ["phm", "philemon"],
    ibrani: ["heb", "hebrews"],
    yakobus: ["jas", "james"],
    "1-petrus": ["1pe", "1peter"],
    "2-petrus": ["2pe", "2peter"],
    "1-yohanes": ["1jn", "1john"],
    "2-yohanes": ["2jn", "2john"],
    "3-yohanes": ["3jn", "3john"],
    yudas: ["jud", "jude"],
    wahyu: ["rev", "revelation"],
  };

  // 7. Pengujian Regresi: Tabel Semua 66 Kitab Kanonikal Alkitab & Identifikasi Eksternal
  it("7. Tabel Regresi: memetakan seluruh 66 kitab kanonikal Alkitab dan alias eksternal yang didukung ke ID kanonikal Meno", () => {
    expect(placeholderBible.books.length).toBe(66);

    for (const book of placeholderBible.books) {
      // 7a. Uji ID kanonikal Indonesia dan nama kanonikal
      expect(normalizeApiBookId(book.id)).toBe(book.id);
      expect(normalizeApiBookId(book.name)).toBe(book.id);

      // 7b. Uji variasi huruf kapital (uppercase) dan spasi awal/akhir (leading/trailing whitespace)
      expect(normalizeApiBookId(book.id.toUpperCase())).toBe(book.id);
      expect(normalizeApiBookId(`  ${book.name}  `)).toBe(book.id);

      // 7c. Uji semua alias OSIS/USFM dan nama Inggris yang didukung
      const aliases = CANONICAL_BOOK_EXTERNAL_ALIASES[book.id] || [];
      expect(aliases.length).toBeGreaterThan(0);

      for (const alias of aliases) {
        expect(normalizeApiBookId(alias)).toBe(book.id);
        expect(normalizeApiBookId(alias.toUpperCase())).toBe(book.id);
        expect(normalizeApiBookId(`  ${alias}  `)).toBe(book.id);
      }
    }
  });

  // 8. Pengujian Regresi: Penanganan Aman untuk Input Tidak Dikenal, Kosong, Null, dan Non-String
  it("8. Penanganan Aman: mengembalikan undefined untuk book ID tidak dikenal, kosong, null, atau non-string (tidak menebak yohanes)", () => {
    // 8a. Nilai tidak dikenal
    expect(normalizeApiBookId("unknown-code-xyz")).toBeUndefined();
    expect(normalizeApiBookId("not-a-bible-book")).toBeUndefined();
    expect(normalizeApiBookId("xyz999")).toBeUndefined();

    // 8b. String kosong dan whitespace
    expect(normalizeApiBookId("")).toBeUndefined();
    expect(normalizeApiBookId("   ")).toBeUndefined();
    expect(normalizeApiBookId("\t\n ")).toBeUndefined();

    // 8c. Null, undefined, dan tipe data non-string
    expect(normalizeApiBookId(null)).toBeUndefined();
    expect(normalizeApiBookId(undefined)).toBeUndefined();
    expect(normalizeApiBookId(123)).toBeUndefined();
    expect(normalizeApiBookId(true)).toBeUndefined();
    expect(normalizeApiBookId({})).toBeUndefined();
    expect(normalizeApiBookId([])).toBeUndefined();
  });

  // 9. Pengujian: Parsing Teks Referensi Alkitab (parseReference)
  it("9. Parsing Referensi: mengekstrak nama kitab dan pasal secara akurat dari string referensi", () => {
    expect(parseReference("John 3:16")).toEqual({ bookName: "John", chapter: 3 });
    expect(parseReference("1 John 1:9")).toEqual({ bookName: "1 John", chapter: 1 });
    expect(parseReference("1 Korintus 13:4-8")).toEqual({ bookName: "1 Korintus", chapter: 13 });
    expect(parseReference("Mazmur 23:1")).toEqual({ bookName: "Mazmur", chapter: 23 });
    expect(parseReference("Kisah Para Rasul 2:1-4")).toEqual({ bookName: "Kisah Para Rasul", chapter: 2 });
    expect(parseReference("1 Raja-raja 18:21")).toEqual({ bookName: "1 Raja-raja", chapter: 18 });
    expect(parseReference("Kidung Agung 2:4")).toEqual({ bookName: "Kidung Agung", chapter: 2 });
    expect(parseReference("Genesis 1:1")).toEqual({ bookName: "Genesis", chapter: 1 });
    expect(parseReference("Yohanes 3.16")).toEqual({ bookName: "Yohanes", chapter: 3 });

    // String non-referensi
    expect(parseReference("Bukan referensi Alkitab")).toBeUndefined();
    expect(parseReference("")).toBeUndefined();
    expect(parseReference("   ")).toBeUndefined();
    expect(parseReference(null)).toBeUndefined();
    expect(parseReference(999)).toBeUndefined();
  });

  // 10. Pengujian: Integrasi API & Penanganan Anggun Saat Kitab Tidak Teridentifikasi
  it("10. Integrasi API: menghasilkan bookId kanonikal jika valid, dan undefined tanpa menebak jika tidak teridentifikasi", async () => {
    // 10a. Sukses dengan book_id eksplisit (JHN -> yohanes)
    const validBookResponse = {
      reference: "John 3:16",
      text: "For God so loved the world...",
      translation_name: "World English Bible",
      book_id: "JHN",
      chapter: 3,
    };

    const fetchValid = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(validBookResponse),
    } as unknown as Response);

    const resultValid = await fetchDailyVerseFromApi("https://api.test/john", fetchValid);
    expect(resultValid).not.toBeNull();
    expect(resultValid?.bookId).toBe("yohanes");
    expect(resultValid?.chapter).toBe(3);

    // 10b. Sukses mengekstrak bookId dan chapter dari referensi jika book_id tidak ada di payload
    const missingBookIdResponse = {
      reference: "Mazmur 23:1",
      text: "TUHAN adalah gembalaku, takkan kekurangan aku.",
      translation_name: "Terjemahan Baru",
    };

    const fetchMissingBookId = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(missingBookIdResponse),
    } as unknown as Response);

    const resultFromRef = await fetchDailyVerseFromApi("https://api.test/psalm", fetchMissingBookId);
    expect(resultFromRef).not.toBeNull();
    expect(resultFromRef?.bookId).toBe("mazmur");
    expect(resultFromRef?.chapter).toBe(23);

    // 10c. Penanganan anggun saat book_id dan referensi tidak dapat dikenali
    const unknownBookResponse = {
      reference: "Kutipan Renungan Hari Ini",
      text: "Hiduplah dalam damai dan sukacita setiap hari.",
      translation_name: "Kutipan Bebas",
      book_id: "unknown_quote_99",
    };

    const fetchUnknown = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(unknownBookResponse),
    } as unknown as Response);

    const resultUnknown = await fetchDailyVerseFromApi("https://api.test/unknown", fetchUnknown);
    expect(resultUnknown).not.toBeNull();
    // bookId dan chapter harus undefined, BUKAN menebak "yohanes" atau 3!
    expect(resultUnknown?.bookId).toBeUndefined();
    expect(resultUnknown?.chapter).toBeUndefined();
    expect(resultUnknown?.reference).toBe("Kutipan Renungan Hari Ini");
  });

  // 11. Pengujian Tabel: book_id hilang, kosong, null, atau bertipe salah pada respons API
  const MALFORMED_BOOK_ID_PAYLOADS: [string, unknown][] = [
    ["hilang", undefined],
    ["string kosong", ""],
    ["whitespace", "   "],
    ["null", null],
    ["angka", 123],
    ["objek", { code: "JHN" }],
    ["array", ["JHN"]],
    ["tidak dikenal", "unknown_quote_99"],
  ];

  it.each(MALFORMED_BOOK_ID_PAYLOADS)(
    "11. API Aman: book_id %s tidak boleh jatuh ke yohanes/joh maupun pasal default",
    async (_label, malformedBookId) => {
      const payload: Record<string, unknown> = {
        reference: "Kutipan Renungan Hari Ini",
        text: "Hiduplah dalam damai dan sukacita setiap hari.",
        translation_name: "Kutipan Bebas",
      };
      if (malformedBookId !== undefined) {
        payload.book_id = malformedBookId;
      }

      const fakeFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(payload),
      } as unknown as Response);

      const result = await fetchDailyVerseFromApi("https://api.test/malformed-book", fakeFetch);

      expect(result).not.toBeNull();
      expect(result?.bookId).toBeUndefined();
      expect(result?.chapter).toBeUndefined();
      expect(result?.bookId).not.toBe("yohanes");
      expect(result?.bookId).not.toBe("joh");
    }
  );

  // 12. Pengujian: Bentuk payload alternatif (book_name dan verses[0]) tetap dinormalisasi
  it("12. API Bentuk Alternatif: mendukung book_name dan verses[0] lalu menormalkan ke ID kanonikal", async () => {
    const bookNamePayload = {
      reference: "Kisah Para Rasul 2:1",
      text: "Ketika tiba hari Pentakosta...",
      translation_name: "Terjemahan Baru",
      book_name: "Acts",
      chapter: 2,
    };

    const fetchBookName = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(bookNamePayload),
    } as unknown as Response);

    const resultBookName = await fetchDailyVerseFromApi("https://api.test/book-name", fetchBookName);
    expect(resultBookName?.bookId).toBe("kisah-para-rasul");
    expect(resultBookName?.chapter).toBe(2);

    const versesPayload = {
      reference: "Mazmur 23:1",
      text: "TUHAN adalah gembalaku.",
      translation_name: "Terjemahan Baru",
      verses: [{ book_id: "PSA", chapter: 23, verse: 1, text: "TUHAN adalah gembalaku." }],
    };

    const fetchVerses = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(versesPayload),
    } as unknown as Response);

    const resultVerses = await fetchDailyVerseFromApi("https://api.test/verses", fetchVerses);
    expect(resultVerses?.bookId).toBe("mazmur");
    expect(resultVerses?.chapter).toBe(23);
  });

  // 13. Pengujian: Pasal pecahan atau negatif tidak diterima sebagai chapter navigasi
  it("13. API Aman: nomor pasal non-integer atau negatif diabaikan (undefined)", async () => {
    const invalidChapterPayloads: [string, unknown][] = [
      ["pecahan", 3.5],
      ["negatif", -1],
      ["nol", 0],
    ];

    for (const [, chapter] of invalidChapterPayloads) {
      const payload = {
        reference: "Kutipan Renungan Hari Ini",
        text: "Hiduplah dalam damai.",
        translation_name: "Kutipan Bebas",
        chapter,
      };

      const fakeFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(payload),
      } as unknown as Response);

      const result = await fetchDailyVerseFromApi("https://api.test/invalid-chapter", fakeFetch);
      expect(result?.chapter).toBeUndefined();
    }
  });

  // 14. Pengujian Tabel: parseReference mengenali seluruh 66 nama kitab kanonikal
  it("14. Parsing Referensi: mengenali seluruh 66 nama kitab kanonikal", () => {
    expect(placeholderBible.books.length).toBe(66);

    for (const book of placeholderBible.books) {
      expect(parseReference(`${book.name} 1:1`)).toEqual({
        bookName: book.name,
        chapter: 1,
      });
    }
  });
});
