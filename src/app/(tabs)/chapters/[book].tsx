import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChapterCell } from "../../../components/ui/ChapterCell";
import { Card } from "../../../components/ui/Card";
import { Chip } from "../../../components/ui/Chip";
import { IconCheck } from "../../../components/ui/Icons";
import { Mascot } from "../../../components/ui/Mascot";
import { ProgressRing } from "../../../components/ui/ProgressRing";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { StateMessage } from "../../../components/ui/StateMessage";
import {
  TESTAMENT_LABEL,
  getBookById,
  testamentOf,
} from "../../../data/canon";
import { placeholderBible } from "../../../data/placeholderBible";
import { useProgress } from "../../../data/progressContext";
import { doneInBook, isCompleted } from "../../../domain/progress";
import { colors, fonts } from "../../../theme/colors";

const pctNum = (a: number, b: number) => (b ? (a / b) * 100 : 0);

export default function ChaptersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ book: string }>();
  const bookId = params.book;
  const book = getBookById(placeholderBible, bookId);
  const { completed, lastRead } = useProgress();

  if (!book) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScreenHeader backLabel="Kembali ke daftar kitab" />
        <StateMessage title="Kitab tidak ditemukan" body="Kitab ini tidak ada dalam data contoh." />
      </SafeAreaView>
    );
  }

  const chapters = book.chapters.map((c) => c.number);
  const done = doneInBook(completed, book.id, book.chapters.length);
  const full = done === book.chapters.length;
  const t = testamentOf(book);
  const ink = t === "PL" ? colors.mintInk : colors.lavenderInk;
  const groups =
    chapters.length > 20
      ? Array.from({ length: Math.ceil(chapters.length / 10) }, (_, i) =>
          chapters.slice(i * 10, i * 10 + 10),
        )
      : [chapters];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenHeader backLabel="Kembali ke daftar kitab" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card tone={t === "PL" ? "mint" : "lavender"} style={styles.hero}>
          <View style={styles.heroText}>
            <Chip tone={t === "PL" ? "mint" : "lavender"} label={TESTAMENT_LABEL[t]} />
            <Text style={styles.heroName}>{book.name}</Text>
            <Text style={styles.heroMeta}>
              {book.chapters.length} pasal · {done} selesai
            </Text>
          </View>
          {full ? <Mascot pose="happy" size={64} /> : null}
          <ProgressRing
            value={done}
            max={book.chapters.length}
            size={72}
            stroke={9}
            trackColor="rgba(255,255,255,0.7)"
            barColor={ink}
            accessibilityLabel={`Pasal selesai di ${book.name}`}
          >
            <Text style={[styles.heroPct, { color: ink }]}>{Math.round(pctNum(done, book.chapters.length))}%</Text>
          </ProgressRing>
        </Card>

        <Text style={styles.sectionTitle}>Pilih pasal</Text>
        {groups.map((group) => (
          <View key={group[0]} style={styles.group}>
            {groups.length > 1 ? (
              <Text style={styles.groupLabel}>
                Pasal {group[0]}–{group[group.length - 1]}
              </Text>
            ) : null}
            <View style={styles.grid}>
              {group.map((n) => (
                <ChapterCell
                  key={n}
                  n={n}
                  done={isCompleted(completed, book.id, n)}
                  current={lastRead?.bookId === book.id && lastRead.chapter === n}
                  onPress={() =>
                    router.push({
                      pathname: "/reader/[book]/[chapter]",
                      params: { book: book.id, chapter: String(n) },
                    })
                  }
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendDone}>
              <IconCheck size={7} color={colors.gold} />
            </View>
            <Text style={styles.legendText}>Selesai</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendCurrent} />
            <Text style={styles.legendText}>Terakhir dibaca</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendUpcoming} />
            <Text style={styles.legendText}>Belum dibaca</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroText: {
    flex: 1,
  },
  heroName: {
    fontFamily: fonts.extrabold,
    fontSize: 28,
    lineHeight: 32,
    color: colors.indigo,
    marginTop: 8,
  },
  heroMeta: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 4,
  },
  heroPct: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.indigo,
    marginTop: 24,
    marginBottom: 4,
  },
  group: {
    marginTop: 12,
  },
  groupLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.inkMuted,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 28,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDone: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  legendCurrent: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.indigo,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  legendUpcoming: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  legendText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
