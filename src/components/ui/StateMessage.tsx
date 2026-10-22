import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../theme/colors";
import { IconAlert } from "./Icons";

interface StateMessageProps {
  title: string;
  body: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
}

export function StateMessage({ title, body, action, tone = "neutral" }: StateMessageProps) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole={tone === "error" ? "alert" : undefined}
    >
      {tone === "error" ? (
        <View style={styles.errorIcon}>
          <IconAlert size={32} color={colors.coralInk} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.coralTint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.indigo,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    maxWidth: 320,
  },
  action: {
    alignSelf: "stretch",
    marginTop: 8,
  },
});
