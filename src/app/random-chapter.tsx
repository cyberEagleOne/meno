import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { MenoMark } from "../components/ui/MenoMark";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { StateMessage } from "../components/ui/StateMessage";
import { useBible, useBibleData } from "../data/bibleContext";
import type { Chapter } from "../domain/types";
import {
  getRandomChapter,
  subscribeToShakeGesture,
  type RandomVerseDestination,
} from "../services/sensorService";
import { colors, fonts, radius, space } from "../theme/colors";
import { formatNumber as fmt } from "../utils/formatters";

type RandomResult = {
  destination: RandomVerseDestination;
  verseCount: number;
};

type ScreenState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "result"; result: RandomResult }
  | { status: "empty"; destination?: RandomVerseDestination }
  | { status: "error"; message: string };

export default function RandomChapterScreen() {
  const router = useRouter();
  const bible = useBibleData();
  const { getChapter } = useBible();
  const [screenState, setScreenState] = useState<ScreenState>({ status: "idle" });
  const selectionInFlight = useRef(false);

  const verifyAndShowChapter = useCallback(async (destination: RandomVerseDestination) => {
    if (selectionInFlight.current) return;
    selectionInFlight.current = true;
    setScreenState({ status: "loading" });

    try {
      const book = bible.books.find((candidate) => candidate.id === destination.bookId);
      const chapterMetadata = book?.chapters.find((chapter) => chapter.number === destination.chapter);
      if (!book || !chapterMetadata) {
        setScreenState({ status: "error", message: "Pasal acak tidak ditemukan di database Kitab Suci." });
        return;
      }

      const chapter: Chapter | null = await getChapter(destination.bookId, destination.chapter);
      if (!chapter) {
        setScreenState({ status: "error", message: "Pasal ini tidak tersedia di database Kitab Suci." });
        return;
      }
      if (chapter.verses.length === 0) {
        setScreenState({ status: "empty", destination });
        return;
      }

      setScreenState({
        status: "result",
        result: { destination: { ...destination, bookName: book.name }, verseCount: chapter.verses.length },
      });
    } catch {
      setScreenState({
        status: "error",
        message: "Database Kitab Suci belum dapat dibaca. Coba acak kembali.",
      });
    } finally {
      selectionInFlight.current = false;
    }
  }, [bible.books, getChapter]);

  const chooseRandomChapter = useCallback(() => {
    if (selectionInFlight.current) return;
    if (bible.books.length === 0 || bible.books.every((book) => book.chapters.length === 0)) {
      setScreenState({ status: "empty" });
      return;
    }
    void verifyAndShowChapter(getRandomChapter(bible.books));
  }, [bible.books, verifyAndShowChapter]);

  useEffect(() => {
    return subscribeToShakeGesture((destination) => {
      void verifyAndShowChapter(destination);
    }, 2.0, bible.books);
  }, [bible.books, verifyAndShowChapter]);

  const result = screenState.status === "result" ? screenState.result : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScreenHeader title="Pasal Acak" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <MenoMark size={68} />
          <Text style={styles.title}>Temukan bacaan berikutnya</Text>
          <Text style={styles.description}>
            Pilih satu pasal secara spontan dari Kitab Suci. Kamu bisa mengacak lagi kapan saja.
          </Text>
        </View>

        {screenState.status === "idle" ? (
          <Card tone="indigo" style={styles.startCard}>
            <Text style={styles.startTitle}>Siap membaca?</Text>
            <Text style={styles.startBody}>Meno akan memilih pasal yang tersedia dari database lokal.</Text>
            <Button
              variant="gold"
              onPress={chooseRandomChapter}
              accessibilityLabel="Acak pasal dari Kitab Suci"
            >
              Acak Pasal
            </Button>
          </Card>
        ) : null}

        {screenState.status === "loading" ? (
          <View style={styles.stateWrap} accessibilityRole="progressbar" accessibilityLabel="Memeriksa pasal acak">
            <ActivityIndicator size="large" color={colors.indigo} />
            <Text style={styles.stateText}>Memeriksa pasal di database…</Text>
          </View>
        ) : null}

        {result ? (
          <Card tone="surface" style={styles.resultCard}>
            <Text style={styles.resultEyebrow}>PILIHAN UNTUKMU</Text>
            <Text style={styles.bookName}>{result.destination.bookName}</Text>
            <Text style={styles.chapterNumber}>Pasal {fmt(result.destination.chapter)}</Text>
            <View style={styles.verseCount}>
              <Text style={styles.verseCountNumber}>{fmt(result.verseCount)}</Text>
              <Text style={styles.verseCountLabel}>ayat tersedia</Text>
            </View>
            <Button
              onPress={() => router.push({
                pathname: "/reader/[book]/[chapter]",
                params: {
                  book: result.destination.bookId,
                  chapter: String(result.destination.chapter),
                },
              })}
              accessibilityLabel={`Mulai membaca ${result.destination.bookName} pasal ${result.destination.chapter}`}
            >
              Mulai Membaca
            </Button>
            <Button variant="secondary" onPress={chooseRandomChapter} accessibilityLabel="Acak pasal lagi">
              Acak Lagi
            </Button>
          </Card>
        ) : null}

        {screenState.status === "empty" ? (
          <Card tone="surface" style={styles.messageCard}>
            <StateMessage
              title="Ayat belum tersedia"
              body={screenState.destination
                ? `${screenState.destination.bookName} pasal ${screenState.destination.chapter} belum memiliki ayat di database.`
                : "Belum ada pasal yang dapat dipilih dari database Kitab Suci."}
              action={<Button onPress={chooseRandomChapter}>Acak Lagi</Button>}
            />
          </Card>
        ) : null}

        {screenState.status === "error" ? (
          <Card tone="surface" style={styles.messageCard}>
            <StateMessage
              tone="error"
              title="Pasal tidak dapat dimuat"
              body={screenState.message}
              action={<Button onPress={chooseRandomChapter}>Coba Lagi</Button>}
            />
          </Card>
        ) : null}

        {screenState.status !== "idle" ? (
          <Text style={styles.shakeHint}>Kocok perangkat untuk memilih pasal lain.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.ivory },
  content: { flexGrow: 1, paddingHorizontal: space.xl, paddingBottom: space.xxl },
  intro: { alignItems: "center", paddingTop: space.xl, paddingBottom: space.xxl },
  title: {
    marginTop: space.md,
    fontFamily: fonts.extrabold,
    fontSize: 25,
    lineHeight: 31,
    color: colors.indigo,
    textAlign: "center",
  },
  description: {
    maxWidth: 340,
    marginTop: space.sm,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: "center",
  },
  startCard: { gap: space.md, paddingVertical: space.xxl },
  startTitle: { fontFamily: fonts.bold, fontSize: 21, color: colors.ivory, textAlign: "center" },
  startBody: {
    marginBottom: space.sm,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ivory,
    textAlign: "center",
  },
  stateWrap: { minHeight: 190, justifyContent: "center", alignItems: "center", gap: space.md },
  stateText: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  resultCard: { gap: space.md, borderColor: colors.gold, padding: space.xl },
  resultEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.goldText,
    textAlign: "center",
  },
  bookName: { fontFamily: fonts.extrabold, fontSize: 29, lineHeight: 35, color: colors.indigo, textAlign: "center" },
  chapterNumber: { fontFamily: fonts.semibold, fontSize: 18, color: colors.inkMuted, textAlign: "center" },
  verseCount: {
    alignSelf: "center",
    minWidth: 150,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.mintTint,
    alignItems: "center",
  },
  verseCountNumber: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.mintInk },
  verseCountLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.mintInk },
  messageCard: { padding: 0 },
  shakeHint: {
    marginTop: space.lg,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
