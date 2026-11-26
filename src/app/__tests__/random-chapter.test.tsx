import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text } from "react-native";
import RandomChapterScreen from "../random-chapter";
import * as bibleContext from "../../data/bibleContext";
import * as sensorService from "../../services/sensorService";

const mockPush = jest.fn();
const mockGetChapter = jest.fn();
const mockCleanup = jest.fn();
const mockSetCompleted = jest.fn();
const mockBooks = [
  {
    id: "yohanes",
    name: "Yohanes",
    canonicalOrder: 1,
    chapters: [{ number: 3, verses: [] }, { number: 4, verses: [] }],
  },
];
const mockDestination = { bookId: "yohanes", bookName: "Yohanes", chapter: 3 };
let mockOnShake: ((destination: typeof mockDestination) => void) | undefined;

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, canGoBack: () => false }),
}));

jest.mock("../../data/bibleContext", () => ({
  useBible: jest.fn(),
  useBibleData: jest.fn(),
}));

jest.mock("../../data/progressContext", () => ({
  useProgress: () => ({ setCompleted: mockSetCompleted }),
}));

jest.mock("../../services/sensorService", () => ({
  getRandomChapter: jest.fn(),
  subscribeToShakeGesture: jest.fn(),
}));

jest.mock("../../components/ui/MenoMark", () => ({
  MenoMark: () => <></>,
}));

describe("RandomChapterScreen", () => {
  let renderer: ReactTestRenderer | undefined;

  const renderScreen = async () => {
    await act(async () => {
      renderer = create(<RandomChapterScreen />);
    });
  };

  const press = async (label: string) => {
    const button = renderer!.root.findByProps({ accessibilityLabel: label });
    await act(async () => {
      button.props.onPress();
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnShake = undefined;
    (bibleContext.useBible as jest.Mock).mockReturnValue({ getChapter: mockGetChapter });
    (bibleContext.useBibleData as jest.Mock).mockReturnValue({ books: mockBooks });
    (sensorService.getRandomChapter as jest.Mock).mockReturnValue(mockDestination);
    (sensorService.subscribeToShakeGesture as jest.Mock).mockImplementation((onShake) => {
      mockOnShake = onShake;
      return mockCleanup;
    });
    mockGetChapter.mockResolvedValue({
      number: 3,
      verses: [{ number: 1, text: "Satu" }, { number: 2, text: "Dua" }, { number: 3, text: "Tiga" }],
    });
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => renderer!.unmount());
      renderer = undefined;
    }
  });

  it("uses local Bible metadata, verifies the chapter, and shows its verse count", async () => {
    await renderScreen();
    await press("Acak pasal dari Kitab Suci");

    expect(sensorService.getRandomChapter).toHaveBeenCalledWith(mockBooks);
    expect(mockGetChapter).toHaveBeenCalledWith("yohanes", 3);
    expect(renderer!.root.findByProps({ accessibilityLabel: "Mulai membaca Yohanes pasal 3" })).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === "3")).toBe(true);
    expect(mockSetCompleted).not.toHaveBeenCalled();
  });

  it("navigates to the selected reader book and chapter", async () => {
    await renderScreen();
    await press("Acak pasal dari Kitab Suci");
    await press("Mulai membaca Yohanes pasal 3");

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/reader/[book]/[chapter]",
      params: { book: "yohanes", chapter: "3" },
    });
  });

  it("uses the same selector for Random Again", async () => {
    await renderScreen();
    await press("Acak pasal dari Kitab Suci");
    await press("Acak pasal lagi");

    expect(sensorService.getRandomChapter).toHaveBeenCalledTimes(2);
    expect(mockGetChapter).toHaveBeenCalledTimes(2);
  });

  it("shows an empty state when the selected database chapter has no verses", async () => {
    mockGetChapter.mockResolvedValue({ number: 3, verses: [] });
    await renderScreen();
    await press("Acak pasal dari Kitab Suci");

    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === "Ayat belum tersedia")).toBe(true);
    expect(renderer!.root.findAllByProps({ accessibilityRole: "button" }).length).toBeGreaterThan(0);
  });

  it("shows an error state when local chapter loading fails", async () => {
    mockGetChapter.mockRejectedValue(new Error("database read failed"));
    await renderScreen();
    await press("Acak pasal dari Kitab Suci");

    expect(renderer!.root.findByProps({ accessibilityRole: "alert" })).toBeTruthy();
    expect(renderer!.root.findAllByProps({ accessibilityRole: "button" }).length).toBeGreaterThan(0);
  });

  it("subscribes only while mounted and ignores duplicate shakes during database lookup", async () => {
    let resolveChapter: ((chapter: { number: number; verses: { number: number; text: string }[] }) => void) | undefined;
    mockGetChapter.mockImplementation(() => new Promise((resolve) => { resolveChapter = resolve; }));
    await renderScreen();

    expect(sensorService.subscribeToShakeGesture).toHaveBeenCalledTimes(1);
    expect(sensorService.subscribeToShakeGesture).toHaveBeenCalledWith(expect.any(Function), 2.0, mockBooks);
    await act(async () => {
      mockOnShake?.(mockDestination);
      mockOnShake?.(mockDestination);
    });
    expect(mockGetChapter).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveChapter?.({ number: 3, verses: [{ number: 1, text: "Satu" }] });
      await Promise.resolve();
    });

    await act(async () => renderer!.unmount());
    renderer = undefined;
    expect(mockCleanup).toHaveBeenCalledTimes(1);
  });
});
