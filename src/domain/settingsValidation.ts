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

  const targetNum = parseInt(input.targetChapters, 10);
  if (isNaN(targetNum) || targetNum < 1 || targetNum > 50) {
    targetError = "Target wajib diisi angka antara 1 sampai 50 pasal.";
    valid = false;
  }

  if (!input.reflectionNote || input.reflectionNote.trim().length < 5) {
    noteError = "Catatan komitmen wajib diisi minimal 5 karakter.";
    valid = false;
  }

  return {
    valid,
    targetError,
    noteError,
    parsedTarget: valid ? targetNum : undefined,
  };
}
