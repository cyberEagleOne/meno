import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VerseRow } from "../../../components/ui/VerseRow";
import { PLACEHOLDER_NOTICE, placeholderBible } from "../../../data/placeholderBible";
import {
  getBook,
  getChapter,
  getNextChapter,
  getPreviousChapter,
} from "../../../domain/bibleNavigation";
import type { ChapterLocation } from "../../../domain/types";

function NavButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        disabled && styles.navButtonDisabled,
        pressed && !disabled && styles.navButtonPressed,
      ]}
    >
      <Text style={[styles.navButtonText, disabled && styles.navButtonTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ReaderScreen() {
  const params = useLocalSearchParams<{ book: string; chapter: string }>();
  const router = useRouter();

  const bookId = params.book;
  const chapterNumber = Number(params.chapter);

  const book = getBook(placeholderBible, bookId);
  const chapter = getChapter(placeholderBible, bookId, chapterNumber);
  const previous = getPreviousChapter(placeholderBible, bookId, chapterNumber);
  const next = getNextChapter(placeholderBible, bookId, chapterNumber);

  const goTo = (location: ChapterLocation) => {
    router.replace({
      pathname: "/reader/[book]/[chapter]",
      params: { book: location.bookId, chapter: String(location.chapterNumber) },
    });
  };

  if (!book || !chapter) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <Stack.Screen options={{ title: "Not found" }} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>This chapter is not in the placeholder dataset.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen options={{ title: `${book.name} ${chapter.number}` }} />
      <FlatList
        data={chapter.verses}
        keyExtractor={(verse) => String(verse.number)}
        renderItem={({ item }) => <VerseRow verse={item} />}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        ListHeaderComponent={<Text style={styles.notice}>{PLACEHOLDER_NOTICE}</Text>}
      />
      <View style={styles.navBar}>
        <NavButton
          label="Previous chapter"
          disabled={previous === null}
          onPress={() => previous && goTo(previous)}
        />
        <NavButton
          label="Next chapter"
          disabled={next === null}
          onPress={() => next && goTo(next)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFBEB",
  },
  list: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  notice: {
    fontSize: 12,
    color: "#B45309",
    marginBottom: 16,
  },
  navBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EEEDED",
    backgroundColor: "#FFFFFF",
  },
  navButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#4C1D95",
    paddingHorizontal: 12,
  },
  navButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  navButtonPressed: {
    opacity: 0.8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  navButtonTextDisabled: {
    color: "#94A3B8",
  },
});
