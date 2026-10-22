import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { IconBook, IconChevron, IconCheck, IconSearch } from "../../components/ui/Icons";
import { Mascot } from "../../components/ui/Mascot";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { StateMessage } from "../../components/ui/StateMessage";
import {
  TESTAMENT_LABEL,
  TESTAMENT_TOTALS,
  booksByTestament,
  testamentOf,
  type Testament,
} from "../../data/canon";
import { placeholderBible } from "../../data/placeholderBible";
import { useProgress } from "../../data/progressContext";
import { doneInBook } from "../../domain/progress";
import type { Book } from "../../domain/types";
import { colors, fonts, radius } from "../../theme/colors";

interface BookRowProps {
  book: Book;
  doneCount: number;
  isLast: boolean;
  onPress: () => void;
}

function BookRow({ book, doneCount, isLast, onPress }: BookRowProps) {
  const full = doneCount === book.chapters.length;
  const t = testamentOf(book);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${book.name}, ${book.chapters.length} pasal${doneCount > 0 ? `, ${doneCount} selesai` : ""}`}
      style={({ pressed }) => [
        styles.row,
        isLast && styles.rowLast,
        full && !isLast && styles.rowFull,
        pressed && styles.rowPressed,
      ]}
    >
      <ProgressRing
        value={doneCount}
        max={book.chapters.length}
        size={44}
        stroke={5}
        trackColor={colors.divider}
        barColor={full ? colors.mintInk : colors.gold}
        decorative
      >
        {full ? (
          <IconCheck size={18} color={colors.mintInk} />
        ) : (
          <IconBook size={18} color={t === "PL" ? colors.mintInk : colors.lavenderInk} />
        )}
      </ProgressRing>
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>
          {book.name}
        </Text>
        <Text style={styles.rowMeta}>
          {book.chapters.length} pasal{doneCount > 0 ? ` · ${doneCount} selesai` : ""}
        </Text>
      </View>
      {isLast ? <Chip label="Terakhir dibaca" tone="gold" /> : null}
      <IconChevron size={20} color={colors.inkMuted} />
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const { completed, lastRead } = useProgress();
  const [query, setQuery] = useState("");

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filter = (t: Testament) =>
      booksByTestament(placeholderBible, t).filter((b) => b.name.toLowerCase().includes(q));
    const pl = filter("PL");
    const pb = filter("PB");
    const list: { title: Testament; data: Book[] }[] = [];
    if (pl.length > 0) list.push({ title: "PL", data: pl });
    if (pb.length > 0) list.push({ title: "PB", data: pb });
    return list;
  }, [query]);

  const hasResults = sections.length > 0;
  const searching = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenHeader title="Pilih kitab" backLabel="Kembali ke Baca" />
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <IconSearch size={20} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari kitab"
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Cari kitab"
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(book) => book.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          !searching && hasResults ? (
            <View style={styles.invite}>
              <Mascot pose="curious" size={64} />
              <Text style={styles.inviteTitle}>
                Mau baca apa hari ini?
                <Text style={styles.inviteSubtitle}>Pilih kitab mana pun.</Text>
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          searching ? (
            <StateMessage
              title="Kitab tidak ditemukan"
              body={`Tidak ada kitab yang cocok dengan “${query.trim()}”. Coba ejaan lain.`}
              action={<Button variant="secondary" onPress={() => setQuery("")}>Hapus pencarian</Button>}
            />
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Chip
              tone={section.title === "PL" ? "mint" : "lavender"}
              label={`${TESTAMENT_LABEL[section.title]} · ${TESTAMENT_TOTALS[section.title].books} kitab`}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <BookRow
            book={item}
            doneCount={doneInBook(completed, item.id, item.chapters.length)}
            isLast={lastRead?.bookId === item.id}
            onPress={() =>
              router.push({ pathname: "/chapters/[book]", params: { book: item.id } })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.indigo,
    paddingVertical: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  invite: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
  },
  inviteTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.indigo,
  },
  inviteSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.inkMuted,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.divider,
    marginBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: colors.divider,
  },
  rowLast: {
    backgroundColor: colors.goldTint,
    borderColor: colors.gold,
    borderBottomColor: colors.goldDeep,
  },
  rowFull: {
    backgroundColor: colors.mintTint,
    borderColor: "transparent",
  },
  rowPressed: {
    transform: [{ translateY: 2 }],
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.indigo,
  },
  rowMeta: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
    marginTop: 2,
  },
});
