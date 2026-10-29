import {
  calculateBadges,
  getHabitTreeProgress,
  getHabitTreeStage,
} from "../badges";

describe("Habit Tree stages", () => {
  it("starts at seed stage for 0 chapters", () => {
    const stage = getHabitTreeStage(0);
    expect(stage.id).toBe("seed");
    expect(stage.leaves).toBe(0);
  });

  it("grows to sprout at 1 chapter", () => {
    const stage = getHabitTreeStage(1);
    expect(stage.id).toBe("sprout");
    expect(stage.leaves).toBe(2);
  });

  it("grows to sapling at 5 chapters", () => {
    const stage = getHabitTreeStage(5);
    expect(stage.id).toBe("sapling");
  });

  it("grows to blooming at 15 chapters", () => {
    const stage = getHabitTreeStage(15);
    expect(stage.id).toBe("blooming");
  });

  it("grows to fruitful at 30 chapters", () => {
    const stage = getHabitTreeStage(30);
    expect(stage.id).toBe("fruitful");
  });

  it("grows to golden oak at 50+ chapters", () => {
    const stage = getHabitTreeStage(50);
    expect(stage.id).toBe("golden_oak");
    expect(getHabitTreeStage(100).id).toBe("golden_oak");
  });

  it("calculates progress percentage towards next stage correctly", () => {
    // 0 chapters: 0/1 to sprout
    const p0 = getHabitTreeProgress(0);
    expect(p0.currentStage.id).toBe("seed");
    expect(p0.nextStage?.id).toBe("sprout");
    expect(p0.percentToNext).toBe(0);
    expect(p0.remainingChapters).toBe(1);

    // 3 chapters: 2 into 1-5 range (range = 4) -> 50%
    const p3 = getHabitTreeProgress(3);
    expect(p3.currentStage.id).toBe("sprout");
    expect(p3.nextStage?.id).toBe("sapling");
    expect(p3.percentToNext).toBe(50);
    expect(p3.remainingChapters).toBe(2);

    // 55 chapters: golden oak (max stage)
    const p55 = getHabitTreeProgress(55);
    expect(p55.currentStage.id).toBe("golden_oak");
    expect(p55.nextStage).toBeNull();
    expect(p55.percentToNext).toBe(100);
  });
});

describe("Badge calculation", () => {
  it("all locked with empty progress", () => {
    const badges = calculateBadges({}, []);
    const unlocked = badges.filter((b) => b.unlocked);
    expect(unlocked.length).toBe(0);
  });

  it("unlocks first step when 1 chapter completed", () => {
    const badges = calculateBadges({ "kejadian:1": true }, ["2026-10-30"]);
    const firstStep = badges.find((b) => b.id === "first_step");
    expect(firstStep?.unlocked).toBe(true);

    const pentateuch = badges.find((b) => b.id === "pentateuch_starter");
    expect(pentateuch?.unlocked).toBe(true);
  });

  it("unlocks scripture badges when corresponding books are read", () => {
    const badges = calculateBadges(
      {
        "yohanes:1": true,
        "mazmur:23": true,
        "amsal:3": true,
      },
      ["2026-10-30"],
    );

    expect(badges.find((b) => b.id === "gospel_explorer")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "psalm_peace")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "proverb_wisdom")?.unlocked).toBe(true);
  });

  it("unlocks 3-day and 7-day habit badges based on unique reading days", () => {
    const days3 = ["2026-10-28", "2026-10-29", "2026-10-30"];
    const badges3 = calculateBadges({ "kejadian:1": true }, days3);
    expect(badges3.find((b) => b.id === "habit_3days")?.unlocked).toBe(true);
    expect(badges3.find((b) => b.id === "habit_7days")?.unlocked).toBe(false);

    const days7 = [
      "2026-10-24",
      "2026-10-25",
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
    ];
    const badges7 = calculateBadges({ "kejadian:1": true }, days7);
    expect(badges7.find((b) => b.id === "habit_7days")?.unlocked).toBe(true);
  });

  it("unlocks milestone 10 and 25 badges", () => {
    const map: Record<string, boolean> = {};
    for (let i = 1; i <= 25; i++) {
      map[`kejadian:${i}`] = true;
    }
    const badges = calculateBadges(map, ["2026-10-30"]);
    expect(badges.find((b) => b.id === "milestone_10")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "milestone_25")?.unlocked).toBe(true);
  });
});
