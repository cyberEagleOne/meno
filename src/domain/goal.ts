/**
 * Domain model representing a user's reading goal and reflection commitment.
 */

export interface ReadingGoal {
  target: number;
  note: string;
  updatedAt: string;
}

export class GoalStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoalStorageError";
  }
}

