/**
 * Domain logic for Meno's Gentle Gamification:
 * 1. Habit Tree Growth stages (Pohon Pertumbuhan Kebiasaan)
 * 2. Collectible Achievement Badges (Lencana Prestasi)
 */

export interface HabitTreeStage {
  stage: number;
  id: "seed" | "sprout" | "sapling" | "blooming" | "fruitful" | "golden_oak";
  name: string;
  description: string;
  minChapters: number;
  nextThreshold: number | null;
  leaves: number;
  badgeLevel: string;
}

export const HABIT_TREE_STAGES: HabitTreeStage[] = [
  {
    stage: 0,
    id: "seed",
    name: "Benih Harapan",
    description: "Langkah awal perjalanan rohanimu. Mulai baca 1 pasal untuk menumbuhkan tunas pertama.",
    minChapters: 0,
    nextThreshold: 1,
    leaves: 0,
    badgeLevel: "Tahap Awal",
  },
  {
    stage: 1,
    id: "sprout",
    name: "Tunas Mula",
    description: "Benih firman telah berkecambah! Terus sirami dengan ketekunan membaca setiap hari.",
    minChapters: 1,
    nextThreshold: 5,
    leaves: 2,
    badgeLevel: "Tunas",
  },
  {
    stage: 2,
    id: "sapling",
    name: "Pohon Muda",
    description: "Batang kebiasaanmu mulai kokoh. Pohonmu semakin teguh berakar dalam firman.",
    minChapters: 5,
    nextThreshold: 15,
    leaves: 6,
    badgeLevel: "Pohon Muda",
  },
  {
    stage: 3,
    id: "blooming",
    name: "Pohon Rimbun",
    description: "Daun-daun hijau yang lebat membawa ketenangan dan keteduhan bagi hatimu.",
    minChapters: 15,
    nextThreshold: 30,
    leaves: 12,
    badgeLevel: "Rimbun",
  },
  {
    stage: 4,
    id: "fruitful",
    name: "Pohon Berbuah",
    description: "Firman yang engkau baca telah menghasilkan buah ketenangan dan hikmat manis.",
    minChapters: 30,
    nextThreshold: 50,
    leaves: 20,
    badgeLevel: "Berbuah",
  },
  {
    stage: 5,
    id: "golden_oak",
    name: "Pohon Emas Kebijaksanaan",
    description: "Pohon yang mekar megah penuh kemuliaan. Kebiasaan membacamu telah menjadi gaya hidup sejati.",
    minChapters: 50,
    nextThreshold: null,
    leaves: 32,
    badgeLevel: "Legendaris",
  },
];

export function getHabitTreeStage(totalChapters: number): HabitTreeStage {
  const count = Math.max(0, totalChapters);
  for (let i = HABIT_TREE_STAGES.length - 1; i >= 0; i--) {
    if (count >= HABIT_TREE_STAGES[i].minChapters) {
      return HABIT_TREE_STAGES[i];
    }
  }
  return HABIT_TREE_STAGES[0];
}

export function getHabitTreeProgress(totalChapters: number): {
  currentStage: HabitTreeStage;
  nextStage: HabitTreeStage | null;
  percentToNext: number;
  remainingChapters: number;
} {
  const currentStage = getHabitTreeStage(totalChapters);
  const nextStage =
    currentStage.stage < HABIT_TREE_STAGES.length - 1
      ? HABIT_TREE_STAGES[currentStage.stage + 1]
      : null;

  if (!nextStage) {
    return {
      currentStage,
      nextStage: null,
      percentToNext: 100,
      remainingChapters: 0,
    };
  }

  const range = nextStage.minChapters - currentStage.minChapters;
  const progressInStage = totalChapters - currentStage.minChapters;
  const percentToNext = Math.min(100, Math.max(0, Math.round((progressInStage / range) * 100)));
  const remainingChapters = Math.max(0, nextStage.minChapters - totalChapters);

  return {
    currentStage,
    nextStage,
    percentToNext,
    remainingChapters,
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "habits" | "milestones" | "scripture";
  unlocked: boolean;
  progressText: string;
}

export function calculateBadges(
  completed: Record<string, string | boolean>,
  readingDays: string[],
): Badge[] {
  // Count total completed
  let totalCount = 0;
  let hasGenesisChapter = false;
  let hasGospelChapter = false;
  let hasPsalmChapter = false;
  let hasProverbChapter = false;

  for (const [key, isDone] of Object.entries(completed)) {
    if (isDone) {
      totalCount++;
      const [bookId] = key.split(":");
      const idLower = bookId.toLowerCase();
      if (idLower === "kejadian") hasGenesisChapter = true;
      if (["matius", "markus", "lukas", "yohanes"].includes(idLower)) hasGospelChapter = true;
      if (idLower === "mazmur") hasPsalmChapter = true;
      if (idLower === "amsal") hasProverbChapter = true;
    }
  }

  const uniqueDays = readingDays.length;

  const badges: Badge[] = [
    {
      id: "first_step",
      title: "Langkah Perdana",
      description: "Menyelesaikan pasal pertamamu di Meno.",
      icon: "🌱",
      category: "milestones",
      unlocked: totalCount >= 1,
      progressText: totalCount >= 1 ? "Tercapai" : "0/1 pasal",
    },
    {
      id: "habit_3days",
      title: "Tiga Hari Ketekunan",
      description: "Membaca Alkitab di 3 hari yang berbeda.",
      icon: "🕯️",
      category: "habits",
      unlocked: uniqueDays >= 3,
      progressText: uniqueDays >= 3 ? "Tercapai" : `${uniqueDays}/3 hari`,
    },
    {
      id: "habit_7days",
      title: "Seminggu Teduh",
      description: "Membaca Alkitab di 7 hari yang berbeda.",
      icon: "🕊️",
      category: "habits",
      unlocked: uniqueDays >= 7,
      progressText: uniqueDays >= 7 ? "Tercapai" : `${uniqueDays}/7 hari`,
    },
    {
      id: "gospel_explorer",
      title: "Sahabat Injil",
      description: "Membaca kabar sukacita dalam salah satu Kitab Injil.",
      icon: "📖",
      category: "scripture",
      unlocked: hasGospelChapter,
      progressText: hasGospelChapter ? "Tercapai" : "Baca Matius, Markus, Lukas, atau Yohanes",
    },
    {
      id: "psalm_peace",
      title: "Penikmat Mazmur",
      description: "Menenangkan jiwa dengan membaca kidung Mazmur.",
      icon: "🎵",
      category: "scripture",
      unlocked: hasPsalmChapter,
      progressText: hasPsalmChapter ? "Tercapai" : "Baca 1 pasal di Kitab Mazmur",
    },
    {
      id: "proverb_wisdom",
      title: "Pencari Hikmat",
      description: "Menemukan mutiara nasihat bijak di Kitab Amsal.",
      icon: "💎",
      category: "scripture",
      unlocked: hasProverbChapter,
      progressText: hasProverbChapter ? "Tercapai" : "Baca 1 pasal di Kitab Amsal",
    },
    {
      id: "pentateuch_starter",
      title: "Jejak Penciptaan",
      description: "Membaca kisah awal di Kitab Kejadian.",
      icon: "🌍",
      category: "scripture",
      unlocked: hasGenesisChapter,
      progressText: hasGenesisChapter ? "Tercapai" : "Baca 1 pasal di Kitab Kejadian",
    },
    {
      id: "milestone_10",
      title: "Sepuluh Langkah",
      description: "Menuntaskan 10 pasal firman Tuhan.",
      icon: "⭐",
      category: "milestones",
      unlocked: totalCount >= 10,
      progressText: totalCount >= 10 ? "Tercapai" : `${totalCount}/10 pasal`,
    },
    {
      id: "milestone_25",
      title: "Pohon Emas Meno",
      description: "Menuntaskan 25 pasal dan menumbuhkan pohon rimbun.",
      icon: "👑",
      category: "milestones",
      unlocked: totalCount >= 25,
      progressText: totalCount >= 25 ? "Tercapai" : `${totalCount}/25 pasal`,
    },
  ];

  return badges;
}
