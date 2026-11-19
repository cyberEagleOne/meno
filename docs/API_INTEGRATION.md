# API Integration

## Selected slice

The product has no Meno backend by design (see `docs/PRD.md`). The vertical slice is a read-only daily verse: Home UI → daily verse domain model/validation → `fetchDailyVerseFromApi` repository → HTTPS public API → parsed/validated verse → card/loading/error/retry UI. There is no API write or server database in this architecture.

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

The tests use deterministic mocked responses. Live connectivity and the remote provider's current availability were not tested during this audit. No server/database vertical slice is asserted because it would contradict the documented product architecture.
