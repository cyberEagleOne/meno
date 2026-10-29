import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import { Badge } from "../../domain/badges";
import { colors, fonts, radius, space } from "../../theme/colors";
import { Button } from "./Button";
import { Mascot } from "./Mascot";

interface BadgeUnlockModalProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

export function BadgeUnlockModal({ badge, visible, onClose }: BadgeUnlockModalProps) {
  if (!badge) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Confetti Sparkles Header */}
          <View style={styles.mascotArea}>
            <Mascot pose={badge.unlocked ? "celebrating" : "curious"} size={88} />
          </View>

          <Text style={styles.badgeIcon}>{badge.icon}</Text>
          <Text style={styles.headerTitle}>
            {badge.unlocked ? "Lencana Terbuka! ✦" : "Detail Lencana"}
          </Text>

          <Text style={styles.badgeTitle}>{badge.title}</Text>
          <Text style={styles.badgeDesc}>{badge.description}</Text>

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Status Pencapaian:</Text>
            <Text
              style={[
                styles.statusValue,
                badge.unlocked ? styles.statusUnlocked : styles.statusLocked,
              ]}
            >
              {badge.unlocked ? "✓ Berhasil Didapatkan" : badge.progressText}
            </Text>
          </View>

          <Button variant="gold" onPress={onClose}>
            {badge.unlocked ? "Terima Kasih, Meno!" : "Tutup"}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(20, 22, 58, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: space.xl,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  mascotArea: {
    marginBottom: space.sm,
  },
  badgeIcon: {
    fontSize: 48,
    marginVertical: space.xs,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.goldText,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: space.xs,
  },
  badgeTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: colors.indigo,
    textAlign: "center",
    marginBottom: space.sm,
  },
  badgeDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: space.lg,
  },
  statusBox: {
    width: "100%",
    backgroundColor: colors.ivory,
    padding: space.md,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: space.lg,
  },
  statusLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.stone,
    marginBottom: 2,
  },
  statusValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  statusUnlocked: {
    color: colors.mintInk,
  },
  statusLocked: {
    color: colors.inkMuted,
  },
});
