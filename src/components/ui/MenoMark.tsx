import { Image } from "expo-image";

const MARK = require("../../../assets/branding/meno-mark.png");

interface MenoMarkProps {
  size?: number;
}

export function MenoMark({ size = 88 }: MenoMarkProps) {
  return (
    <Image
      source={MARK}
      style={{ width: size, height: size }}
      contentFit="contain"
      transition={0}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
