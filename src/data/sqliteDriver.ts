import * as SQLite from "expo-sqlite";

import type { SqlDriver, SqlParam } from "./sqlDriver";

const DB_NAME = "meno.db";

/** Production driver: uses native expo-sqlite on Android and iOS */
export async function createExpoSqliteDriver(): Promise<SqlDriver> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  let writeQueue = Promise.resolve();
  const serializeWrite = <T,>(task: () => Promise<T>): Promise<T> => {
    const result = writeQueue.then(task);
    writeQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
  const runDirect = async (sql: string, ...params: SqlParam[]) => {
    await db.runAsync(sql, params);
  };

  return {
    exec: (sql) => db.execAsync(sql),
    getFirst: (sql, ...params) => db.getFirstAsync(sql, params),
    getAll: (sql, ...params) => db.getAllAsync(sql, params),
    run: (sql, ...params) => serializeWrite(() => runDirect(sql, ...params)),
    transaction: (task) =>
      serializeWrite(() =>
        db.withTransactionAsync(async () => {
          await task({ run: runDirect });
        }),
      ),
  };
}
