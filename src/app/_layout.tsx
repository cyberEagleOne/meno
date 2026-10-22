import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, type ReactNode } from "react";

import { Button } from "../components/ui/Button";
import { StateMessage } from "../components/ui/StateMessage";
import { ProgressProvider, useProgress } from "../data/progressContext";
import { colors, fonts } from "../theme/colors";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ProgressProvider>
      <ProgressGate>
        <StatusBar style="dark" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: colors.ivory }, headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reader/[book]/[chapter]" />
          <Stack.Screen name="settings" />
        </Stack>
      </ProgressGate>
    </ProgressProvider>
  );
}

/**
 * Renders the app only once progress/database bootstrap is "ready". A failed
 * bootstrap is no longer silent: it surfaces an error with a retry wired to the
 * provider's real `retry()` (which re-runs driver + schema init, since the
 * provider only marks itself bootstrapped after a successful init).
 */
function ProgressGate({ children }: { children: ReactNode }) {
  const { status, retry } = useProgress();

  if (status === "ready") {
    return children;
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.centre}>
          <StateMessage
            tone="error"
            title="Gagal memuat data"
            body="Penyimpanan lokal belum siap. Coba lagi, atau tutup dan buka ulang aplikasi."
            action={<Button onPress={retry}>Coba lagi</Button>}
          />
        </View>
      </SafeAreaView>
    );
  }

  // "loading" — brief and self-resolving on the happy path, but kept visible so
  // a hung init is at least an honest loading state rather than empty screens.
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.centre} accessibilityRole="progressbar" accessibilityLabel="Menyiapkan data">
        <ActivityIndicator size="large" color={colors.indigo} />
        <Text style={styles.loadingText}>Menyiapkan data…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.inkMuted,
  },
});
