/**
 * SQL boundary used by db.ts.
 *
 * The production driver wraps expo-sqlite (see sqliteDriver.ts); tests inject
 * an in-memory fake (see __tests__/support/memoryDriver.ts) so the persistence
 * logic is verifiable on the CI/host without a device or native module.
 */
/** Values the app ever binds: text, numbers, or binary. */
export type SqlParam = string | number | null | Uint8Array;

export interface SqlExecutor {
  run(sql: string, ...params: SqlParam[]): Promise<void>;
}

export interface SqlDriver extends SqlExecutor {
  exec(sql: string): Promise<void>;
  getFirst<T>(sql: string, ...params: SqlParam[]): Promise<T | null>;
  getAll<T>(sql: string, ...params: SqlParam[]): Promise<T[]>;
  transaction(task: (tx: SqlExecutor) => Promise<void>): Promise<void>;
}

let driver: SqlDriver | null = null;

/** Installs the driver for the app (or a fake for tests). Pass null to uninstall. */
export function setSqlDriver(next: SqlDriver | null): void {
  driver = next;
}

export function getSqlDriver(): SqlDriver {
  if (!driver) {
    throw new Error("SQL driver not installed (call setSqlDriver first)");
  }
  return driver;
}
