import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors, radius } from "../../theme/colors";

export type CardTone = "surface" | "indigo" | "outline" | "mint" | "lavender" | "coral" | "gold";

interface CardProps {
  children: ReactNode;
  tone?: CardTone;
  style?: ViewStyle;
}

export function Card({ children, tone = "surface", style }: CardProps) {
  return <View style={[styles.base, TONES[tone], style]}>{children}</View>;
}

const TONES = StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  indigo: {
    backgroundColor: colors.indigo,
  },
  outline: {
    backgroundColor: colors.goldTint,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gold,
  },
  mint: {
    backgroundColor: colors.mintTint,
  },
  lavender: {
    backgroundColor: colors.lavenderTint,
  },
  coral: {
    backgroundColor: colors.coralTint,
  },
  gold: {
    backgroundColor: colors.goldTint,
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
});
