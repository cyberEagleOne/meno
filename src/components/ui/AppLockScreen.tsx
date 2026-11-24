import { useEffect, useRef } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppLock } from "../../data/appLockContext";
import { colors, fonts, radius } from "../../theme/colors";
import { Button } from "./Button";
import { MenoMark } from "./MenoMark";

export function AppLockScreen() {
  const { busy, authError, capability, unlock, disableRecovery } = useAppLock();
  const unavailable = capability !== null && !capability.canAuthenticate;
  const hasAutoPrompted = useRef(false);

  useEffect(() => {
    if (hasAutoPrompted.current) return;
    if (busy || unavailable) return;

    hasAutoPrompted.current = true;
    void unlock();
  }, [busy, unavailable, unlock]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <MenoMark size={104} />
        </View>
        <Text style={styles.eyebrow}>MENO TERKUNCI</Text>
        <Text style={styles.title}>Buka dengan identitas perangkatmu</Text>
        <Text style={styles.body}>
          Kunci ini memakai biometrik atau PIN/pola perangkat. Meno tidak menyimpan PIN
          terpisah, dan progres bacaanmu tetap aman di perangkat ini.
        </Text>

        {authError ? (
          <Text style={styles.error} accessibilityRole="alert">
            {authError}
          </Text>
        ) : null}

        {unavailable ? (
          <>
            <Text style={styles.recoveryNote}>
              Perangkat ini tidak lagi memiliki biometrik atau kunci layar. Kamu bisa
              menonaktifkan kunci aplikasi untuk memulihkan akses.
            </Text>
            <Button
              variant="secondary"
              onPress={() =>
                Alert.alert(
                  "Nonaktifkan kunci aplikasi?",
                  "Akses akan terbuka tanpa verifikasi perangkat. Aktifkan lagi setelah kunci layar tersedia.",
                  [
                    { text: "Batal", style: "cancel" },
                    { text: "Nonaktifkan", style: "destructive", onPress: () => void disableRecovery() },
                  ],
                )
              }
            >
              Nonaktifkan kunci aplikasi
            </Button>
          </>
        ) : (
          <Button variant="gold" disabled={busy} onPress={() => void unlock()}>
            {busy ? "Memverifikasi..." : "Buka Meno"}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 16,
  },
  badge: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldTint,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  eyebrow: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.goldText,
    textAlign: "center",
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.indigo,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: "center",
  },
  error: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 19,
    color: colors.error,
    textAlign: "center",
    backgroundColor: colors.coralTint,
    borderRadius: radius.md,
    padding: 10,
  },
  recoveryNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.goldText,
    textAlign: "center",
    backgroundColor: colors.goldTint,
    borderRadius: radius.md,
    padding: 12,
  },
});
