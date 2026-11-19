import * as Notifications from "expo-notifications";
import { requestNotificationPermission } from "../notificationService";

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
});
