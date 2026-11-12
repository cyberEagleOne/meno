import { ReadingGoal, GoalStorageError } from "../domain/goal";
import { getSqlDriver } from "./sqlDriver";
import { logger } from "../services/logger";

interface ReadingGoalRow {
  id: number;
  target: number;
  note: string;
  updated_at: string;
}

/**
 * Repository handling reading goal data persistence and retrieval.
 * Follows clean separation of responsibilities:
 * Form Component -> Validation Layer -> GoalRepository -> SqlDriver (SQLite) -> Database
 */
export async function getReadingGoal(): Promise<ReadingGoal | null> {
  const sql = getSqlDriver();
  try {
    const row = await sql.getFirst<ReadingGoalRow>(
      "SELECT id, target, note, updated_at FROM reading_goal WHERE id = 1"
    );

    if (!row) {
      logger.debug("DATABASE", "goal_fetch_empty");
      return null;
    }

    const goal: ReadingGoal = {
      target: row.target,
      note: row.note,
      updatedAt: row.updated_at,
    };

    logger.debug("DATABASE", "goal_fetch_success", { target: goal.target, noteLength: goal.note.length });
    return goal;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database query failed";
    logger.error("DATABASE", "goal_fetch_error", err);
    throw new GoalStorageError(`Gagal mengambil data target bacaan: ${msg}`);
  }
}

export async function saveReadingGoal(input: {
  target: number;
  note: string;
  updatedAt?: string;
}): Promise<ReadingGoal> {
  const sql = getSqlDriver();
  const updatedAt = input.updatedAt ?? new Date().toISOString();

  try {
    await sql.run(
      `INSERT INTO reading_goal (id, target, note, updated_at)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         target = excluded.target,
         note = excluded.note,
         updated_at = excluded.updated_at`,
      input.target,
      input.note,
      updatedAt
    );

    const saved: ReadingGoal = {
      target: input.target,
      note: input.note,
      updatedAt,
    };

    logger.info("DATABASE", "goal_saved_success", {
      target: saved.target,
      note: saved.note,
    });

    return saved;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database insert failed";
    logger.error("DATABASE", "goal_save_error", err, {
      target: input.target,
      note: input.note,
    });
    throw new GoalStorageError(`Gagal menyimpan target bacaan: ${msg}`);
  }
}

export async function deleteReadingGoal(): Promise<void> {
  const sql = getSqlDriver();
  try {
    await sql.run("DELETE FROM reading_goal WHERE id = 1");
    logger.info("DATABASE", "goal_deleted_success");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database delete failed";
    logger.error("DATABASE", "goal_delete_error", err);
    throw new GoalStorageError(`Gagal menghapus target bacaan: ${msg}`);
  }
}

