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

Automated coverage exists for schema setup, reads, last-read round trip, completion/undo, idempotency, simulated restart, malformed/corrupt records, and injected write failures. The tests use `src/data/__tests__/support/memoryDriver.ts`, not the Expo SQLite engine.

`docs/TESTING.md` records a previous Expo Go smoke test in which completion and progress were still present after force-stopping/relaunching. That observation is useful but is not a current standalone APK test. This audit did not complete a controlled native create → terminate → read → update → terminate → read → delete → terminate → verify-deleted sequence.

**Status:** persistence is implemented; native CRUD/restart verification remains unverified. No native persistence result is claimed based on the in-memory driver.
