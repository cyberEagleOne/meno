import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, type ReactNode } from "react";

import { AppLockScreen } from "../components/ui/AppLockScreen";
import { Button } from "../components/ui/Button";
import { StateMessage } from "../components/ui/StateMessage";
import { AppLockProvider, useAppLock } from "../data/appLockContext";
import { BibleProvider, useBible } from "../data/bibleContext";
import { ProgressProvider, useProgress } from "../data/progressContext";
import { logger } from "../services/logger";
import { colors, fonts } from "../theme/colors";

void SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    logger.error("APP_LIFECYCLE", "react_boundary_caught_error", error, {
      screen: "RootLayout",
    }, "Uncaught React component error rendered by ErrorBoundary");
  }, [error]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.centre}>
        <StateMessage
          tone="error"
          title="Terjadi kendala pada antarmuka"
          body={error?.message || "Terjadi kesalahan tidak terduga. Silakan coba muat ulang."}
          action={<Button onPress={retry}>Muat ulang tampilan</Button>}
        />
      </View>
    </SafeAreaView>
  );
}

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
      logger.info("APP_LIFECYCLE", "app_startup", { fontsLoaded: true });
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ProgressProvider>
      <ProgressGate>
        <BibleProvider>
          <BibleGate>
            <AppLockProvider>
              <AppLockGate>
                <StatusBar style="dark" />
                <Stack screenOptions={{ contentStyle: { backgroundColor: colors.ivory }, headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="reader/[book]/[chapter]" />
                  <Stack.Screen name="settings" />
                </Stack>
              </AppLockGate>
            </AppLockProvider>
          </BibleGate>
        </BibleProvider>
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
    logger.error("DATABASE", "bootstrap_gate_error", undefined, { status }, "Database initialization failed at ProgressGate");
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

/** Blocks the app until the bundled ILT3 metadata is validated and ready. */
function BibleGate({ children }: { children: ReactNode }) {
  const { status, error, retry } = useBible();

  if (status === "ready") {
    return children;
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.centre}>
          <StateMessage
            tone="error"
            title="Kitab Suci belum bisa dimuat"
            body={error || "Database terjemahan tidak dapat dibuka. Coba lagi."}
            action={<Button onPress={retry}>Coba lagi</Button>}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.centre} accessibilityRole="progressbar" accessibilityLabel="Menyiapkan Kitab Suci">
        <ActivityIndicator size="large" color={colors.indigo} />
        <Text style={styles.loadingText}>Menyiapkan Kitab Suci…</Text>
      </View>
    </SafeAreaView>
  );
}

/** Shows the lock screen after cold start or when the grace period expires. */
function AppLockGate({ children }: { children: ReactNode }) {
  const { status, locked, retry } = useAppLock();

  if (status === "error") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.centre}>
          <StateMessage
            tone="error"
            title="Kunci aplikasi gagal dimuat"
            body="Pengaturan kunci belum bisa dibaca. Coba lagi."
            action={<Button onPress={retry}>Coba lagi</Button>}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.centre} accessibilityRole="progressbar" accessibilityLabel="Menyiapkan kunci aplikasi">
          <ActivityIndicator size="large" color={colors.indigo} />
          <Text style={styles.loadingText}>Menyiapkan kunci aplikasi…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locked) return <AppLockScreen />;
  return children;
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
