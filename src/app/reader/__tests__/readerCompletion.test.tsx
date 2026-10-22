import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { Button } from "../../../components/ui/Button";
import ReaderScreen from "../[book]/[chapter]";

let mockSetCompleted: jest.Mock;
let mockRouteParams = { book: "kejadian", chapter: "1" };
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({ back: jest.fn(), replace: jest.fn() }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("../../../data/progressContext", () => {
  const ReactActual = jest.requireActual<typeof import("react")>("react");
  return {
    useProgress: () => {
      const [completed, setCompletedState] = ReactActual.useState<Record<string, string>>({});
      return {
        completed,
        lastRead: null,
        openChapter: jest.fn(),
        saveScroll: jest.fn(),
        setCompleted: async (bookId: string, chapter: number, done: boolean) => {
          await mockSetCompleted(bookId, chapter, done);
          setCompletedState((previous) => {
            const next = { ...previous };
            const key = `${bookId}:${chapter}`;
            if (done) next[key] = new Date().toISOString();
            else delete next[key];
            return next;
          });
        },
      };
    },
  };
});

describe("reader completion feedback", () => {
  let renderer: ReactTestRenderer;

  beforeEach(() => {
    mockSetCompleted = jest.fn().mockResolvedValue(undefined);
    mockRouteParams = { book: "kejadian", chapter: "1" };
  });

  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
    jest.clearAllMocks();
  });

  function markButton() {
    return renderer.root.find(
      (node) => node.props.accessibilityLabel === "Tandai selesai Kejadian 1",
    );
  }

  it("shows celebration only after the completion write succeeds", async () => {
    let resolveWrite!: () => void;
    mockSetCompleted.mockImplementation(
      () => new Promise<void>((resolve) => { resolveWrite = resolve; }),
    );
    await act(async () => {
      renderer = create(<ReaderScreen />);
      await Promise.resolve();
    });

    act(() => {
      markButton().props.onPress();
      markButton().props.onPress();
    });
    expect(mockSetCompleted).toHaveBeenCalledTimes(1);
    expect(renderer.root.findAllByType(Button).some((button) => button.props.disabled)).toBe(true);
    expect(renderer.root.findAll((node) => node.props.accessibilityLabel?.includes("ditandai selesai."))).toHaveLength(0);

    await act(async () => {
      resolveWrite();
      await Promise.resolve();
    });
    expect(
      renderer.root.findAll((node) => node.props.accessibilityLabel?.includes("ditandai selesai.")).length,
    ).toBeGreaterThan(0);
  });

  it("shows a retry action when persistence fails", async () => {
    mockSetCompleted.mockRejectedValue(new Error("write failed"));
    await act(async () => {
      renderer = create(<ReaderScreen />);
      await Promise.resolve();
    });

    await act(async () => {
      markButton().props.onPress();
      await Promise.resolve();
    });
    expect(
      renderer.root.findAll(
        (node) => node.props.children === "Penyimpanan gagal. Progres belum berubah; coba lagi.",
      ).length,
    ).toBeGreaterThan(0);
    const retry = renderer.root.findAllByType(Button).find((button) => button.props.children === "Coba lagi");
    expect(retry).toBeDefined();
  });

  it("clears a failed chapter's retry action after navigating elsewhere", async () => {
    mockSetCompleted.mockRejectedValueOnce(new Error("write failed"));
    await act(async () => {
      renderer = create(<ReaderScreen />);
      await Promise.resolve();
    });
    await act(async () => {
      markButton().props.onPress();
      await Promise.resolve();
    });

    expect(renderer.root.findAllByType(Button).some((button) => button.props.children === "Coba lagi")).toBe(true);

    mockRouteParams = { book: "kejadian", chapter: "2" };
    await act(async () => {
      renderer.update(<ReaderScreen />);
      await Promise.resolve();
    });
    expect(renderer.root.findAllByType(Button).some((button) => button.props.children === "Coba lagi")).toBe(false);

    await act(async () => {
      renderer.root.find(
        (node) => node.props.accessibilityLabel === "Tandai selesai Kejadian 2",
      ).props.onPress();
      await Promise.resolve();
    });
    expect(mockSetCompleted).toHaveBeenLastCalledWith("kejadian", 2, true);
  });
});
