import { useState } from "react";
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

export default function SettingsScreen() {
  const router = useRouter();
  const { enabled, busy, capability, authError, updateEnabled } = useAppLock();

  const [notificationMsg, setNotificationMsg] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [lockMsg, setLockMsg] = useState<string>("");

  const handleScheduleReminder = async () => {
    setIsScheduling(true);
    setNotificationMsg("");
    try {
      await scheduleDailyReminder(7, 0);
      setNotificationMsg("Pengingat harian dijadwalkan setiap pukul 07:00 WIB.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengatur notifikasi.";
      setNotificationMsg(`Error: ${msg}`);
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
              Bangun kebiasaan membaca dengan satu pengingat lokal yang tenang setiap pagi.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                isScheduling && styles.disabled,
                pressed && !isScheduling && styles.pressed,
              ]}
              onPress={handleScheduleReminder}
              disabled={isScheduling}
              accessibilityRole="button"
              accessibilityLabel="Jadwalkan pengingat pukul 07.00"
            >
              <Text style={styles.actionButtonText}>
                {isScheduling ? "Menjadwalkan..." : "Jadwalkan Jam 07:00"}
              </Text>
            </Pressable>
            {notificationMsg ? (
              <Text style={styles.serviceFeedbackText}>{notificationMsg}</Text>
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
