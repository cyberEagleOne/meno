import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";

import { colors, fonts, radius } from "../../theme/colors";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { IconSpark } from "./Icons";
import { DailyVerse } from "../../domain/dailyVerse";
import { fetchDailyVerseFromApi } from "../../data/dailyVerseRepository";

export function DailyVerseCard() {
  const router = useRouter();
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "empty" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    fetchDailyVerseFromApi()
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setStatus("empty");
        } else {
          setVerse(data);
          setStatus("success");
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setStatus("error");
        const msg = err instanceof Error ? err.message : "Gagal memuat ayat harian.";
        setErrorMessage(msg);
      });

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  const handleRetry = useCallback(() => {
    setStatus("loading");
    setErrorMessage("");
    setRetryTrigger((prev) => prev + 1);
  }, []);

  // 1. Loading State
  if (status === "loading") {
    return (
      <Card tone="surface" style={styles.card}>
        <View style={styles.headerRow}>
          <Chip
            label="Ayat Harian (API)"
            tone="gold"
            icon={<IconSpark size={12} color={colors.goldText} />}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.loadingText}>Menghubungkan ke API ayat harian...</Text>
        </View>
      </Card>
    );
  }

  // 2. Error State with Retry
  if (status === "error") {
    return (
      <Card tone="surface" style={styles.card}>
        <View style={styles.headerRow}>
          <Chip
            label="Ayat Harian (API)"
            tone="coral"
            icon={<IconSpark size={12} color={colors.coralInk} />}
          />
        </View>
        <Text style={styles.errorTitle}>Gagal Memuat Ayat</Text>
        <Text style={styles.errorBody}>{errorMessage}</Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Coba lagi memuat ayat harian"
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </Pressable>
      </Card>
    );
  }

  // 3. Empty State
  if (status === "empty" || !verse) {
    return (
      <Card tone="surface" style={styles.card}>
        <View style={styles.headerRow}>
          <Chip
            label="Ayat Harian (API)"
            tone="gold"
            icon={<IconSpark size={12} color={colors.goldText} />}
          />
        </View>
        <Text style={styles.emptyText}>Tidak ada ayat harian yang tersedia saat ini.</Text>
      </Card>
    );
  }

  // 4. Success State
  return (
    <Card tone="surface" style={styles.card}>
      <View style={styles.headerRow}>
        <Chip
          label="Ayat Hari Ini (Online)"
          tone="gold"
          icon={<IconSpark size={12} color={colors.goldText} />}
        />
        <Text style={styles.translationBadge}>{verse.translation}</Text>
      </View>

      <Text style={styles.verseText}>“{verse.text}”</Text>
      <Text style={styles.referenceText}>{verse.reference}</Text>

      {verse.bookId && verse.chapter ? (
        <Pressable
          style={({ pressed }) => [styles.readButton, pressed && styles.buttonPressed]}
          onPress={() => {
            router.push({
              pathname: "/reader/[book]/[chapter]",
              params: { book: verse.bookId!, chapter: String(verse.chapter) },
            });
          }}
          accessibilityRole="button"
          accessibilityLabel={`Baca pasal lengkap ${verse.reference}`}
        >
          <Text style={styles.readButtonText}>Baca Pasal Lengkap</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  translationBadge: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkMuted,
  },
  loadingContainer: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkMuted,
  },
  verseText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.indigo,
    fontStyle: "italic",
    marginBottom: 8,
  },
  referenceText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.goldText,
    marginBottom: 12,
  },
  readButton: {
    backgroundColor: colors.lavenderTint,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  readButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.lavenderInk,
  },
  errorTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.error,
    marginBottom: 4,
  },
  errorBody: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.coralTint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.coralInk,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkMuted,
    paddingVertical: 8,
  },
});
