import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { DailyVerseCard } from "../DailyVerseCard";

const mockGetDailyVerse = jest.fn();
const mockPush = jest.fn();
const mockBible = {
  books: [{ id: "yohanes", name: "Yohanes", canonicalOrder: 43, chapters: [{ number: 1 }, { number: 2 }, { number: 3 }] }],
};

jest.mock("../../../data/bibleContext", () => ({
  useBible: () => ({ bible: mockBible, getDailyVerse: mockGetDailyVerse }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));

const todayVerse = {
  reference: "Yohanes 3:16",
  text: "Karena begitu besar kasih Allah akan dunia ini.",
  translation: "ILT3",
  bookId: "yohanes",
  chapter: 3,
};

describe("DailyVerseCard local ILT3 integration", () => {
  let renderer: ReactTestRenderer;
  let appStateHandler: ((state: AppStateStatus) => void) | undefined;
  let appStateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 26, 12));
    jest.clearAllMocks();
    appStateHandler = undefined;
    mockGetDailyVerse.mockResolvedValue(todayVerse);
    appStateSpy = jest.spyOn(AppState, "addEventListener").mockImplementation(((_type, handler) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    }) as typeof AppState.addEventListener);
  });

  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
    appStateSpy.mockRestore();
    jest.useRealTimers();
  });

  it("loads the date-keyed ILT3 verse and navigates to its reader chapter", async () => {
    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });

    expect(mockGetDailyVerse).toHaveBeenCalledWith("2026-11-26");
    expect(renderer.root.findByProps({ children: "Ayat Hari Ini" })).toBeTruthy();
    expect(renderer.root.findByProps({ children: "ILT3" })).toBeTruthy();
    expect(renderer.root.findAllByProps({ children: "Ayat Hari Ini (Online)" })).toHaveLength(0);

    const button = renderer.root.findByProps({ accessibilityLabel: "Baca pasal lengkap Yohanes 3:16" });
    await act(async () => button.props.onPress());
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/reader/[book]/[chapter]",
      params: { book: "yohanes", chapter: "3" },
    });
  });

  it("refreshes the verse after returning from background on the next local date", async () => {
    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });

    jest.setSystemTime(new Date(2026, 10, 27, 0, 5));
    await act(async () => {
      appStateHandler?.("background");
      appStateHandler?.("active");
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockGetDailyVerse).toHaveBeenLastCalledWith("2026-11-27");
  });

  it("shows an empty state when the local database returns no verses", async () => {
    mockGetDailyVerse.mockResolvedValue(null);
    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });
    expect(renderer.root.findByProps({ children: "Tidak ada ayat harian yang tersedia saat ini." })).toBeTruthy();
  });

  it("shows a retryable error state when the local database read fails", async () => {
    mockGetDailyVerse.mockRejectedValue(new Error("SQLite unavailable"));
    await act(async () => {
      renderer = create(<DailyVerseCard />);
      await Promise.resolve();
    });
    expect(renderer.root.findByProps({ children: "Gagal Memuat Ayat" })).toBeTruthy();
    expect(renderer.root.findByProps({ children: "Coba Lagi" })).toBeTruthy();
  });
});
