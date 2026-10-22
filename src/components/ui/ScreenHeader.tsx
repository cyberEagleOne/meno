import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../theme/colors";
import { IconBack } from "./Icons";

interface ScreenHeaderProps {
  title?: string;
  backLabel?: string;
}

export function ScreenHeader({ title, backLabel = "Kembali" }: ScreenHeaderProps) {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  return (
    <View style={styles.row}>
      {canGoBack ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <IconBack />
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.flex} />
      )}
      <View style={styles.backSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingHorizontal: 8,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: "rgba(39,42,85,0.08)",
  },
  backSpacer: {
    width: 48,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.indigo,
  },
  flex: {
    flex: 1,
  },
});
