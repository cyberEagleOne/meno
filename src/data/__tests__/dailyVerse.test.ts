import { validateDailyVerse, DailyVerseValidationError } from "../../domain/dailyVerse";
import {
  fetchDailyVerseFromApi,
  ApiHttpError,
  ApiJsonError,
} from "../dailyVerseRepository";

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
});
