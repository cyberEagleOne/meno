import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, radius } from "../../theme/colors";

type ButtonVariant = "primary" | "gold" | "secondary" | "text";

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
  full?: boolean;
  accessibilityLabel?: string;
}

// Chunky button: a solid 4dp bottom edge; on press the button sinks onto it.
export function Button({
  children,
  onPress,
  disabled = false,
  variant = "primary",
  icon,
  full = true,
  accessibilityLabel,
}: ButtonProps) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        v,
        full && styles.full,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon}
      <Text style={[styles.label, variant === "text" && styles.textLabel, disabled && styles.disabledLabel]}>
        {children}
      </Text>
    </Pressable>
  );
}

const VARIANTS = StyleSheet.create({
  primary: {
    backgroundColor: colors.indigo,
    borderBottomColor: colors.indigoDeep,
  },
  gold: {
    backgroundColor: colors.gold,
    borderBottomColor: colors.goldDeep,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.divider,
    borderWidth: 2,
    borderColor: colors.divider,
    borderBottomWidth: 4,
  },
  text: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    minHeight: 44,
  },
});

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    borderBottomWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  full: {
    alignSelf: "stretch",
  },
  label: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.ivory,
  },
  textLabel: {
    color: colors.inkMuted,
    textDecorationLine: "underline",
  },
  disabled: {
    backgroundColor: colors.divider,
    borderBottomWidth: 0,
    borderColor: "transparent",
    borderWidth: 0,
  },
  disabledLabel: {
    color: colors.inkMuted,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 1,
  },
});
