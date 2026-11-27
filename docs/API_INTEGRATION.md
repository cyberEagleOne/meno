# API Integration

> **Historical integration note (2026-11-27):** this document describes an earlier REST-based Daily Verse implementation and its regression tests. The current app reads the Daily Verse locally from ILT3 through `src/data/bibleRepository.ts`; it does not call this endpoint in the current UI. The API repository remains a tested legacy module, not the current app data path.

## Selected slice

There is no Meno backend. The REST integration described below is historical; the current Daily Verse data flow is Home UI → `BibleProvider` → `loadDailyVerse` in `src/data/bibleRepository.ts` → local ILT3 SQLite database. It works offline when the required local database asset is present.

## Endpoint and code

- Default request: `GET https://bible-api.com/john+3:16`, `Accept: application/json`.
- Repository and normalization: `src/data/dailyVerseRepository.ts`.
- Model validation: `src/domain/dailyVerse.ts`.
- UI integration: `src/components/ui/DailyVerseCard.tsx` and home route.
- Error handling: network/read/HTTP failures become `ApiHttpError`; invalid JSON becomes `ApiJsonError`; an empty body/object/text returns `null`; payload fields are validated before use. UI exposes retry and feedback.

## Required test cases

`src/data/__tests__/dailyVerse.test.ts` covers model and repository behavior with injected fetch responses. In the 2026-11-19 baseline run, all six API cases passed as part of the 118-test suite:

| Case | Expected behavior | Evidence |
|---|---|---|
| Valid model | accepted | `dailyVerse.test.ts` |
| Invalid model | rejected by validation | `dailyVerse.test.ts` |
| Successful response | normalized daily verse returned | `dailyVerse.test.ts` |
| Empty response | returns no verse | `dailyVerse.test.ts` |
| HTTP failure | throws typed HTTP error | `dailyVerse.test.ts` |
| Malformed JSON | throws typed JSON error | `dailyVerse.test.ts` |

The six tests use deterministic mocked responses. A separate live HTTPS check on 2026-11-19 reached the configured endpoint and returned `John 3:16`, a non-empty text body, with translation metadata `World English Bible`. This verifies endpoint reachability and a current response shape; it does not prove that the app UI rendered the live data or that the provider will remain available. The live response is English while Meno's interface is Indonesian; decide whether the displayed daily verse should use a licensed Indonesian source before release. No server/database vertical slice is asserted because it would contradict the documented product architecture.
