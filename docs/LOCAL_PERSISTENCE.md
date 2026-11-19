# Local Persistence

Meno is designed for offline-first, on-device reading progress. It has no app-owned backend. SQLite access is wrapped so domain/repository behavior can be tested without pretending an in-memory driver is native SQLite.

## Model and implementation

- `src/data/db.ts`: schema, queries and progress persistence operations.
- `src/data/sqlDriver.ts`: `SqlDriver` abstraction and injection seam.
- `src/data/sqliteDriver.ts`: Expo SQLite adapter for native runtime.
- `src/data/sqliteDriver.web.ts`: web-specific adapter.
- `src/data/progressContext.tsx`: state-to-repository boundary.
- `src/data/goalRepository.ts`: reading goal lookup/save.
- `src/domain/types.ts`, `src/domain/goal.ts`: typed model contracts.

Data covers chapter completion by book/chapter, distinct reading dates, and last-read location/scroll position. Composite uniqueness and insert/upsert behavior provide idempotent completion. Reading goal is a singleton preference record and can be saved again to update it. Undo removes a completion record and its associated date only when no other completion on that date remains (as tested through the fake driver).

## CRUD and persistence evidence

Automated coverage includes the existing memory-driver contract tests and `src/data/__tests__/sqlitePersistence.test.ts`. The latter runs the actual functions in `src/data/db.ts` against Node's SQLite engine using a temporary disk database: schema/idempotent init, create/read after close/reopen, upserts, delete after reopen, failed-transaction rollback, and initialization error propagation. The temporary database is removed after each test; no app/user database is touched. This verifies repository SQL against SQLite but does not load Expo's Android native module.

`docs/TESTING.md` records a previous Expo Go smoke test in which completion and progress were still present after force-stopping/relaunching. That observation is useful but is not a current standalone APK test. This audit did not complete a controlled native create → terminate → read → update → terminate → read → delete → terminate → verify-deleted sequence.

**Status:** Repository CRUD, restart persistence, and rollback are VERIFIED by the disk-backed SQLite integration suite. Expo SQLite persistence across an Expo Go process restart is also VERIFIED on the API 37 emulator. Standalone ARM64 APK and physical-device persistence remain IMPLEMENTED — NOT VERIFIED.

## Native runtime observation

A release APK from CI run 44517378110 was installed on the API 37 x86_64 emulator. The app displayed its local-storage bootstrap error; Logcat showed `libexpo-sqlite.so` missing for x86_64. APK inspection found the library only for ARM64. The new ARM64-only APK from run 44529697756 contains the SQLite JNI and advertises only `arm64-v8a`; `apksigner verify` passed. Its ABI is unsupported by the available x86_64 emulator, and no physical ARM64 device is attached. Native database startup and restart persistence therefore remain unverified.

## Current emulator restart evidence (2026-11-19)

The API 37 AVD ran the current app bundle inside Expo Go. I marked Kejadian 1 complete, observed it in Progress, force-stopped the Expo Go process, relaunched the local project, and observed the same completion and 0.1% progress after SQLite initialization. See `docs/evidence/android/08-avd-persistence-observation.txt` and `docs/evidence/android/07-progress-after-expogo-restart.png`. This proves one create/read/restart path through Expo SQLite in Expo Go. It is not a standalone APK or physical-phone result and does not cover a full device CRUD cycle.

The disk-backed Node SQLite suite adds automated repository SQL coverage against the real SQLite engine, including idempotent schema initialization, restart, update, deletion, and transaction rollback. It complements rather than replaces testing the Android native module.
