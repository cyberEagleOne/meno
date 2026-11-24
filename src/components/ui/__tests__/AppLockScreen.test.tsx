import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Alert } from "react-native";

import { AppLockScreen } from "../AppLockScreen";
import { useAppLock } from "../../../data/appLockContext";

jest.mock("../../../data/appLockContext", () => ({
  useAppLock: jest.fn(),
}));

jest.spyOn(Alert, "alert");

describe("AppLockScreen Component", () => {
  let renderer: ReactTestRenderer;
  const mockUnlock = jest.fn();
  const mockDisableRecovery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnlock.mockResolvedValue({ success: true });
    (useAppLock as jest.Mock).mockReturnValue({
      status: "ready",
      enabled: true,
      locked: true,
      busy: false,
      authError: null,
      capability: {
        hasHardware: true,
        isEnrolled: true,
        supportedTypes: ["Sidik Jari (Fingerprint)"],
        securityLevel: 3,
        canAuthenticate: true,
      },
      unlock: mockUnlock,
      disableRecovery: mockDisableRecovery,
      retry: jest.fn(),
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
      return node.props.children
        .map((c: any) => (typeof c === "object" ? getNodeText(c) : String(c ?? "")))
        .join("");
    }
    return "";
  }

  it("renders branded header, title, and manual 'Buka Meno' button", async () => {
    await act(async () => {
      renderer = create(<AppLockScreen />);
      await Promise.resolve();
    });

    const root = renderer.root;
    const titleNodes = root.findAll((n) => getNodeText(n).includes("Buka dengan identitas perangkatmu"));
    expect(titleNodes.length).toBeGreaterThan(0);

    const eyebrowNodes = root.findAll((n) => getNodeText(n).includes("MENO TERKUNCI"));
    expect(eyebrowNodes.length).toBeGreaterThan(0);

    const buttonNodes = root.findAll((n) => getNodeText(n).includes("Buka Meno"));
    expect(buttonNodes.length).toBeGreaterThan(0);
  });

  it("triggers automatic authentication exactly once on mount", async () => {
    await act(async () => {
      renderer = create(<AppLockScreen />);
      await Promise.resolve();
    });

    expect(mockUnlock).toHaveBeenCalledTimes(1);
  });

  it("prevents duplicate authentication calls on re-renders", async () => {
    await act(async () => {
      renderer = create(<AppLockScreen />);
      await Promise.resolve();
    });

    expect(mockUnlock).toHaveBeenCalledTimes(1);

    // Trigger re-render with the same instance
    await act(async () => {
      renderer.update(<AppLockScreen />);
      await Promise.resolve();
    });

    expect(mockUnlock).toHaveBeenCalledTimes(1);
  });

  it("allows manual retry when 'Buka Meno' button is pressed", async () => {
    await act(async () => {
      renderer = create(<AppLockScreen />);
      await Promise.resolve();
    });

    expect(mockUnlock).toHaveBeenCalledTimes(1);

    const button = renderer.root.findAll(
      (n) => typeof n.props.onPress === "function" && getNodeText(n).includes("Buka Meno"),
    )[0];
    await act(async () => {
      button.props.onPress();
      await Promise.resolve();
    });

    expect(mockUnlock).toHaveBeenCalledTimes(2);
  });

  it("does not trigger auto-prompt when device authentication is unavailable", async () => {
    (useAppLock as jest.Mock).mockReturnValue({
      status: "ready",
      enabled: true,
      locked: true,
      busy: false,
      authError: null,
      capability: {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        securityLevel: 0,
        canAuthenticate: false,
      },
      unlock: mockUnlock,
      disableRecovery: mockDisableRecovery,
      retry: jest.fn(),
    });

    await act(async () => {
      renderer = create(<AppLockScreen />);
      await Promise.resolve();
    });

    expect(mockUnlock).not.toHaveBeenCalled();

    const recoveryNote = renderer.root.findAll((n) =>
      getNodeText(n).includes("Perangkat ini tidak lagi memiliki biometrik"),
    );
    expect(recoveryNote.length).toBeGreaterThan(0);

    const disableBtn = renderer.root.findAll(
      (n) => typeof n.props.onPress === "function" && getNodeText(n).includes("Nonaktifkan kunci aplikasi"),
    )[0];
    expect(disableBtn).toBeDefined();

    // Trigger disable recovery alert
    await act(async () => {
      disableBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Nonaktifkan kunci aplikasi?",
      expect.any(String),
      expect.any(Array),
    );
  });

  it("does not trigger auto-prompt when context is already busy", async () => {
    (useAppLock as jest.Mock).mockReturnValue({
      status: "ready",
      enabled: true,
      locked: true,
      busy: true,
      authError: null,
      capability: {
        hasHardware: true,
        isEnrolled: true,
        supportedTypes: ["Sidik Jari (Fingerprint)"],
        securityLevel: 3,
        canAuthenticate: true,
      },
      unlock: mockUnlock,
      disableRecovery: mockDisableRecovery,
      retry: jest.fn(),
    });

    await act(async () => {
      renderer = create(<AppLockScreen />);
      await Promise.resolve();
    });

    expect(mockUnlock).not.toHaveBeenCalled();
  });

  it("renders authError message when present", async () => {
    (useAppLock as jest.Mock).mockReturnValue({
      status: "ready",
      enabled: true,
      locked: true,
      busy: false,
      authError: "Sidik jari tidak cocok.",
      capability: {
        hasHardware: true,
        isEnrolled: true,
        supportedTypes: ["Sidik Jari (Fingerprint)"],
        securityLevel: 3,
        canAuthenticate: true,
      },
      unlock: mockUnlock,
      disableRecovery: mockDisableRecovery,
      retry: jest.fn(),
    });

    await act(async () => {
      renderer = create(<AppLockScreen />);
      await Promise.resolve();
    });

    const errorNode = renderer.root.findAll((n) => getNodeText(n).includes("Sidik jari tidak cocok."));
    expect(errorNode.length).toBeGreaterThan(0);
  });
});
