import React, { useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, space } from "../../theme/colors";
import { Mascot, MascotPose } from "./Mascot";

const QUOTES = [
  { text: "Halo! Senang bisa menemanimu membaca firman hari ini! ✨", pose: "happy" as MascotPose },
  { text: "Satu pasal saja sudah cukup menyiram benih rohanimu. 🌱", pose: "encouraging" as MascotPose },
  { text: "Pelan-pelan saja ya, yang penting firman-Nya meresap. 🕊️", pose: "calm" as MascotPose },
  { text: "Meno bangga kamu meluangkan waktu tenang hari ini! 🌟", pose: "proud" as MascotPose },
  { text: "Tarik napas dalam-dalam, mari kita baca bersama! 📖", pose: "readyToRead" as MascotPose },
];

export function InteractiveMascot({ defaultPose = "welcome", size = 88 }: { defaultPose?: MascotPose; size?: number }) {
  const [quoteIndex, setQuoteIndex] = useState<number | null>(null);
  const [currentPose, setCurrentPose] = useState<MascotPose>(defaultPose);

  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePress = () => {
    // Next quote
    const nextIdx = quoteIndex === null ? 0 : (quoteIndex + 1) % QUOTES.length;
    setQuoteIndex(nextIdx);
    setCurrentPose(QUOTES[nextIdx].pose);

    // Bounce spring animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.18,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Meno si Maskot. Ketuk untuk menyapa Meno."
        style={styles.pressable}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Mascot pose={currentPose} size={size} />
        </Animated.View>
        <View style={styles.tapPill}>
          <Text style={styles.tapPillText}>Ketuk Meno</Text>
        </View>
      </Pressable>

      {quoteIndex !== null ? (
        <Pressable onPress={() => setQuoteIndex(null)} style={styles.bubble}>
          <Text style={styles.bubbleText}>{QUOTES[quoteIndex].text}</Text>
          <Text style={styles.bubbleClose}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    position: "relative",
  },
  pressable: {
    alignItems: "center",
  },
  tapPill: {
    marginTop: -4,
    backgroundColor: colors.goldTint,
    paddingHorizontal: space.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  tapPillText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.goldText,
  },
  bubble: {
    position: "absolute",
    top: -48,
    right: 0,
    backgroundColor: colors.indigo,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
  bubbleText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.ivory,
    lineHeight: 15,
    flex: 1,
  },
  bubbleClose: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.stone,
    marginLeft: space.xs,
    padding: 2,
  },
});
