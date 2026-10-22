import { StyleSheet, View } from "react-native";

import { colors, radius } from "../../theme/colors";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  height?: number;
  trackColor?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  height = 14,
  trackColor = colors.divider,
}: ProgressBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const width = value > 0 ? Math.max(pct, 1.5) : 0;
  return (
    <View
      style={[styles.track, { height, backgroundColor: trackColor }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
    >
      <View style={[styles.fill, { width: `${width}%` }]}>
        <View style={styles.gloss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    justifyContent: "flex-start",
  },
  gloss: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 3,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
