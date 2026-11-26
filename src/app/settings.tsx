import { useEffect, useState } from "react";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, fonts, radius } from "../theme/colors";
import { Card } from "../components/ui/Card";
import { Chip } from "../components/ui/Chip";
import { IconChevron, IconSpark } from "../components/ui/Icons";
import { ReadingGoalForm } from "../components/ui/ReadingGoalForm";
import { useAppLock } from "../data/appLockContext";
import { scheduleDailyReminder } from "../services/notificationService";
import { getAppSetting, setAppSetting } from "../data/db";

type ReminderFeedback = {
  tone: "success" | "error";
  message: string;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { enabled, busy, capability, authError, updateEnabled } = useAppLock();

  const [reminderFeedback, setReminderFeedback] = useState<ReminderFeedback | null>(null);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<Date>(() => {
    const defaultTime = new Date();
    defaultTime.setHours(7, 0, 0, 0);
    return defaultTime;
  });
  const [lockMsg, setLockMsg] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const loadReminderTime = async () => {
      try {
        const savedTime = await getAppSetting("daily_reminder_time");
        const match = savedTime?.match(/^(\d{2}):(\d{2})$/);
        if (!match) return;

        const hour = Number(match[1]);
        const minute = Number(match[2]);
        if (hour > 23 || minute > 59) return;

        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        if (isMounted) setReminderTime(time);
      } catch {
        if (isMounted) {
          setReminderFeedback({
            tone: "error",
            message: "Waktu tersimpan tidak dapat dibaca. Waktu awal 07:00 digunakan.",
          });
        }
      }
    };

    void loadReminderTime();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleScheduleReminder = async (time: Date) => {
    setIsScheduling(true);
    setReminderFeedback(null);
    const hour = time.getHours();
    const minute = time.getMinutes();
    const formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    try {
      await setAppSetting("daily_reminder_time", formattedTime);
      setReminderTime(time);
      await scheduleDailyReminder(hour, minute);
      setReminderFeedback({
        tone: "success",
        message: `Pengingat harian dijadwalkan setiap hari pukul ${formattedTime}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengatur notifikasi.";
      const permissionDenied = msg.includes("Izin notifikasi tidak diberikan");
      setReminderFeedback({
        tone: "error",
        message: permissionDenied
          ? "Izin notifikasi belum diberikan. Aktifkan notifikasi Meno di Pengaturan Android, lalu pilih waktu lagi."
          : `Pengingat tidak dapat dijadwalkan. ${msg}`,
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleToggleLock = async (next: boolean) => {
    setLockMsg("");
    const result = await updateEnabled(next);
    if (result.success) {
      setLockMsg(
        next
          ? "Kunci aplikasi aktif. Kamu akan diminta verifikasi saat membuka Meno."
          : "Kunci aplikasi nonaktif.",
      );
    } else if (!result.cancelled) {
      setLockMsg(`Gagal: ${result.error ?? "autentikasi tidak berhasil"}`);
    }
  };

  const lockUnavailable = capability !== null && !capability.canAuthenticate;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.navHeader}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Kembali ke Beranda"
            >
              <View style={{ transform: [{ rotate: "180deg" }] }}>
                <IconChevron size={22} color={colors.indigo} />
              </View>
              <Text style={styles.backText}>Kembali</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Pengaturan</Text>
          </View>

          <ReadingGoalForm />

          <Card tone="surface" style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Chip
                label="Pengingat Harian"
                tone="lavender"
                icon={<IconSpark size={12} color={colors.lavenderInk} />}
              />
            </View>
            <Text style={styles.sectionTitle}>Pengingat Bacaan</Text>
            <Text style={styles.sectionDesc}>
              Pilih waktu untuk satu pengingat lokal yang berulang setiap hari. Meno akan meminta izin notifikasi saat kamu menyimpan jadwal.
            </Text>
            <View style={styles.timeSelectionCard}>
              <View style={styles.timeSelectionCopy}>
                <Text style={styles.timeSelectionLabel}>WAKTU HARIAN</Text>
                <Text style={styles.timeSelectionHint}>Berulang setiap hari</Text>
              </View>
              <Text style={styles.reminderTimeText} accessibilityLabel={`Waktu pilihan ${formatReminderTime(reminderTime)}`}>
                {formatReminderTime(reminderTime)}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                isScheduling && styles.disabled,
                pressed && !isScheduling && styles.pressed,
              ]}
              onPress={() => setShowTimePicker(true)}
              disabled={isScheduling}
              accessibilityRole="button"
              accessibilityLabel={`Ubah waktu pengingat, saat ini ${formatReminderTime(reminderTime)}`}
            >
              <Text style={styles.actionButtonText}>
                {isScheduling ? "Menjadwalkan..." : "Pilih Waktu Pengingat"}
              </Text>
            </Pressable>
            {showTimePicker ? (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour
                accentColor={colors.indigo}
                positiveButton={{ label: "Pilih" }}
                negativeButton={{ label: "Batal" }}
                onValueChange={(_event, selectedTime) => {
                  setShowTimePicker(false);
                  void handleScheduleReminder(selectedTime);
                }}
                onDismiss={() => setShowTimePicker(false)}
              />
            ) : null}
            {reminderFeedback ? (
              <View
                style={[
                  styles.reminderFeedback,
                  reminderFeedback.tone === "error"
                    ? styles.reminderFeedbackError
                    : styles.reminderFeedbackSuccess,
                ]}
                accessibilityLiveRegion="polite"
              >
                <Text
                  style={[
                    styles.reminderFeedbackTitle,
                    reminderFeedback.tone === "error"
                      ? styles.reminderFeedbackTitleError
                      : styles.reminderFeedbackTitleSuccess,
                  ]}
                >
                  {reminderFeedback.tone === "error" ? "Jadwal belum aktif" : "Pengingat aktif"}
                </Text>
                <Text style={styles.reminderFeedbackMessage}>{reminderFeedback.message}</Text>
              </View>
            ) : null}
          </Card>

          <Card tone="surface" style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Chip
                label="Privasi"
                tone="gold"
                icon={<IconSpark size={12} color={colors.goldText} />}
              />
            </View>
            <Text style={styles.sectionTitle}>Kunci Aplikasi</Text>
            <Text style={styles.sectionDesc}>
              Minta biometrik atau PIN/pola perangkat saat Meno dibuka. Setelah aplikasi
              ditinggalkan lebih dari 10 menit, verifikasi diminta lagi. Meno tidak
              menyimpan PIN terpisah.
            </Text>

            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.switchLabel}>Aktifkan kunci aplikasi</Text>
                <Text style={styles.switchHint}>
                  {capability === null
                    ? "Memeriksa keamanan perangkat..."
                    : capability.canAuthenticate
                      ? "Biometrik atau kunci layar tersedia."
                      : "Perangkat belum memiliki biometrik atau kunci layar."}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(next) => void handleToggleLock(next)}
                disabled={busy || lockUnavailable}
                trackColor={{ false: colors.divider, true: colors.mint }}
                thumbColor={enabled ? colors.mintInk : colors.stone}
                accessibilityLabel="Aktifkan kunci aplikasi"
              />
            </View>

            {lockMsg ? (
              <Text style={styles.serviceFeedbackText} accessibilityLiveRegion="polite">
                {lockMsg}
              </Text>
            ) : null}
            {authError ? (
              <Text style={styles.errorText} accessibilityRole="alert">
                {authError}
              </Text>
            ) : null}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatReminderTime(time: Date): string {
  return `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  backText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.indigo,
    marginLeft: 4,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.indigo,
  },
  sectionCard: {
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.divider,
  },
  cardHeaderRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.indigo,
    marginBottom: 6,
  },
  sectionDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginBottom: 14,
  },
  timeSelectionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  timeSelectionCopy: {
    flex: 1,
  },
  timeSelectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.inkMuted,
  },
  timeSelectionHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 3,
  },
  reminderTimeText: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.indigo,
  },
  actionButton: {
    backgroundColor: colors.indigo,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  disabled: {
    opacity: 0.6,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.indigo,
  },
  switchHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkMuted,
    marginTop: 2,
  },
  serviceFeedbackText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.indigo,
    marginTop: 10,
    backgroundColor: colors.ivory,
    padding: 8,
    borderRadius: radius.md,
  },
  reminderFeedback: {
    padding: 12,
    borderRadius: radius.md,
    marginTop: 12,
    borderWidth: 1,
  },
  reminderFeedbackSuccess: {
    backgroundColor: colors.mintTint,
    borderColor: colors.mint,
  },
  reminderFeedbackError: {
    backgroundColor: colors.coralTint,
    borderColor: colors.coral,
  },
  reminderFeedbackTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    marginBottom: 3,
  },
  reminderFeedbackTitleSuccess: {
    color: colors.mintInk,
  },
  reminderFeedbackTitleError: {
    color: colors.coralInk,
  },
  reminderFeedbackMessage: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.error,
    marginTop: 10,
    backgroundColor: colors.coralTint,
    padding: 8,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
