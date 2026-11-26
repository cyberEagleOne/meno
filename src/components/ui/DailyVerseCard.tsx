import { useEffect, useState, useCallback } from "react";
import {
  AppState,
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
import { getLocalDateKey } from "../../data/dailyVerseRepository";
import { useBible } from "../../data/bibleContext";
import { logger } from "../../services/logger";

export function DailyVerseCard() {
  const router = useRouter();
  const { bible, getDailyVerse } = useBible();
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "empty" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryTrigger, setRetryTrigger] = useState<number>(0);
  const [dateKey, setDateKey] = useState(() => getLocalDateKey());

  // Recompute on local midnight and whenever Android resumes the app. The
  // foreground check also covers time-zone or clock changes while suspended.
  useEffect(() => {
    const refreshDate = () => {
      const nextDateKey = getLocalDateKey();
      if (nextDateKey !== dateKey) setStatus("loading");
      setDateKey(nextDateKey);
    };
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshDate();
    });

    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 50);
    const timeout = setTimeout(refreshDate, Math.max(50, nextMidnight.getTime() - Date.now()));

    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
  }, [dateKey]);

  useEffect(() => {
    let isMounted = true;

    getDailyVerse(dateKey)
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
          logger.error("BIBLE", "daily_verse_load_failed", err, { localDateKey: dateKey });
          setStatus("error");
          setErrorMessage("Ayat dari database ILT3 belum dapat dimuat. Silakan coba lagi.");
      });

    return () => {
      isMounted = false;
    };
  }, [dateKey, getDailyVerse, retryTrigger]);

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
            label="Ayat Harian"
            tone="gold"
            icon={<IconSpark size={12} color={colors.goldText} />}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.loadingText}>Memuat ayat dari ILT3...</Text>
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
            label="Ayat Harian"
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
            label="Ayat Harian"
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
          label="Ayat Hari Ini"
          tone="gold"
          icon={<IconSpark size={12} color={colors.goldText} />}
        />
        <Text style={styles.translationBadge}>{verse.translation}</Text>
      </View>

      <Text style={styles.verseText}>“{verse.text}”</Text>
      <Text style={styles.referenceText}>{verse.reference}</Text>

      {verse.bookId &&
      typeof verse.chapter === "number" &&
      Number.isInteger(verse.chapter) &&
      bible?.books.some(
        (b) => b.id === verse.bookId && verse.chapter! >= 1 && verse.chapter! <= b.chapters.length
      ) ? (
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
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  translationBadge: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: "right",
    flexShrink: 1,
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
    fontSize: 16,
    lineHeight: 25,
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
