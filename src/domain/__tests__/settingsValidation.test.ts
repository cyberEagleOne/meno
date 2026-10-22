import { validateReadingGoal } from "../settingsValidation";

describe("P4: Form Input Validation & Reading Goal Rules", () => {
  it("menerima input yang valid dengan target 1-50 dan catatan >= 5 karakter", () => {
    const result = validateReadingGoal({
      targetChapters: "3",
      reflectionNote: "Membaca 3 pasal setiap pagi.",
    });

    expect(result.valid).toBe(true);
    expect(result.parsedTarget).toBe(3);
    expect(result.targetError).toBeUndefined();
    expect(result.noteError).toBeUndefined();
  });

  it("menolak target kosong, nol, atau bukan angka", () => {
    const invalidInputs = ["", "0", "-1", "abc", "NaN"];

    for (const val of invalidInputs) {
      const result = validateReadingGoal({
        targetChapters: val,
        reflectionNote: "Membaca rutin setiap hari.",
      });

      expect(result.valid).toBe(false);
      expect(result.targetError).toBe("Target wajib diisi angka antara 1 sampai 50 pasal.");
    }
  });

  it("menolak target yang melebihi batas wajar harian (> 50 pasal)", () => {
    const result = validateReadingGoal({
      targetChapters: "99",
      reflectionNote: "Target maraton membaca.",
    });

    expect(result.valid).toBe(false);
    expect(result.targetError).toBe("Target wajib diisi angka antara 1 sampai 50 pasal.");
  });

  it("menolak catatan refleksi yang kosong atau kurang dari 5 karakter", () => {
    const invalidNotes = ["", "   ", "ok", "baca"];

    for (const note of invalidNotes) {
      const result = validateReadingGoal({
        targetChapters: "2",
        reflectionNote: note,
      });

      expect(result.valid).toBe(false);
      expect(result.noteError).toBe("Catatan komitmen wajib diisi minimal 5 karakter.");
    }
  });
});
