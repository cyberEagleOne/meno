import { Image } from "expo-image";

const POSES = {
  calm: require("../../../assets/meno/Calm.png"),
  celebrating: require("../../../assets/meno/Celebrating.png"),
  curious: require("../../../assets/meno/Curious.png"),
  encouraging: require("../../../assets/meno/Encouraging.png"),
  happy: require("../../../assets/meno/Happy.png"),
  proud: require("../../../assets/meno/Proud.png"),
  readyToRead: require("../../../assets/meno/ReadyToRead.png"),
  welcome: require("../../../assets/meno/Welcome.png"),
} as const;

export type MascotPose = keyof typeof POSES;

interface MascotProps {
  pose: MascotPose;
  size?: number;
}

// Locked artwork: the supplied PNGs are shown as-is — size and placement only.
export function Mascot({ pose, size = 80 }: MascotProps) {
  return (
    <Image
      source={POSES[pose]}
      style={{ width: size, height: size }}
      contentFit="contain"
      transition={0}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
