import * as Notifications from "expo-notifications";
import { requestNotificationPermission, scheduleDailyReminder, triggerTestNotification } from "../notificationService";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

describe("requestNotificationPermission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the post-prompt canAskAgain value after permission denial", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "undetermined",
      canAskAgain: true,
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
      canAskAgain: false,
    });

    await expect(requestNotificationPermission()).resolves.toEqual({
      granted: false,
      canAskAgain: false,
    });
  });

  it("does not prompt again when permission is already granted", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
      canAskAgain: false,
    });

    await expect(requestNotificationPermission()).resolves.toEqual({
      granted: true,
      canAskAgain: false,
    });
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("schedules a daily reminder after permission and replaces older reminders", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted", canAskAgain: false });
    (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(undefined);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue("reminder-1");

    await expect(scheduleDailyReminder(8, 30)).resolves.toBe("reminder-1");
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ title: expect.any(String), body: expect.any(String) }),
      trigger: { type: "daily", hour: 8, minute: 30 },
    }));
  });

  it("does not schedule a reminder when permission is denied", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied", canAskAgain: false });
    await expect(scheduleDailyReminder()).rejects.toThrow("Izin notifikasi tidak diberikan");
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("triggers an immediate test notification after permission is granted", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted", canAskAgain: false });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue("test-1");
    await triggerTestNotification();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ title: expect.any(String), body: expect.any(String) }),
      trigger: null,
    }));
  });

  it("does not trigger a test notification when permission is denied", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied", canAskAgain: false });
    await expect(triggerTestNotification()).rejects.toThrow("Izin notifikasi tidak diberikan");
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
