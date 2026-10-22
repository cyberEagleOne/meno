import { StyleSheet, Text, View } from "react-native";

import { PLACEHOLDER_NOTICE } from "../../data/placeholderBible";
import { colors, fonts, radius } from "../../theme/colors";

export function PlaceholderBanner() {
  return (
    <View
      style={styles.banner}
      accessible
      accessibilityLabel={PLACEHOLDER_NOTICE}
    >
      <Text style={styles.text}>{PLACEHOLDER_NOTICE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gold,
    backgroundColor: "rgba(239,229,203,0.7)",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  text: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.goldText,
    textAlign: "center",
  },
});
