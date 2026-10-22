import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  trackColor: string;
  barColor: string;
  decorative?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode;
}

// Circular progress. A ring start is rotated -90° so progress begins at 12 o'clock.
export function ProgressRing({
  value,
  max,
  size = 88,
  stroke = 10,
  trackColor,
  barColor,
  decorative = false,
  accessibilityLabel,
  children,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = max > 0 ? Math.min(value / max, 1) : 0;
  const shown = value > 0 ? Math.max(frac, 0.02) : 0;
  return (
    <View
      style={{ width: size, height: size }}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : "progressbar"}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      accessibilityValue={decorative ? undefined : { min: 0, max, now: value }}
    >
      <Svg width={size} height={size} aria-hidden>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={trackColor}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={barColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c}`}
            strokeDashoffset={c * (1 - shown)}
          />
        </G>
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
