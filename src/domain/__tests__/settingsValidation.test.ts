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

  it("menolak target berupa angka desimal atau teks campuran (Issue #15)", () => {
    const malformedTargets = ["3.5", "5.0", "10abc", "2 chapters", " 1.2 "];

    for (const target of malformedTargets) {
      const result = validateReadingGoal({
        targetChapters: target,
        reflectionNote: "Komitmen membaca Alkitab harian.",
      });

      expect(result.valid).toBe(false);
      expect(result.targetError).toBe("Target wajib diisi angka antara 1 sampai 50 pasal.");
    }
  });

  it("menolak catatan refleksi yang melebihi batas maksimal 200 karakter (Issue #15)", () => {
    const longNote = "A".repeat(201);
    const result = validateReadingGoal({
      targetChapters: "3",
      reflectionNote: longNote,
    });

    expect(result.valid).toBe(false);
    expect(result.noteError).toBe("Catatan komitmen maksimal 200 karakter.");
  });

  it("menerima catatan refleksi tepat pada batas maksimum 200 karakter (Issue #15)", () => {
    const boundaryNote = "A".repeat(200);
    const result = validateReadingGoal({
      targetChapters: "3",
      reflectionNote: boundaryNote,
    });

    expect(result.valid).toBe(true);
    expect(result.parsedTarget).toBe(3);
    expect(result.noteError).toBeUndefined();
  });
});
