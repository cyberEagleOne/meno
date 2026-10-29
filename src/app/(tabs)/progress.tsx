import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { IconBook, IconChart, IconCheck, IconChevron, IconFlag } from "../../components/ui/Icons";
import { Mascot } from "../../components/ui/Mascot";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { HabitTree } from "../../components/ui/HabitTree";
import { BadgeCard } from "../../components/ui/BadgeCard";
import { BadgeUnlockModal } from "../../components/ui/BadgeUnlockModal";
import { calculateBadges, Badge } from "../../domain/badges";
import {
  TESTAMENT_LABEL,
  TESTAMENT_TOTALS,
  TOTAL_CHAPTERS,
  booksByTestament,
  testamentOf,
  type Testament,
} from "../../data/canon";
import { placeholderBible } from "../../data/placeholderBible";
import { useProgress } from "../../data/progressContext";
import {
  MILESTONES,
  completedCount,
  doneInBook,
  nextMilestone,
} from "../../domain/progress";
import { colors, fonts, radius } from "../../theme/colors";

const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (a: number, b: number) => (b ? ((a / b) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 }) : "0");

function MilestonePath({ total }: { total: number }) {
  const next = nextMilestone(total);
  return (
    <View style={styles.milestones}>
      <Text style={styles.sectionTitle}>Penanda perjalanan</Text>
      {MILESTONES.map((m, i) => {
        const reached = total >= m.at;
        const isNext = next?.at === m.at;
        const last = i === MILESTONES.length - 1;
        return (
          <View key={m.at} style={styles.milestoneRow}>
            {!last ? (
              <View style={[styles.connector, reached ? styles.connectorDone : styles.connectorTodo]} />
            ) : null}
            <View
              style={[
                styles.milestoneDot,
                reached && styles.milestoneReached,
                isNext && styles.milestoneNext,
                !reached && !isNext && styles.milestoneTodo,
              ]}
              accessible
              accessibilityLabel={`${m.label}, ${reached ? "tercapai" : isNext ? "berikutnya" : `${m.at} pasal selesai`}`}
            >
              {reached ? (
                <IconCheck size={20} color={colors.indigo} />
              ) : (
                <IconFlag size={18} color={!reached && !isNext ? colors.stone : colors.gold} />
              )}
            </View>
            <View style={styles.milestoneText}>
              <Text style={[styles.milestoneLabel, !reached && !isNext && styles.milestoneLabelMuted]}>
                {m.label}
              </Text>
              <Text style={styles.milestoneMeta}>
                {reached
                  ? "Tercapai"
                  : isNext
                    ? `Berikutnya · tinggal ${fmt(m.at - total)} pasal lagi`
                    : `${fmt(m.at)} pasal selesai`}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const { completed, readingDays } = useProgress();
  const total = completedCount(completed);
  const days = readingDays.length;
  const next = nextMilestone(total);

  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const badges = calculateBadges(completed, readingDays);

  const byTestament = (t: Testament) => {
    const done = booksByTestament(placeholderBible, t).reduce(
      (n, b) => n + doneInBook(completed, b.id, b.chapters.length),
      0,
    );
    return { done, all: TESTAMENT_TOTALS[t].chapters };
  };
  const started = placeholderBible.books
    .map((b) => ({ b, n: doneInBook(completed, b.id, b.chapters.length) }))
    .filter((x) => x.n > 0);
  const finishedBooks = started.filter((x) => x.n === x.b.chapters.length).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenHeader title="Kemajuan" />
      <ScrollView contentContainerStyle={styles.content}>
        <HabitTree totalChapters={total} />
        {total === 0 ? (
          <>
            <Card tone="gold" style={styles.emptyCard}>
              <Mascot pose="encouraging" size={132} />
              <Text style={styles.emptyTitle}>Belum ada bacaan selesai</Text>
              <Text style={styles.emptySubtitle}>Perjalananmu dimulai dari satu pasal.</Text>
              <Text style={styles.emptyBody}>
                Membuka pasal tidak otomatis menandainya selesai. Tekan “Tandai selesai” setelah
                membaca, dan kemajuanmu muncul di sini.
              </Text>
              <View
                style={styles.emptyDays}
                accessible
                accessibilityLabel={`${days} hari membaca`}
              >
                <IconChart size={18} color={colors.goldText} />
                <Text style={styles.emptyDaysText}>{fmt(days)} hari membaca</Text>
              </View>
              <View style={styles.emptyAction}>
                <Button onPress={() => router.push("/library")}>Pilih kitab</Button>
              </View>
            </Card>
            <MilestonePath total={total} />
          </>
        ) : (
          <>
            <Card tone="indigo" style={styles.totalCard}>
              <View style={styles.circleLavender} importantForAccessibility="no-hide-descendants" />
              <ProgressRing
                value={total}
                max={TOTAL_CHAPTERS}
                size={96}
                stroke={11}
                trackColor="rgba(247,241,229,0.2)"
                barColor={colors.gold}
                accessibilityLabel="Pasal selesai dari seluruh Alkitab"
              >
                <Text style={styles.totalPct}>{pct(total, TOTAL_CHAPTERS)}%</Text>
              </ProgressRing>
              <View style={styles.totalText}>
                <Text style={styles.totalOverline}>PASAL SELESAI</Text>
                <Text style={styles.totalNumber}>{fmt(total)}</Text>
                <Text style={styles.totalMeta}>dari {fmt(TOTAL_CHAPTERS)} pasal</Text>
              </View>
            </Card>

            <View style={styles.cheer}>
              <Mascot pose={total >= 10 ? "proud" : "happy"} size={72} />
              <Text style={styles.cheerText}>
                {pct(total, TOTAL_CHAPTERS)}% dari seluruh Alkitab · {finishedBooks} kitab tuntas.{" "}
                {next ? "Terus lanjut, pelan-pelan saja." : "Luar biasa."}
              </Text>
            </View>

            <View
              style={styles.daysStat}
              accessible
              accessibilityLabel={`${days} hari membaca`}
            >
              <IconChart size={18} color={colors.goldText} />
              <Text style={styles.daysStatText}>{fmt(days)} hari membaca</Text>
            </View>

            <MilestonePath total={total} />

            <Text style={styles.sectionTitle}>Per perjanjian</Text>
            <View style={styles.testaments}>
              {(["PL", "PB"] as Testament[]).map((t) => {
                const s = byTestament(t);
                const isPl = t === "PL";
                return (
                  <Card key={t} tone={isPl ? "mint" : "lavender"} style={styles.testamentCard}>
                    <View style={styles.testamentHeader}>
                      <Text style={styles.testamentName}>{TESTAMENT_LABEL[t]}</Text>
                      <Text
                        style={[
                          styles.testamentCount,
                          { color: isPl ? colors.mintInk : colors.lavenderInk },
                        ]}
                      >
                        {s.done} / {s.all} pasal
                      </Text>
                    </View>
                    <ProgressBar
                      value={s.done}
                      max={s.all}
                      label={`Pasal selesai ${TESTAMENT_LABEL[t]}`}
                      trackColor="rgba(255,255,255,0.7)"
                    />
                  </Card>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Kitab yang sedang dibaca</Text>
            <View style={styles.startedList}>
              {started.map(({ b, n }) => {
                const full = n === b.chapters.length;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => router.push({ pathname: "/chapters/[book]", params: { book: b.id } })}
                    accessibilityRole="button"
                    accessibilityLabel={`${b.name}, ${n} dari ${b.chapters.length} pasal`}
                    style={({ pressed }) => [styles.startedRow, pressed && styles.startedPressed]}
                  >
                    <ProgressRing
                      value={n}
                      max={b.chapters.length}
                      size={44}
                      stroke={5}
                      trackColor={colors.divider}
                      barColor={full ? colors.mintInk : colors.gold}
                      decorative
                    >
                      {full ? (
                        <IconCheck size={18} color={colors.mintInk} />
                      ) : (
                        <IconBook
                          size={18}
                          color={testamentOf(b) === "PL" ? colors.mintInk : colors.lavenderInk}
                        />
                      )}
                    </ProgressRing>
                    <View style={styles.startedText}>
                      <Text style={styles.startedName} numberOfLines={1}>
                        {b.name}
                      </Text>
                      <Text style={styles.startedMeta}>
                        {n} / {b.chapters.length}
                        {full ? " · tuntas" : ""}
                      </Text>
                    </View>
                    <IconChevron size={20} color={colors.inkMuted} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.badgeSection}>
          <View style={styles.badgeHeaderRow}>
            <Text style={styles.sectionTitle}>Lencana Koleksi Prestasi</Text>
            <View style={styles.badgeCountBadge}>
              <Text style={styles.badgeCountText}>
                {badges.filter((b) => b.unlocked).length} / {badges.length} Terbuka
              </Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Pencapaian spesial yang didapatkan seiring kesetiaan membaca firman. Ketuk lencana untuk info.
          </Text>
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onPress={() => setSelectedBadge(badge)}
            />
          ))}
        </View>

        <BadgeUnlockModal
          badge={selectedBadge}
          visible={selectedBadge !== null}
          onClose={() => setSelectedBadge(null)}
        />
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
  emptyCard: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.indigo,
    marginTop: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.goldText,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    maxWidth: 300,
  },
  emptyAction: {
    alignSelf: "stretch",
    marginTop: 12,
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.indigoDeep,
  },
  circleLavender: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(169,159,224,0.25)",
  },
  totalPct: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.ivory,
  },
  totalText: {
    flex: 1,
  },
  totalOverline: {
    fontFamily: fonts.extrabold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  totalNumber: {
    fontFamily: fonts.bold,
    fontSize: 48,
    lineHeight: 54,
    color: colors.ivory,
  },
  totalMeta: {
    fontSize: 14,
    color: "rgba(247,241,229,0.8)",
    marginTop: 2,
  },
  cheer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.goldTint,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  cheerText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.goldText,
  },
  daysStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.goldTint,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  daysStatText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.goldText,
  },
  emptyDays: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  emptyDaysText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.goldText,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.indigo,
    marginTop: 24,
    marginBottom: 12,
  },
  milestones: {
    marginTop: 8,
  },
  milestoneRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
  },
  connector: {
    position: "absolute",
    left: 19,
    top: 40,
    bottom: 0,
    width: 4,
    borderRadius: 2,
  },
  connectorDone: {
    backgroundColor: colors.gold,
  },
  connectorTodo: {
    backgroundColor: colors.divider,
  },
  milestoneDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  milestoneReached: {
    backgroundColor: colors.gold,
    borderBottomWidth: 3,
    borderBottomColor: colors.goldDeep,
  },
  milestoneNext: {
    backgroundColor: colors.indigo,
    borderWidth: 3,
    borderColor: colors.gold,
  },
  milestoneTodo: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.stone,
  },
  milestoneText: {
    flex: 1,
    paddingTop: 4,
  },
  milestoneLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.indigo,
  },
  milestoneLabelMuted: {
    color: colors.inkMuted,
  },
  milestoneMeta: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  testaments: {
    gap: 12,
  },
  testamentCard: {
    padding: 16,
  },
  testamentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  testamentName: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.indigo,
  },
  testamentCount: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  startedList: {
    gap: 10,
  },
  startedRow: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.divider,
    borderBottomWidth: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  startedPressed: {
    transform: [{ translateY: 2 }],
  },
  startedText: {
    flex: 1,
  },
  startedName: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.indigo,
  },
  startedMeta: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  badgeSection: {
    marginTop: 28,
    marginBottom: 16,
  },
  badgeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeCountBadge: {
    backgroundColor: colors.goldTint,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  badgeCountText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.goldText,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 14,
    marginTop: 2,
  },
});
