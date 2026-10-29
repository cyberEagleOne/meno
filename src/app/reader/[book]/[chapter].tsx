import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { IconBack, IconCheck, IconChevron } from "../../../components/ui/Icons";
import { Mascot } from "../../../components/ui/Mascot";
import { PlaceholderBanner } from "../../../components/ui/PlaceholderBanner";
import { StateMessage } from "../../../components/ui/StateMessage";
import { VerseRow } from "../../../components/ui/VerseRow";
import { placeholderBible } from "../../../data/placeholderBible";
import { useProgress } from "../../../data/progressContext";
import {
  getBook,
  getChapter,
  getNextChapter,
  getPreviousChapter,
} from "../../../domain/bibleNavigation";
import { isCompleted, restoreScrollOffset } from "../../../domain/progress";
import type { ChapterLocation, Verse } from "../../../domain/types";
import { colors, fonts, radius } from "../../../theme/colors";

const CHEERS = ["Mantap!", "Bagus sekali!", "Satu pasal tuntas!", "Pelan tapi pasti!"];

const BURST = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return {
    dx: Math.round(Math.cos(a) * 70),
    dy: Math.round(Math.sin(a) * 38 - 24),
    color: [colors.gold, colors.mint, colors.lavender, colors.coral, colors.gold][i % 5],
  };
});

const FONT_SIZES = [
  { label: "Kecil", size: 16, lineHeight: 28 },
  { label: "Sedang", size: 19, lineHeight: 35 },
  { label: "Besar", size: 23, lineHeight: 42 },
  { label: "Ekstra", size: 27, lineHeight: 48 },
];

interface CompletionFailure {
  bookId: string;
  chapter: number;
  done: boolean;
}

function NavArrow({
  label,
  direction,
  disabled,
  onPress,
}: {
  label: string;
  direction: "prev" | "next";
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.arrow,
        disabled && styles.arrowDisabled,
        pressed && !disabled && styles.arrowPressed,
      ]}
    >
      {direction === "prev" ? (
        <IconBack size={22} color={disabled ? colors.stone : colors.indigo} />
      ) : (
        <IconChevron size={22} color={disabled ? colors.stone : colors.indigo} />
      )}
    </Pressable>
  );
}

export default function ReaderScreen() {
  const params = useLocalSearchParams<{ book: string; chapter: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completed, lastRead, openChapter, saveScroll, setCompleted } = useProgress();

  const bookId = params.book;
  const chapterNumber = Number(params.chapter);

  const book = getBook(placeholderBible, bookId);
  const chapter = getChapter(placeholderBible, bookId, chapterNumber);
  const previous = getPreviousChapter(placeholderBible, bookId, chapterNumber);
  const next = getNextChapter(placeholderBible, bookId, chapterNumber);

  const done = book && chapter ? isCompleted(completed, bookId, chapterNumber) : false;
  const cheer = CHEERS[(chapterNumber + (book?.canonicalOrder ?? 0)) % CHEERS.length];

  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const activeFont = FONT_SIZES[fontSizeIdx];

  const [toastKey, setToastKey] = useState<string | null>(null);
  const [completionPending, setCompletionPending] = useState(false);
  const [completionError, setCompletionError] = useState<CompletionFailure | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [readRatio, setReadRatio] = useState(0);
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const scrollRef = useRef<FlatList<Verse>>(null);
  const restoredForKey = useRef<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [burst] = useState(() => new Animated.Value(0));
  const [pop] = useState(() => new Animated.Value(1));
  const completionInFlight = useRef(false);
  const currentKey = `${bookId}:${chapterNumber}`;
  const currentRouteKey = useRef(currentKey);
  const visibleCompletionError =
    completionError?.bookId === bookId && completionError.chapter === chapterNumber
      ? completionError
      : null;
  const toast = toastKey === currentKey;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!book || !chapter) return;
    openChapter(bookId, chapterNumber);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [bookId, chapterNumber, book, chapter, openChapter]);

  // Route replaced in place: clear the restore latch and snap to the top
  // before the new chapter lays out, so a stale offset never survives into
  // the next chapter. Readiness is tracked per chapter key (readyKey) and is
  // only set from the layout event below — never reset from an effect.
  useEffect(() => {
    restoredForKey.current = null;
    scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [bookId, chapterNumber]);

  useLayoutEffect(() => {
    currentRouteKey.current = currentKey;
  }, [currentKey]);

  const onContentSizeChange = useCallback(() => {
    setReadyKey(`${bookId}:${chapterNumber}`);
  }, [bookId, chapterNumber]);

  // Reactive restoration: applies only once this chapter's content has laid
  // out AND the saved last-read actually points at it (openChapter may land
  // after the first layout); the latch is keyed to the chapter so it can
  // never permanently miss the correct target.
  useEffect(() => {
    if (readyKey !== currentKey || restoredForKey.current === currentKey) return;
    const offset = restoreScrollOffset(lastRead, bookId, chapterNumber);
    if (offset === null) return;
    restoredForKey.current = currentKey;
    if (offset > 0) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToOffset({ offset, animated: false });
      });
    }
  }, [readyKey, lastRead, bookId, chapterNumber, currentKey]);

  const onScroll = (event: {
    nativeEvent: {
      contentOffset: { y: number };
      contentSize: { height: number };
      layoutMeasurement: { height: number };
    };
  }) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    if (scrollable > 0) {
      setReadRatio(Math.min(Math.max(contentOffset.y / scrollable, 0), 1));
    }
    saveScroll(bookId, chapterNumber, Math.max(0, Math.round(contentOffset.y)));
  };

  const goTo = (location: ChapterLocation) => {
    router.replace({
      pathname: "/reader/[book]/[chapter]",
      params: { book: location.bookId, chapter: String(location.chapterNumber) },
    });
  };

  const performCompletion = async (
    done: boolean,
    targetBookId = bookId,
    targetChapter = chapterNumber,
  ) => {
    if (completionInFlight.current) return;
    completionInFlight.current = true;
    setCompletionPending(true);
    setCompletionError(null);
    const targetKey = `${targetBookId}:${targetChapter}`;
    try {
      await setCompleted(targetBookId, targetChapter, done);
      if (done) {
        if (currentRouteKey.current !== targetKey) return;
        setToastKey(targetKey);
        if (!reduceMotion) {
          burst.setValue(0);
          pop.setValue(1);
          Animated.parallel([
            Animated.timing(burst, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(pop, { toValue: 1.08, duration: 140, useNativeDriver: true }),
              Animated.timing(pop, { toValue: 1, duration: 140, useNativeDriver: true }),
            ]),
          ]).start();
        }
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastKey(null), 4500);
      } else {
        if (currentRouteKey.current === targetKey) setToastKey(null);
      }
    } catch {
      setCompletionError({ bookId: targetBookId, chapter: targetChapter, done });
    } finally {
      completionInFlight.current = false;
      setCompletionPending(false);
    }
  };

  if (!book || !chapter) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: "Not found" }} />
        <StateMessage title="Pasal tidak ditemukan" body="Pasal ini tidak ada dalam data contoh." />
      </View>
    );
  }

  const prevLabel = previous
    ? `Pasal sebelumnya: ${getBook(placeholderBible, previous.bookId)?.name} ${previous.chapterNumber}`
    : "Awal Alkitab, tidak ada pasal sebelumnya";
  const nextLabel = next
    ? `Pasal berikutnya: ${getBook(placeholderBible, next.bookId)?.name} ${next.chapterNumber}`
    : "Akhir Alkitab, tidak ada pasal berikutnya";
  const endNote = !next
    ? "Akhir Alkitab"
    : next.bookId !== bookId
      ? `Akhir ${book.name}. Berikutnya: ${getBook(placeholderBible, next.bookId)?.name} ${next.chapterNumber}`
      : `Akhir pasal ${chapterNumber}`;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: `${book.name} ${chapterNumber}` }} />
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 4) }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <IconBack />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {book.name} {chapterNumber}
        </Text>
        <View style={styles.topRightActions}>
          <Pressable
            onPress={() => setFontSizeIdx((prev) => (prev + 1) % FONT_SIZES.length)}
            accessibilityRole="button"
            accessibilityLabel={`Ubah ukuran teks, saat ini: ${activeFont.label}`}
            style={({ pressed }) => [styles.fontSizeBtn, pressed && styles.fontSizeBtnPressed]}
          >
            <Text style={styles.fontSizeBtnText}>A<Text style={styles.fontPlus}>±</Text></Text>
          </Pressable>
          <View style={[styles.doneSlot, !done && styles.invisible]}>
            <View style={styles.doneBadge}>
              <IconCheck size={18} color={colors.indigo} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.progressTrack} aria-hidden>
        <View style={[styles.progressFill, { width: `${Math.round(readRatio * 100)}%` }]} />
      </View>

      <View style={styles.bannerWrap}>
        <PlaceholderBanner />
      </View>

      <FlatList
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        data={chapter.verses}
        keyExtractor={(verse) => String(verse.number)}
        renderItem={({ item }) => (
          <View style={styles.verseLine}>
            <VerseRow
              verse={item}
              fontSize={activeFont.size}
              lineHeight={activeFont.lineHeight}
            />
          </View>
        )}
        ListHeaderComponent={
          <>
            <Chip tone="lavender" label={book.name} />
            <Text style={styles.chapterTitle}>Pasal {chapterNumber}</Text>
          </>
        }
        ListFooterComponent={
          <View style={styles.end}>
            <Mascot pose="calm" size={88} />
            <Text style={styles.endNote}>{endNote}</Text>
          </View>
        }
        onScroll={onScroll}
        scrollEventThrottle={100}
        onContentSizeChange={onContentSizeChange}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {done && toast ? (
          <Animated.View
            style={[styles.statusWrap, { transform: [{ scale: pop }] }]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${cheer} ${book.name} ${chapterNumber} ditandai selesai.`}
          >
            <View style={styles.cheerPill}>
              <Mascot pose="celebrating" size={40} />
              <Text style={styles.cheerText}>
                {cheer} {book.name} {chapterNumber} ditandai selesai.
              </Text>
            </View>
            {reduceMotion
              ? null
              : BURST.map((dot, i) => (
                  <Animated.View
                    key={i}
                    pointerEvents="none"
                    style={[
                      styles.burstDot,
                      {
                        backgroundColor: dot.color,
                        opacity: burst.interpolate({
                          inputRange: [0, 0.7, 1],
                          outputRange: [1, 1, 0],
                        }),
                        transform: [
                          {
                            translateX: burst.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, dot.dx],
                            }),
                          },
                          {
                            translateY: burst.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, dot.dy],
                            }),
                          },
                          {
                            scale: burst.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }),
                          },
                        ],
                      },
                    ]}
                  />
                ))}
          </Animated.View>
        ) : done ? (
          <View style={styles.statusWrap} accessibilityLiveRegion="polite" accessibilityLabel="Pasal selesai">
            <View style={styles.statusDone}>
              <IconCheck size={14} color={colors.goldText} />
              <Text style={styles.statusDoneText}>Pasal selesai</Text>
            </View>
          </View>
        ) : (
          <View style={styles.statusWrap} />
        )}

        {visibleCompletionError !== null ? (
          <View style={styles.completionError}>
            <Text style={styles.completionErrorText} accessibilityRole="alert">
              Penyimpanan gagal. Progres belum berubah; coba lagi.
            </Text>
            <Button
              variant="secondary"
              disabled={completionPending}
              onPress={() =>
                void performCompletion(
                  visibleCompletionError.done,
                  visibleCompletionError.bookId,
                  visibleCompletionError.chapter,
                )
              }
            >
              Coba lagi
            </Button>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <NavArrow
            label={prevLabel}
            direction="prev"
            disabled={!previous}
            onPress={() => previous && goTo(previous)}
          />
          <View style={styles.footerCenter}>
            {done ? (
              <Button
                variant="secondary"
                disabled={completionPending}
                onPress={() => void performCompletion(false)}
              >
                {completionPending ? "Menyimpan..." : "Batalkan penandaan"}
              </Button>
            ) : (
              <Button
                variant="gold"
                disabled={completionPending}
                onPress={() => void performCompletion(true)}
                accessibilityLabel={`Tandai selesai ${book.name} ${chapterNumber}`}
                icon={<IconCheck size={20} color={colors.indigo} />}
              >
                {completionPending ? "Menyimpan..." : "Tandai selesai"}
              </Button>
            )}
          </View>
          <NavArrow
            label={nextLabel}
            direction="next"
            disabled={!next}
            onPress={() => next && goTo(next)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  missing: {
    flex: 1,
    backgroundColor: colors.ivory,
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  backPressed: {
    backgroundColor: "rgba(39,42,85,0.08)",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors.indigo,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fontSizeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.divider,
  },
  fontSizeBtnPressed: {
    backgroundColor: colors.goldTint,
    borderColor: colors.gold,
  },
  fontSizeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.indigo,
  },
  fontPlus: {
    fontSize: 10,
    color: colors.goldText,
  },
  doneSlot: {
    width: 36,
    alignItems: "center",
  },
  invisible: {
    opacity: 0,
  },
  doneBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 6,
    marginHorizontal: 20,
    borderRadius: 3,
    backgroundColor: colors.divider,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.lavender,
  },
  bannerWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  chapterTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.indigo,
    marginTop: 8,
    marginBottom: 24,
  },
  verseLine: {
    borderLeftWidth: 3,
    borderStyle: "dashed",
    borderColor: "rgba(182,154,87,0.6)",
    paddingLeft: 12,
  },
  end: {
    alignItems: "center",
    marginTop: 32,
  },
  endNote: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    borderTopWidth: 2,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statusWrap: {
    minHeight: 40,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cheerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.mintTint,
    borderRadius: radius.full,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
  },
  cheerText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.mintInk,
  },
  statusDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDoneText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.goldText,
  },
  burstDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  completionError: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
  },
  completionErrorText: {
    color: colors.coralInk,
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerCenter: {
    flex: 1,
  },
  arrow: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.divider,
    borderBottomWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDisabled: {
    backgroundColor: "rgba(227,217,195,0.4)",
    borderColor: "transparent",
    borderBottomWidth: 0,
  },
  arrowPressed: {
    transform: [{ translateY: 3 }],
  },
});
