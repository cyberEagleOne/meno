import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text } from "react-native";

import { BadgeCard } from "../BadgeCard";
import type { Badge } from "../../../domain/badges";

const baseBadge: Badge = {
  id: "first_step",
  title: "Langkah Perdana",
  description: "Menyelesaikan pasal pertamamu di Meno.",
  icon: "🌱",
  category: "milestones",
  unlocked: false,
  progressText: "0/1 pasal",
};

describe("BadgeCard", () => {
  let renderer: ReactTestRenderer;

  afterEach(() => {
    if (renderer) act(() => renderer.unmount());
  });

  it("clearly labels a locked badge and its progress", () => {
    act(() => {
      renderer = create(<BadgeCard badge={baseBadge} />);
    });
    const card = renderer.root.findByProps({ accessibilityRole: "button" });
    const visibleText = renderer.root.findAllByType(Text).map((node) => node.props.children);

    expect(card.props.accessibilityLabel).toContain("Menyelesaikan pasal pertamamu di Meno.");
    expect(card.props.accessibilityLabel).toContain("Masih terkunci. 0/1 pasal");
    expect(visibleText).toContain("☆");
    expect(visibleText).toContain("TERKUNCI");
    expect(visibleText).toContain("0/1 pasal");
  });

  it("shows the earned star and completion state for an unlocked badge", () => {
    act(() => {
      renderer = create(
        <BadgeCard badge={{ ...baseBadge, unlocked: true, progressText: "Tercapai" }} />,
      );
    });
    const card = renderer.root.findByProps({ accessibilityRole: "button" });
    const visibleText = renderer.root.findAllByType(Text).map((node) => node.props.children);

    expect(card.props.accessibilityLabel).toContain("Sudah terbuka, bintang diperoleh.");
    expect(visibleText).toContain("★");
    expect(visibleText).toContain("TERBUKA");
    expect(visibleText).toContain("Tercapai");
  });
});
