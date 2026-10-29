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

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lencana: ${title}. ${unlocked ? "Sudah terbuka." : "Masih terkunci: " + progressText}`}
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
        <View style={styles.titleRow}>
          <Text style={[styles.title, !unlocked && styles.textMuted]} numberOfLines={1}>
            {title}
          </Text>
          {unlocked ? <Text style={styles.unlockedStar}>✦</Text> : null}
        </View>

        <Text style={[styles.desc, !unlocked && styles.textMuted]} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              unlocked ? styles.statusPillUnlocked : styles.statusPillLocked,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                unlocked ? styles.statusTextUnlocked : styles.statusTextLocked,
              ]}
            >
              {unlocked ? "✓ " + progressText : progressText}
            </Text>
          </View>
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
    opacity: 0.82,
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
    backgroundColor: colors.divider,
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
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.indigo,
    flex: 1,
  },
  unlockedStar: {
    color: colors.gold,
    fontSize: 14,
    marginLeft: space.xs,
  },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 16,
    marginBottom: space.xs,
  },
  textMuted: {
    color: colors.stone,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusPillUnlocked: {
    backgroundColor: colors.mintTint,
  },
  statusPillLocked: {
    backgroundColor: colors.divider,
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  statusTextUnlocked: {
    color: colors.mintInk,
  },
  statusTextLocked: {
    color: colors.stone,
  },
});
