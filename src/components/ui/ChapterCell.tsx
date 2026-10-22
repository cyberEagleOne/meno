import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../theme/colors";
import { IconCheck } from "./Icons";

interface ChapterCellProps {
  n: number;
  done: boolean;
  current: boolean;
  onPress: () => void;
}

// Circular chapter node. State is shown by fill, ring, number AND a badge/marker,
// never colour alone.
export function ChapterCell({ n, done, current, onPress }: ChapterCellProps) {
  const label = `Pasal ${n}${done ? ", selesai" : ""}${current ? ", terakhir dibaca" : ""}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.cell,
          done && styles.done,
          current && !done && styles.current,
          done && current && styles.currentDoneRing,
          !done && !current && styles.upcoming,
        ]}
      >
        <Text style={[styles.number, (done || current) && styles.numberContrast]}>{n}</Text>
        {done ? (
          <View style={styles.badge}>
            <IconCheck size={11} color={colors.gold} />
          </View>
        ) : null}
        {current ? (
          <View style={[styles.marker, done ? styles.markerDone : styles.markerCurrent]} />
        ) : null}
      </View>
    </Pressable>
  );
}

const SIZE = 56;

const styles = StyleSheet.create({
  wrap: {
    width: "18%",
    marginHorizontal: "1%",
    marginBottom: 14,
    alignItems: "center",
  },
  cell: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  upcoming: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  done: {
    backgroundColor: colors.gold,
  },
  current: {
    backgroundColor: colors.indigo,
    borderWidth: 4,
    borderColor: colors.gold,
  },
  currentDoneRing: {
    borderWidth: 4,
    borderColor: colors.indigo,
  },
  number: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
    color: colors.indigo,
  },
  numberContrast: {
    color: colors.ivory,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.indigo,
    borderWidth: 2,
    borderColor: colors.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    position: "absolute",
    bottom: -2,
    width: 16,
    height: 6,
    borderRadius: 3,
  },
  markerDone: {
    backgroundColor: colors.indigo,
  },
  markerCurrent: {
    backgroundColor: colors.gold,
  },
  pressed: {
    opacity: 0.7,
  },
});
