import { memo } from "react";
import { StyleSheet, Text } from "react-native";

import type { Verse } from "../../domain/types";
import { colors, fonts } from "../../theme/colors";

interface VerseRowProps {
  verse: Verse;
  fontSize?: number;
  lineHeight?: number;
}

function VerseRowComponent({ verse, fontSize = 19, lineHeight = 35 }: VerseRowProps) {
  return (
    <Text
      style={[styles.verse, { fontSize, lineHeight }]}
      accessibilityLabel={`Ayat ${verse.number}. ${verse.text}`}
    >
      <Text style={[styles.number, { fontSize: Math.max(10, fontSize - 7) }]}>
        {verse.number}{" "}
      </Text>
      {verse.text}
    </Text>
  );
}

export const VerseRow = memo(VerseRowComponent);

const styles = StyleSheet.create({
  verse: {
    fontFamily: fonts.regular,
    fontSize: 19,
    lineHeight: 35,
    color: colors.indigo,
    marginBottom: 20,
  },
  number: {
    fontFamily: fonts.extrabold,
    fontSize: 11,
    color: colors.lavenderInk,
    marginRight: 2,
  },
});
