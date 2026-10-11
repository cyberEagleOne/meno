import { memo } from "react";
import { StyleSheet, Text } from "react-native";

import type { Verse } from "../../domain/types";

interface VerseRowProps {
  verse: Verse;
}

function VerseRowComponent({ verse }: VerseRowProps) {
  return (
    <Text
      style={styles.verse}
      accessibilityLabel={`Verse ${verse.number}. ${verse.text}`}
    >
      <Text style={styles.number}>{verse.number} </Text>
      {verse.text}
    </Text>
  );
}

export const VerseRow = memo(VerseRowComponent);

const styles = StyleSheet.create({
  verse: {
    fontSize: 18,
    lineHeight: 29,
    color: "#1F1B24",
    marginBottom: 12,
  },
  number: {
    fontWeight: "700",
    color: "#4C1D95",
  },
});
