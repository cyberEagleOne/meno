import { memo } from "react";
import { StyleSheet, Text } from "react-native";

import type { Verse } from "../../domain/types";
import { colors, fonts } from "../../theme/colors";

interface VerseRowProps {
  verse: Verse;
}

function VerseRowComponent({ verse }: VerseRowProps) {
  return (
    <Text style={styles.verse} accessibilityLabel={`Ayat ${verse.number}. ${verse.text}`}>
      <Text style={styles.number}>{verse.number} </Text>
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
