import {
  getReadingGoal,
  saveReadingGoal,
  deleteReadingGoal,
} from "../goalRepository";
import { initProgressDb } from "../db";
import { setSqlDriver } from "../sqlDriver";
import { createMemoryDriver } from "./support/memoryDriver";
import { GoalStorageError } from "../../domain/goal";

describe("GoalRepository", () => {
  let driver: ReturnType<typeof createMemoryDriver>;

  beforeEach(async () => {
    driver = createMemoryDriver();
    setSqlDriver(driver);
    await initProgressDb();
  });

  afterEach(() => {
    setSqlDriver(null);
  });

  it("returns null when no reading goal has been saved (empty state)", async () => {
    const goal = await getReadingGoal();
    expect(goal).toBeNull();
  });

  it("saves a reading goal and retrieves it successfully", async () => {
    const saved = await saveReadingGoal({
      target: 3,
      note: "Membaca 3 pasal setiap pagi dengan tenang.",
    });

    expect(saved.target).toBe(3);
    expect(saved.note).toBe("Membaca 3 pasal setiap pagi dengan tenang.");
    expect(saved.updatedAt).toBeDefined();

    const retrieved = await getReadingGoal();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.target).toBe(3);
    expect(retrieved?.note).toBe("Membaca 3 pasal setiap pagi dengan tenang.");
  });

  it("updates an existing reading goal idempotently", async () => {
    await saveReadingGoal({
      target: 2,
      note: "Target awal dua pasal.",
    });

    const updated = await saveReadingGoal({
      target: 5,
      note: "Target dinaikkan menjadi lima pasal.",
    });

    expect(updated.target).toBe(5);

    const retrieved = await getReadingGoal();
    expect(retrieved?.target).toBe(5);
    expect(retrieved?.note).toBe("Target dinaikkan menjadi lima pasal.");
  });

  it("deletes a saved reading goal", async () => {
    await saveReadingGoal({
      target: 4,
      note: "Target untuk dihapus.",
    });

    await deleteReadingGoal();
    const retrieved = await getReadingGoal();
    expect(retrieved).toBeNull();
  });

  it("wraps SQL failures in GoalStorageError on save", async () => {
    driver.failOnNextRun();

    await expect(
      saveReadingGoal({
        target: 1,
        note: "Simulasi kegagalan database.",
      })
    ).rejects.toThrow(GoalStorageError);
  });
});

