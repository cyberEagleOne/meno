import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { DailyVerseCard } from "../DailyVerseCard";
import * as dailyVerseRepo from "../../../data/dailyVerseRepository";
import { placeholderBible } from "../../../data/placeholderBible";

jest.mock("../../../data/dailyVerseRepository", () => {
  const actual = jest.requireActual("../../../data/dailyVerseRepository");
  return {
    ...actual,
    fetchDailyVerseFromApi: jest.fn(),
  };
});

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
jest.mock("../../../data/bibleContext", () => {
  const { placeholderBible } = jest.requireActual("../../../data/placeholderBible");
  return { useBibleData: () => placeholderBible };
});

describe("DailyVerseCard Component (Issue #14 UI Safety)", () => {
  let renderer: ReactTestRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => {
        renderer.unmount();
      });
    }
  });

  it("menampilkan tombol 'Baca Pasal Lengkap' jika bookId dan chapter valid dalam kanon Meno", async () => {
    (dailyVerseRepo.fetchDailyVerseFromApi as jest.Mock).mockResolvedValue({
      reference: "Yohanes 3:16",
      text: "Karena begitu besar kasih Allah akan dunia ini...",
      translation: "Terjemahan Baru",
      bookId: "yohanes",
      chapter: 3,
    });

    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });

    const readButton = renderer.root.findByProps({
      accessibilityLabel: "Baca pasal lengkap Yohanes 3:16",
    });
    expect(readButton).toBeTruthy();

    // Pastikan tombol dapat ditekan dan mengarah ke rute yang tepat
    await act(async () => {
      readButton.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/reader/[book]/[chapter]",
      params: { book: "yohanes", chapter: "3" },
    });
  });

  it("TIDAK menampilkan tombol 'Baca Pasal Lengkap' jika bookId tidak teridentifikasi (undefined)", async () => {
    (dailyVerseRepo.fetchDailyVerseFromApi as jest.Mock).mockResolvedValue({
      reference: "Mutiara Kata Rohani",
      text: "Damai sejahtera menyertai kita semua.",
      translation: "Kutipan Bebas",
      bookId: undefined,
      chapter: undefined,
    });

    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });

    const readButtons = renderer.root
      .findAllByProps({ accessibilityRole: "button" })
      .filter((n) => n.props?.accessibilityLabel?.includes("Baca pasal lengkap"));
    // Tombol tidak boleh dirender sama sekali untuk menghindari navigasi yang salah
    expect(readButtons.length).toBe(0);
  });

  it("TIDAK menampilkan tombol navigasi jika bookId tidak terdaftar dalam kanon Alkitab", async () => {
    (dailyVerseRepo.fetchDailyVerseFromApi as jest.Mock).mockResolvedValue({
      reference: "Apokrifa 1:1",
      text: "Teks apokrifa di luar 66 kitab kanonikal.",
      translation: "Non-Kanon",
      bookId: "apokrifa-nonexistent",
      chapter: 1,
    });

    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });

    const readButtons = renderer.root
      .findAllByProps({ accessibilityRole: "button" })
      .filter((n) => n.props?.accessibilityLabel?.includes("Baca pasal lengkap"));
    expect(readButtons.length).toBe(0);
  });

  it("TIDAK menampilkan tombol navigasi jika nomor pasal melampaui jumlah pasal kitab (out of bounds)", async () => {
    (dailyVerseRepo.fetchDailyVerseFromApi as jest.Mock).mockResolvedValue({
      reference: "Yohanes 99:1",
      text: "Pasal yang melebihi 21 pasal di Yohanes.",
      translation: "Terjemahan Baru",
      bookId: "yohanes",
      chapter: 99,
    });

    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });

    const readButtons = renderer.root
      .findAllByProps({ accessibilityRole: "button" })
      .filter((n) => n.props?.accessibilityLabel?.includes("Baca pasal lengkap"));
    expect(readButtons.length).toBe(0);
  });

  const hiddenNavigationCases: [string, { bookId?: string; chapter?: number }][] = [
    ["bookId string kosong", { bookId: "", chapter: 3 }],
    ["bookId hanya whitespace", { bookId: "   ", chapter: 3 }],
    ["chapter tidak tersedia", { bookId: "yohanes" }],
    ["chapter pecahan", { bookId: "yohanes", chapter: 3.5 }],
    ["chapter nol", { bookId: "yohanes", chapter: 0 }],
  ];

  it.each(hiddenNavigationCases)(
    "TIDAK menampilkan tombol navigasi untuk %s",
    async (_label, override) => {
      (dailyVerseRepo.fetchDailyVerseFromApi as jest.Mock).mockResolvedValue({
        reference: "Referensi Tidak Dapat Dipastikan 1:1",
        text: "Teks ayat tanpa navigasi yang dapat dipercaya.",
        translation: "Terjemahan Baru",
        ...override,
      });

      await act(async () => {
        renderer = create(<DailyVerseCard />);
        await Promise.resolve();
      });

      const readButtons = renderer.root
        .findAllByProps({ accessibilityRole: "button" })
        .filter((n) => n.props?.accessibilityLabel?.includes("Baca pasal lengkap"));
      expect(readButtons.length).toBe(0);
    }
  );

  const yohanesChapterCount = placeholderBible.books.find((b) => b.id === "yohanes")!.chapters.length;

  it.each([
    [yohanesChapterCount, true],
    [yohanesChapterCount + 1, false],
  ] as [number, boolean][])(
    "batas pasal %i: tombol navigasi %s",
    async (chapter, shouldRender) => {
      (dailyVerseRepo.fetchDailyVerseFromApi as jest.Mock).mockResolvedValue({
        reference: `Yohanes ${chapter}:1`,
        text: "Teks batas pasal.",
        translation: "Terjemahan Baru",
        bookId: "yohanes",
        chapter,
      });

      await act(async () => {
        renderer = create(<DailyVerseCard />);
        await Promise.resolve();
      });

      const readButtons = renderer.root.findAllByProps({
        accessibilityLabel: `Baca pasal lengkap Yohanes ${chapter}:1`,
      });
      if (shouldRender) {
        expect(readButtons.length).toBeGreaterThan(0);
      } else {
        expect(readButtons.length).toBe(0);
      }
    }
  );
});
