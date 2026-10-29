import React, { useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

import { getHabitTreeProgress, HabitTreeStage } from "../../domain/badges";
import { colors, fonts, radius, space } from "../../theme/colors";

interface HabitTreeProps {
  totalChapters: number;
}

export function HabitTree({ totalChapters }: HabitTreeProps) {
  const { currentStage, nextStage, percentToNext, remainingChapters } =
    getHabitTreeProgress(totalChapters);

  const [tapped, setTapped] = useState(false);
  const [swayAnim] = useState(() => new Animated.Value(0));

  const handlePress = () => {
    setTapped(true);
    Animated.sequence([
      Animated.timing(swayAnim, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swayAnim, {
        toValue: -1,
        duration: 140,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swayAnim, {
        toValue: 0,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => setTapped(false), 2400);
    });
  };

  const swayInterpolate = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-5deg", "0deg", "5deg"],
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{currentStage.badgeLevel}</Text>
        </View>
        <Text style={styles.chaptersCount}>
          <Text style={styles.countBold}>{totalChapters}</Text> pasal selesai
        </Text>
      </View>

      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Pohon Kebiasaan: ${currentStage.name}. Ketuk untuk berinteraksi.`}
        style={styles.treeContainer}
      >
        <Animated.View style={{ transform: [{ rotate: swayInterpolate }] }}>
          <TreeIllustration stageId={currentStage.id} />
        </Animated.View>

        {tapped ? (
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {currentStage.stage === 0
                ? "🌱 'Beri aku air dengan membaca 1 pasal!'"
                : currentStage.stage >= 4
                  ? "🌳 'Pohon firmanmu berbuah lebat! Luar biasa!'"
                  : "🌿 'Terima kasih telah menyiramiku dengan firman hari ini!'"}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.infoBlock}>
        <Text style={styles.stageTitle}>{currentStage.name}</Text>
        <Text style={styles.stageDesc}>{currentStage.description}</Text>
      </View>

      {nextStage ? (
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Menuju {nextStage.name}</Text>
            <Text style={styles.progressPercent}>{percentToNext}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${percentToNext}%` }]} />
          </View>
          <Text style={styles.remainingText}>
            Tinggal <Text style={styles.countBold}>{remainingChapters}</Text> pasal lagi untuk bertumbuh!
          </Text>
        </View>
      ) : (
        <View style={styles.maxStageNotice}>
          <Text style={styles.maxStageText}>🌟 Tingkat Tertinggi Tercapai! Terus rawat kebiasaan muliamu.</Text>
        </View>
      )}
    </View>
  );
}

function TreeIllustration({ stageId }: { stageId: HabitTreeStage["id"] }) {
  if (stageId === "seed") {
    return (
      <Svg width={140} height={120} viewBox="0 0 140 120">
        {/* Soil mound */}
        <Ellipse cx={70} cy={100} rx={50} ry={14} fill="#8E7638" opacity={0.3} />
        <Ellipse cx={70} cy={96} rx={42} ry={10} fill="#B69A57" opacity={0.6} />
        {/* Seed */}
        <Ellipse cx={70} cy={90} rx={8} ry={11} fill="#7A6228" />
        <Circle cx={68} cy={86} r={2} fill="#EFE5CB" />
        {/* Tiny water drop sparkle */}
        <Path d="M70 65 Q66 74 70 78 Q74 74 70 65" fill="#6CC4A0" />
      </Svg>
    );
  }

  if (stageId === "sprout") {
    return (
      <Svg width={140} height={120} viewBox="0 0 140 120">
        {/* Soil */}
        <Ellipse cx={70} cy={105} rx={45} ry={10} fill="#8E7638" opacity={0.4} />
        {/* Stem */}
        <Path d="M70 102 Q69 82 70 70" stroke="#17694A" strokeWidth={4} strokeLinecap="round" fill="none" />
        {/* Left Leaf */}
        <Path d="M70 78 Q50 65 52 82 Q65 85 70 80" fill="#6CC4A0" />
        {/* Right Leaf */}
        <Path d="M70 72 Q90 60 88 77 Q75 80 70 74" fill="#8CE0BD" />
      </Svg>
    );
  }

  if (stageId === "sapling") {
    return (
      <Svg width={150} height={130} viewBox="0 0 150 130">
        {/* Ground shadow */}
        <Ellipse cx={75} cy={118} rx={52} ry={10} fill="#8E7638" opacity={0.35} />
        {/* Trunk */}
        <Path d="M72 118 L73 70 Q74 58 65 50 M74 65 Q75 56 85 48" stroke="#8E7638" strokeWidth={5} strokeLinecap="round" fill="none" />
        {/* Foliage Clusters */}
        <Circle cx={58} cy={45} r={18} fill="#6CC4A0" />
        <Circle cx={90} cy={42} r={18} fill="#6CC4A0" />
        <Circle cx={75} cy={34} r={22} fill="#8CE0BD" />
        {/* Highlights */}
        <Circle cx={72} cy={30} r={4} fill="#DDF1E4" opacity={0.8} />
      </Svg>
    );
  }

  if (stageId === "blooming") {
    return (
      <Svg width={160} height={140} viewBox="0 0 160 140">
        {/* Ground */}
        <Ellipse cx={80} cy={125} rx={58} ry={11} fill="#8E7638" opacity={0.35} />
        {/* Trunk */}
        <Path d="M76 125 L78 72 Q78 55 60 45 M81 68 Q82 54 98 42" stroke="#7A6228" strokeWidth={7} strokeLinecap="round" fill="none" />
        {/* Big Canopy */}
        <Circle cx={55} cy={55} r={26} fill="#4DB58B" />
        <Circle cx={105} cy={53} r={26} fill="#4DB58B" />
        <Circle cx={80} cy={38} r={32} fill="#6CC4A0" />
        <Circle cx={80} cy={60} r={28} fill="#8CE0BD" />
        {/* Small Flowers */}
        <Circle cx={62} cy={48} r={5} fill="#FFE3D8" />
        <Circle cx={96} cy={45} r={5} fill="#FFE3D8" />
        <Circle cx={80} cy={30} r={5} fill="#FFE3D8" />
      </Svg>
    );
  }

  if (stageId === "fruitful") {
    return (
      <Svg width={170} height={145} viewBox="0 0 170 145">
        <Ellipse cx={85} cy={132} rx={64} ry={12} fill="#8E7638" opacity={0.35} />
        {/* Strong Trunk */}
        <Path d="M81 132 L83 75 Q84 55 60 45 M86 70 Q87 52 108 40" stroke="#7A6228" strokeWidth={8} strokeLinecap="round" fill="none" />
        {/* Canopy */}
        <Circle cx={55} cy={58} r={30} fill="#3CA57B" />
        <Circle cx={115} cy={55} r={30} fill="#3CA57B" />
        <Circle cx={85} cy={38} r={36} fill="#5AB890" />
        <Circle cx={85} cy={66} r={32} fill="#77CBA7" />
        {/* Golden Fruits */}
        <Circle cx={52} cy={62} r={6} fill="#F28B6B" />
        <Circle cx={116} cy={58} r={6} fill="#F28B6B" />
        <Circle cx={74} cy={42} r={7} fill="#F28B6B" />
        <Circle cx={98} cy={40} r={7} fill="#F28B6B" />
        <Circle cx={85} cy={74} r={6} fill="#F28B6B" />
      </Svg>
    );
  }

  // Golden Oak
  return (
    <Svg width={180} height={155} viewBox="0 0 180 155">
      <Ellipse cx={90} cy={140} rx={72} ry={13} fill="#8E7638" opacity={0.35} />
      {/* Majestic Trunk */}
      <Path d="M85 140 L88 78 Q89 54 58 42 M92 74 Q94 50 122 38" stroke="#5B4518" strokeWidth={10} strokeLinecap="round" fill="none" />
      {/* Grand Golden Canopy */}
      <Circle cx={50} cy={60} r={34} fill="#B69A57" />
      <Circle cx={130} cy={58} r={34} fill="#B69A57" />
      <Circle cx={90} cy={38} r={42} fill="#D4BB7C" />
      <Circle cx={90} cy={68} r={38} fill="#E5D29E" />
      {/* Stars & Sparkles */}
      <Circle cx={65} cy={40} r={5} fill="#FFFBF2" />
      <Circle cx={115} cy={36} r={5} fill="#FFFBF2" />
      <Circle cx={90} cy={22} r={6} fill="#FFFBF2" />
      <Circle cx={88} cy={82} r={5} fill="#B69A57" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xl,
    borderWidth: 1.5,
    borderColor: colors.divider,
    marginVertical: space.md,
    shadowColor: colors.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
  },
  badgePill: {
    backgroundColor: colors.mintTint,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  badgePillText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.mintInk,
  },
  chaptersCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkMuted,
  },
  countBold: {
    fontFamily: fonts.bold,
    color: colors.indigo,
  },
  treeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: space.md,
    minHeight: 130,
  },
  speechBubble: {
    position: "absolute",
    bottom: -8,
    backgroundColor: colors.indigo,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  speechText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.ivory,
    textAlign: "center",
  },
  infoBlock: {
    alignItems: "center",
    marginBottom: space.lg,
  },
  stageTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.indigo,
    marginBottom: space.xs,
  },
  stageDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: space.sm,
  },
  progressSection: {
    backgroundColor: colors.ivory,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.xs,
  },
  progressLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.indigo,
  },
  progressPercent: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.mintInk,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: "hidden",
    marginVertical: space.xs,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.mint,
    borderRadius: radius.full,
  },
  remainingText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "right",
    marginTop: space.xs,
  },
  maxStageNotice: {
    backgroundColor: colors.goldTint,
    padding: space.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  maxStageText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.goldDeep,
    textAlign: "center",
  },
});
