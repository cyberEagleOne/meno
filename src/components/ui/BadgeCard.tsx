import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "../../domain/badges";
import { colors, fonts, radius, space } from "../../theme/colors";

interface BadgeCardProps {
  badge: Badge;
  onPress?: () => void;
}

export function BadgeCard({ badge, onPress }: BadgeCardProps) {
  const { title, description, icon, unlocked, progressText } = badge;
  const categoryLabel = {
    habits: "KEBIASAAN",
    milestones: "PENCAPAIAN",
    scripture: "JELAJAH KITAB",
  }[badge.category];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lencana ${title}. ${description} ${unlocked ? "Sudah terbuka, bintang diperoleh." : `Masih terkunci. ${progressText}`}`}
      accessibilityHint="Ketuk untuk melihat rincian lencana"
      style={({ pressed }) => [
        styles.card,
        unlocked ? styles.cardUnlocked : styles.cardLocked,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.iconCircle, unlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked]}>
        <Text style={[styles.iconText, !unlocked && styles.iconMuted]}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{categoryLabel}</Text>
          <View style={[styles.statePill, unlocked ? styles.statePillUnlocked : styles.statePillLocked]}>
            <Text style={[styles.stateStar, unlocked ? styles.stateStarUnlocked : styles.stateStarLocked]}>
              {unlocked ? "★" : "☆"}
            </Text>
            <Text style={[styles.stateText, unlocked ? styles.stateTextUnlocked : styles.stateTextLocked]}>
              {unlocked ? "TERBUKA" : "TERKUNCI"}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.desc} numberOfLines={3}>
          {description}
        </Text>

        <View style={styles.statusRow}>
          <Text style={[styles.progressText, unlocked && styles.progressTextUnlocked]}>
            {progressText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: space.sm,
    shadowColor: colors.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardUnlocked: {
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  cardLocked: {
    borderColor: colors.divider,
    backgroundColor: colors.ivory,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: space.md,
  },
  iconCircleUnlocked: {
    backgroundColor: colors.goldTint,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  iconCircleLocked: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  iconText: {
    fontSize: 24,
  },
  iconMuted: {
    opacity: 0.45,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.xs,
    marginBottom: space.xs,
  },
  category: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.inkMuted,
    flexShrink: 1,
  },
  statePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statePillUnlocked: {
    backgroundColor: colors.goldTint,
    borderColor: colors.gold,
  },
  statePillLocked: {
    backgroundColor: colors.surface,
    borderColor: colors.divider,
  },
  stateStar: {
    fontSize: 13,
    lineHeight: 15,
  },
  stateStarUnlocked: {
    color: colors.goldText,
  },
  stateStarLocked: {
    color: colors.inkMuted,
  },
  stateText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  stateTextUnlocked: {
    color: colors.goldText,
  },
  stateTextLocked: {
    color: colors.inkMuted,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.indigo,
    marginBottom: 2,
  },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 17,
    marginBottom: space.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkMuted,
  },
  progressTextUnlocked: {
    color: colors.mintInk,
  },
});
