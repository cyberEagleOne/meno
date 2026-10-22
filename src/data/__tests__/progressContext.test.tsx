import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { ProgressProvider, useProgress } from "../progressContext";
import { setSqlDriver } from "../sqlDriver";
import { createExpoSqliteDriver } from "../sqliteDriver";
import { createMemoryDriver } from "./support/memoryDriver";

jest.mock("../sqliteDriver", () => ({
  createExpoSqliteDriver: jest.fn(),
}));

describe("ProgressProvider completion persistence", () => {
  let renderer: ReactTestRenderer;
  let progress: ReturnType<typeof useProgress>;
  const createDriver = createExpoSqliteDriver as jest.MockedFunction<typeof createExpoSqliteDriver>;

  function Probe() {
    progress = useProgress();
    return null;
  }

  beforeEach(async () => {
    const driver = createMemoryDriver();
    createDriver.mockResolvedValue(driver);
    await act(async () => {
      renderer = create(
        <ProgressProvider>
          <Probe />
        </ProgressProvider>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  afterEach(async () => {
    await act(async () => renderer.unmount());
    setSqlDriver(null);
    jest.clearAllMocks();
  });

  it("keeps failed completion out of context and applies it after retry", async () => {
    const driver = await createDriver.mock.results[0].value;
    driver.failOnNextRun(2);

    await act(async () => {
      await expect(progress.setCompleted("kejadian", 1, true)).rejects.toThrow("injected failure");
    });
    expect(progress.completed).toEqual({});
    expect(progress.readingDays).toEqual([]);
    expect(driver.completedRows()).toEqual([]);
    expect(driver.readingDayRows()).toEqual([]);

    await act(async () => {
      await progress.setCompleted("kejadian", 1, true);
    });
    expect(progress.completed["kejadian:1"]).toBeDefined();
    expect(progress.readingDays).toHaveLength(1);
  });

  it("keeps completion visible when undo fails, then applies successful retry", async () => {
    const driver = await createDriver.mock.results[0].value;
    await act(async () => {
      await progress.setCompleted("kejadian", 1, true);
    });
    const earnedDay = progress.readingDays;
    driver.failOnNextRun();

    await act(async () => {
      await expect(progress.setCompleted("kejadian", 1, false)).rejects.toThrow("injected failure");
    });
    expect(progress.completed["kejadian:1"]).toBeDefined();
    expect(progress.readingDays).toEqual(earnedDay);
    expect(driver.completedRows()).toHaveLength(1);

    await act(async () => {
      await progress.setCompleted("kejadian", 1, false);
    });
    expect(progress.completed).toEqual({});
    expect(progress.readingDays).toEqual(earnedDay);
    expect(driver.completedRows()).toEqual([]);
  });
});
