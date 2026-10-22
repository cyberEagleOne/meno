import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius } from "../../theme/colors";

export type ChipTone = "gold" | "mint" | "lavender" | "coral" | "indigo";

interface ChipProps {
  label: string;
  icon?: ReactNode;
  tone?: ChipTone;
}

export function Chip({ label, icon, tone = "gold" }: ChipProps) {
  return (
    <View style={[styles.base, TONES[tone]]}>
      <View style={styles.row}>
        {icon}
        <Text style={[styles.label, TEXT_TONES[tone]]}>{label}</Text>
      </View>
    </View>
  );
}

const TONES = StyleSheet.create({
  gold: { backgroundColor: colors.goldTint },
  mint: { backgroundColor: colors.mintTint },
  lavender: { backgroundColor: colors.lavenderTint },
  coral: { backgroundColor: colors.coralTint },
  indigo: { backgroundColor: colors.indigo },
});

const TEXT_TONES = StyleSheet.create({
  gold: { color: colors.goldText },
  mint: { color: colors.mintInk },
  lavender: { color: colors.lavenderInk },
  coral: { color: colors.coralInk },
  indigo: { color: colors.ivory },
});

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontFamily: fonts.extrabold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
