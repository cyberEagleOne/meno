export interface GoalValidationInput {
  targetChapters: string;
  reflectionNote: string;
}

export interface GoalValidationResult {
  valid: boolean;
  targetError?: string;
  noteError?: string;
  parsedTarget?: number;
}

export function validateReadingGoal(input: GoalValidationInput): GoalValidationResult {
  let valid = true;
  let targetError: string | undefined;
  let noteError: string | undefined;

  const trimmedTarget = (input.targetChapters || "").trim();
  const isPositiveInteger = /^\d+$/.test(trimmedTarget);
  const targetNum = isPositiveInteger ? parseInt(trimmedTarget, 10) : NaN;
  if (!isPositiveInteger || isNaN(targetNum) || targetNum < 1 || targetNum > 50) {
    targetError = "Target wajib diisi angka antara 1 sampai 50 pasal.";
    valid = false;
  }

  const trimmedNote = (input.reflectionNote || "").trim();
  if (!input.reflectionNote || trimmedNote.length < 5) {
    noteError = "Catatan komitmen wajib diisi minimal 5 karakter.";
    valid = false;
  } else if (trimmedNote.length > 200) {
    noteError = "Catatan komitmen maksimal 200 karakter.";
    valid = false;
  }

  return {
    valid,
    targetError,
    noteError,
    parsedTarget: valid ? targetNum : undefined,
  };
}
