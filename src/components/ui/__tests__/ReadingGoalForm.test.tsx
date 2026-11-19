import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { TextInput } from "react-native";

import { ReadingGoalForm } from "../ReadingGoalForm";
import * as goalRepo from "../../../data/goalRepository";

jest.mock("../../../data/goalRepository");

describe("ReadingGoalForm Component (P4 & Part B)", () => {
  let renderer: ReactTestRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
    (goalRepo.getReadingGoal as jest.Mock).mockResolvedValue(null);
    (goalRepo.saveReadingGoal as jest.Mock).mockResolvedValue({
      target: 2,
      note: "Catatan komitmen valid",
      updatedAt: "2026-11-13T00:00:00Z",
    });
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => {
        renderer.unmount();
      });
    }
  });

  function getNodeText(node: any): string {
    if (typeof node?.props?.children === "string") return node.props.children;
    if (Array.isArray(node?.props?.children)) {
      return node.props.children.map((c: any) => (typeof c === "object" ? getNodeText(c) : String(c ?? ""))).join("");
    }
    return "";
  }

  it("displays empty state when no reading goal has been saved", async () => {
    await act(async () => {
      renderer = create(<ReadingGoalForm />);
      await Promise.resolve();
    });

    const emptyTexts = renderer.root.findAll((node) =>
      getNodeText(node).includes("Belum ada target membaca yang disimpan")
    );
    expect(emptyTexts.length).toBeGreaterThan(0);
  });

  it("displays saved goal when repository returns an existing goal", async () => {
    (goalRepo.getReadingGoal as jest.Mock).mockResolvedValue({
      target: 5,
      note: "Membaca 5 pasal setiap subuh",
      updatedAt: "2026-11-13T00:00:00Z",
    });

    await act(async () => {
      renderer = create(<ReadingGoalForm />);
      await Promise.resolve();
    });

    const activeTarget = renderer.root.findAll((node) =>
      getNodeText(node).includes("5 pasal per hari")
    );
    expect(activeTarget.length).toBeGreaterThan(0);
  });

  it("shows validation errors when input is invalid and does not call repository", async () => {
    await act(async () => {
      renderer = create(<ReadingGoalForm />);
      await Promise.resolve();
    });

    // Enter invalid target "99" and short note "no"
    const inputs = renderer.root.findAllByType(TextInput);
    act(() => {
      inputs[0].props.onChangeText("99");
      inputs[1].props.onChangeText("no");
    });

    // Submit form
    const submitBtn = renderer.root.find(
      (node) => node.props.accessibilityLabel === "Simpan Komitmen Bacaan"
    );
    act(() => {
      submitBtn.props.onPress();
    });

    expect(goalRepo.saveReadingGoal).not.toHaveBeenCalled();

    const errors = renderer.root.findAll((node) =>
      getNodeText(node).includes("Target wajib diisi angka antara 1 sampai 50 pasal")
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it("handles submission with anti-double-tap protection and renders success", async () => {
    let resolveSave!: (val: any) => void;
    (goalRepo.saveReadingGoal as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        })
    );

    await act(async () => {
      renderer = create(<ReadingGoalForm />);
      await Promise.resolve();
    });

    const inputs = renderer.root.findAllByType(TextInput);
    act(() => {
      inputs[0].props.onChangeText("3");
      inputs[1].props.onChangeText("Membaca firman setiap pagi.");
    });

    const submitBtn = renderer.root.find(
      (node) => node.props.accessibilityLabel === "Simpan Komitmen Bacaan"
    );

    // First press enters submitting state
    act(() => {
      submitBtn.props.onPress();
    });

    expect(goalRepo.saveReadingGoal).toHaveBeenCalledTimes(1);
    expect(submitBtn.props.disabled).toBe(true);

    // Second press is ignored while submitting
    act(() => {
      submitBtn.props.onPress();
    });
    expect(goalRepo.saveReadingGoal).toHaveBeenCalledTimes(1);

    // Resolve save promise
    await act(async () => {
      resolveSave({
        target: 3,
        note: "Membaca firman setiap pagi.",
        updatedAt: "2026-11-13T00:00:00Z",
      });
      await Promise.resolve();
    });

    const successFeedback = renderer.root.findAll((node) =>
      getNodeText(node).includes("Target dan catatan berhasil disimpan!")
    );
    expect(successFeedback.length).toBeGreaterThan(0);
  });

  it("displays error state with retry button when initial load fails", async () => {
    (goalRepo.getReadingGoal as jest.Mock).mockRejectedValueOnce(
      new Error("Database disconnected")
    );

    await act(async () => {
      renderer = create(<ReadingGoalForm />);
      await Promise.resolve();
    });

    const errorTitles = renderer.root.findAll((node) =>
      getNodeText(node).includes("Terjadi kesalahan saat memuat data")
    );
    expect(errorTitles.length).toBeGreaterThan(0);

    // Press retry
    (goalRepo.getReadingGoal as jest.Mock).mockResolvedValueOnce({
      target: 2,
      note: "Catatan setelah retry",
      updatedAt: "2026-11-13T00:00:00Z",
    });

    const retryBtn = renderer.root.find(
      (node) => node.props.accessibilityLabel === "Coba Lagi Memuat Target"
    );

    await act(async () => {
      retryBtn.props.onPress();
      await Promise.resolve();
    });

    expect(goalRepo.getReadingGoal).toHaveBeenCalledTimes(2);
  });
});

