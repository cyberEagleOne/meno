import * as Notifications from "expo-notifications";
import { logger } from "./logger";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationStatus {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Checks and requests notification permissions.
 */
export async function requestNotificationPermission(): Promise<NotificationStatus> {
  const { status: existingStatus, canAskAgain: existingCanAskAgain } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  let finalCanAskAgain = existingCanAskAgain;

  if (existingStatus !== "granted") {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
    finalCanAskAgain = requestedPermission.canAskAgain;
  }

  return {
    granted: finalStatus === "granted",
    canAskAgain: finalCanAskAgain,
  };
}

/**
 * Schedules a daily reading reminder notification.
 */
export async function scheduleDailyReminder(hour: number = 7, minute: number = 0): Promise<string> {
  const permission = await requestNotificationPermission();
  if (!permission.granted) {
    throw new Error("Izin notifikasi tidak diberikan oleh pengguna.");
  }

  // Cancel any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Meno — Waktu Membaca Alkitab",
      body: "Satu pasal saja sudah cukup untuk hari ini. Mari luangkan waktu sejenak.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  logger.info("GENERAL", "daily_reminder_scheduled", { hour, minute, notificationId: id });
  return id;
}

/**
 * Sends an immediate test notification to demonstrate functionality.
 */
export async function triggerTestNotification(): Promise<void> {
  const permission = await requestNotificationPermission();
  if (!permission.granted) {
    throw new Error("Izin notifikasi tidak diberikan oleh pengguna.");
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Meno — Pengingat Berhasil Diuji!",
      body: "Fitur notifikasi lokal aktif dan siap menemani kebiasaan membaca harianmu.",
      sound: true,
    },
    trigger: null, // triggers immediately
  });
  logger.info("GENERAL", "test_notification_triggered");
}
