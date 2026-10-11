import { Link, Stack } from "expo-router";
import { memo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { placeholderBible } from "../data/placeholderBible";
import type { Book } from "../domain/types";

const BookRow = memo(function BookRow({ book }: { book: Book }) {
  return (
    <Link
      href={{ pathname: "/reader/[book]/[chapter]", params: { book: book.id, chapter: "1" } }}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${book.name}, chapter 1`}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <Text style={styles.rowTitle}>{book.name}</Text>
        <Text style={styles.rowMeta}>
          {book.chapters.length} placeholder chapter{book.chapters.length === 1 ? "" : "s"}
        </Text>
      </Pressable>
    </Link>
  );
});

export default function BookListScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.title}>Meno</Text>
        <Text style={styles.subtitle}>Placeholder reader — not Scripture</Text>
      </View>
      <FlatList
        data={placeholderBible.books}
        keyExtractor={(book) => book.id}
        renderItem={({ item }) => <BookRow book={item} />}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4C1D95",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEEDED",
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F1B24",
  },
  rowMeta: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
});
