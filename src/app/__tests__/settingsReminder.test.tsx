import React from "react";
import { Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import SettingsScreen from "../settings";
import { getAppSetting, setAppSetting } from "../../data/db";
import { scheduleDailyReminder } from "../../services/notificationService";

jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock("../../data/appLockContext", () => ({
  useAppLock: () => ({
    enabled: false,
    busy: false,
    capability: { canAuthenticate: true },
    authError: null,
    updateEnabled: jest.fn(),
  }),
}));
jest.mock("../../components/ui/ReadingGoalForm", () => ({
  ReadingGoalForm: () => null,
}));
jest.mock("../../data/db", () => ({
  getAppSetting: jest.fn(),
  setAppSetting: jest.fn(),
}));
jest.mock("../../services/notificationService", () => ({
  scheduleDailyReminder: jest.fn(),
}));
jest.mock("@expo/ui/community/datetime-picker", () => ({
  DateTimePicker: (props: { onValueChange: (event: object, selectedTime: Date) => void }) => {
    const ReactActual = jest.requireActual<typeof import("react")>("react");
    const NativeActual = jest.requireActual<typeof import("react-native")>("react-native");
    return ReactActual.createElement(
      NativeActual.Pressable,
      {
        accessibilityRole: "button",
        accessibilityLabel: "Confirm test reminder time",
        onPress: () => props.onValueChange({}, new Date(2026, 10, 26, 9, 15)),
      },
      ReactActual.createElement(NativeActual.Text, null, "Confirm test time"),
    );
  },
}));

describe("Settings reminder controls", () => {
  let renderer: ReactTestRenderer | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    (getAppSetting as jest.Mock).mockResolvedValue("08:30");
    (setAppSetting as jest.Mock).mockResolvedValue(undefined);
    (scheduleDailyReminder as jest.Mock).mockResolvedValue("reminder-id");
  });

  afterEach(() => {
    if (renderer) act(() => renderer?.unmount());
    renderer = undefined;
  });

  it("loads the saved reminder time and reschedules once after a new time is confirmed", async () => {
    await act(async () => {
      renderer = create(<SettingsScreen />);
      await Promise.resolve();
    });

    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === "08:30")).toBe(true);

    const openPicker = renderer!.root.findByProps({
      accessibilityLabel: "Ubah waktu pengingat, saat ini 08:30",
    });
    await act(async () => openPicker.props.onPress());

    const confirmTime = renderer!.root.findByProps({
      accessibilityLabel: "Confirm test reminder time",
    });
    await act(async () => {
      confirmTime.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(setAppSetting).toHaveBeenCalledWith("daily_reminder_time", "09:15");
    expect(scheduleDailyReminder).toHaveBeenCalledTimes(1);
    expect(scheduleDailyReminder).toHaveBeenCalledWith(9, 15);
    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === "09:15")).toBe(true);
    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === "Pengingat aktif")).toBe(true);
  });

  it("shows actionable guidance when Android notification permission is denied", async () => {
    (scheduleDailyReminder as jest.Mock).mockRejectedValueOnce(
      new Error("Izin notifikasi tidak diberikan oleh pengguna."),
    );
    await act(async () => {
      renderer = create(<SettingsScreen />);
      await Promise.resolve();
    });

    const openPicker = renderer!.root.findByProps({
      accessibilityLabel: "Ubah waktu pengingat, saat ini 08:30",
    });
    await act(async () => openPicker.props.onPress());
    const confirmTime = renderer!.root.findByProps({
      accessibilityLabel: "Confirm test reminder time",
    });
    await act(async () => {
      confirmTime.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === "Jadwal belum aktif")).toBe(true);
    expect(
      renderer!.root.findAllByType(Text).some((node) =>
        String(node.props.children).includes("Aktifkan notifikasi Meno di Pengaturan Android"),
      ),
    ).toBe(true);
    expect(setAppSetting).toHaveBeenCalledWith("daily_reminder_time", "09:15");
    expect(scheduleDailyReminder).toHaveBeenCalledTimes(1);
  });
});
