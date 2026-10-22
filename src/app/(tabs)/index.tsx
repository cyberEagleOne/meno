import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { IconBook, IconChevron, IconPlay, IconSpark } from "../../components/ui/Icons";
import { Mascot } from "../../components/ui/Mascot";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { getBookById, TOTAL_CHAPTERS } from "../../data/canon";
import { placeholderBible } from "../../data/placeholderBible";
import { useProgress } from "../../data/progressContext";
import { completedCount, nextMilestone } from "../../domain/progress";
import { colors, fonts, radius } from "../../theme/colors";

const fmt = (n: number) => n.toLocaleString("id-ID");

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

function relDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  return `${days} hari lalu`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { lastRead, completed } = useProgress();
  const doneCount = completedCount(completed);
  const book = lastRead ? getBookById(placeholderBible, lastRead.bookId) : null;
  const next = nextMilestone(doneCount);
  const pct = TOTAL_CHAPTERS > 0 ? ((doneCount / TOTAL_CHAPTERS) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 }) : "0";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting()}!</Text>
            <Text style={styles.title}>{lastRead ? "Senang bertemu lagi." : "Yuk, mulai membaca."}</Text>
            <Text style={styles.subtitle}>
              {lastRead
                ? "Lanjutkan pelan-pelan, di mana pun kamu berhenti."
                : "Satu pasal saja sudah cukup untuk hari ini."}
            </Text>
          </View>
          <Mascot pose="welcome" size={92} />
        </View>

        {lastRead && book ? (
          <Card tone="indigo" style={styles.chunkyIndigo}>
            <View style={styles.circleLavender} importantForAccessibility="no-hide-descendants" />
            <View style={styles.circleGold} importantForAccessibility="no-hide-descendants" />
            <View style={styles.cardTop}>
              <View style={styles.cardText}>
                <Chip label="Lanjutkan membaca" tone="gold" icon={<IconPlay size={12} color={colors.goldText} />} />
                <Text style={styles.heroName}>{book.name}</Text>
                <Text style={styles.heroChapter}>Pasal {lastRead.chapter}</Text>
                <Text style={styles.heroMeta}>Terakhir dibuka {relDate(lastRead.openedAt)}</Text>
              </View>
              <Mascot pose="readyToRead" size={96} />
            </View>
            <Button
              variant="gold"
              onPress={() =>
                router.push({
                  pathname: "/reader/[book]/[chapter]",
                  params: { book: lastRead.bookId, chapter: String(lastRead.chapter) },
                })
              }
              accessibilityLabel={`Lanjutkan membaca ${book.name} ${lastRead.chapter}`}
            >
              Lanjutkan membaca
            </Button>
          </Card>
        ) : (
          <Card tone="indigo" style={styles.chunkyIndigo}>
            <View style={styles.circleLavender} importantForAccessibility="no-hide-descendants" />
            <View style={styles.circleGold} importantForAccessibility="no-hide-descendants" />
            <View style={styles.cardTop}>
              <View style={styles.cardText}>
                <Chip label="Mulai membaca" tone="gold" icon={<IconSpark size={12} color={colors.goldText} />} />
                <Text style={styles.heroEmptyTitle}>Belum ada bacaan terakhir.</Text>
                <Text style={styles.heroEmptyBody}>
                  Pilih kitab mana pun. Tempat terakhirmu tersimpan otomatis.
                </Text>
              </View>
              <Mascot pose="readyToRead" size={96} />
            </View>
            <Button
              variant="gold"
              onPress={() => router.push("/library")}
              accessibilityLabel="Mulai membaca, pilih kitab"
            >
              Mulai membaca
            </Button>
          </Card>
        )}

        <Pressable
          onPress={() => router.navigate("/progress")}
          accessibilityRole="button"
          accessibilityLabel="Lihat kemajuan"
          style={({ pressed }) => [styles.journey, pressed && styles.journeyPressed]}
        >
          <ProgressRing
            value={doneCount}
            max={TOTAL_CHAPTERS}
            size={84}
            stroke={10}
            trackColor="rgba(255,255,255,0.7)"
            barColor={colors.mintInk}
            decorative
          >
            <Text style={styles.journeyPct}>{pct}%</Text>
          </ProgressRing>
          <View style={styles.journeyText}>
            <Text style={styles.journeyTitle}>Perjalananmu</Text>
            <Text style={styles.journeyCount}>
              {fmt(doneCount)} dari {fmt(TOTAL_CHAPTERS)} pasal selesai
            </Text>
            <Text style={styles.journeyHint}>
              {doneCount === 0
                ? "Tandai pasal pertama yang kamu selesaikan."
                : next
                  ? `Tinggal ${fmt(next.at - doneCount)} pasal menuju “${next.label}”.`
                  : "Seluruh Alkitab sudah kamu selesaikan."}
            </Text>
          </View>
          <IconChevron size={22} color={colors.mintInk} />
        </Pressable>

        <Pressable
          onPress={() => router.push("/library")}
          accessibilityRole="button"
          accessibilityLabel="Pilih kitab"
          style={({ pressed }) => [styles.library, pressed && styles.libraryPressed]}
        >
          <View style={styles.libraryIcon}>
            <IconBook size={28} color={colors.lavenderInk} />
          </View>
          <View style={styles.libraryText}>
            <Text style={styles.libraryTitle}>Pilih kitab</Text>
            <Text style={styles.libraryMeta}>
              {placeholderBible.books.length} kitab · {fmt(TOTAL_CHAPTERS)} pasal
            </Text>
          </View>
          <IconChevron size={22} color={colors.lavenderInk} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.goldText,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 30,
    lineHeight: 34,
    color: colors.indigo,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    marginTop: 6,
  },
  chunkyIndigo: {
    borderBottomWidth: 4,
    borderBottomColor: colors.indigoDeep,
  },
  circleLavender: {
    position: "absolute",
    top: -40,
    right: -32,
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: "rgba(169,159,224,0.25)",
  },
  circleGold: {
    position: "absolute",
    bottom: -48,
    right: 40,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(182,154,87,0.2)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 20,
  },
  cardText: {
    flex: 1,
  },
  heroName: {
    fontFamily: fonts.extrabold,
    fontSize: 28,
    lineHeight: 32,
    color: colors.ivory,
    marginTop: 12,
  },
  heroChapter: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.gold,
    marginTop: 2,
  },
  heroMeta: {
    fontSize: 14,
    color: "rgba(247,241,229,0.8)",
    marginTop: 4,
  },
  heroEmptyTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ivory,
    marginTop: 12,
  },
  heroEmptyBody: {
    fontSize: 15,
    lineHeight: 24,
    color: "rgba(247,241,229,0.8)",
    marginTop: 8,
  },
  journey: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.mintTint,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 20,
    borderBottomWidth: 4,
    borderBottomColor: colors.mint,
  },
  journeyPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  journeyPct: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.mintInk,
  },
  journeyText: {
    flex: 1,
  },
  journeyTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.indigo,
  },
  journeyCount: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.mintInk,
    marginTop: 2,
  },
  journeyHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
    marginTop: 4,
  },
  library: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.lavenderTint,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.lavender,
  },
  libraryPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  libraryIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  libraryText: {
    flex: 1,
  },
  libraryTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.indigo,
  },
  libraryMeta: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.lavenderInk,
    marginTop: 2,
  },
});
