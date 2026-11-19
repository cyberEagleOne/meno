# Security and Dependency Audit

**Audit date:** 2026-11-19
**Scope:** dependency advisory scan, source/config review and existing test coverage. This is not a penetration test or formal security certification.

## Executive summary

Meno is an offline-first Expo app with local SQLite progress and one read-only HTTPS daily-verse request. It has no account system or Meno-owned backend. No API credentials or secrets were found in the files staged for the first audit checkpoint.

The initial full `npm audit` reported 18 dependency findings (5 high, 13 moderate). Expo SDK-compatible patch updates followed by non-forced `npm audit fix` reduced this to 6 (3 high, 3 moderate). The remaining advisory paths are transitive dependencies in Expo Router (`query-string` / `decode-uri-component`) and Expo fingerprint (`minimatch`). npm reports that full automatic fixes require a major SDK/router change or incompatible Expo downgrade. No `--force` action was used. These advisories remain open and require an assessed SDK upgrade or upstream patch.

## Dependency evidence

| Check | Result |
|---|---|
| Initial `npm audit --omit=dev` | 13 vulnerabilities: 5 high, 8 moderate |
| After compatible Expo SDK 57 patch alignment and `npm audit fix` | 6 total: 3 high, 3 moderate, 0 critical |
| `npx expo-doctor` after updates | 21/21 checks passed |
| App regression suite after updates | 15 suites / 252 tests passed in 6.812 s |
| Forced remediation | Not run; npm proposes `expo-router@58` or Expo downgrade paths |

Current package patches include Expo 57.0.33, Expo Router 57.0.31, SQLite 57.0.5 and the matching SDK-57 native modules. See `package.json` and `package-lock.json` for exact resolutions.

## Residual advisories

| Dependency path | Severity | Current evidence | Action |
|---|---|---|---|
| `expo-router` → `query-string` → `decode-uri-component` | High | `npm audit` reports vulnerable versions through Router 58.0.12; fix available is major Router 58.0.32 | Keep SDK 57 stable; plan and test compatible Expo SDK/router upgrade. Do not claim low risk based only on internal routing use. |
| `expo` → `@expo/fingerprint` → `minimatch` | Moderate | npm advisory range includes current dependency; automatic fix points to Expo 52.0.49 and is incompatible | Await SDK-compatible upstream fix or assess upgrade path. |

These are dependency-chain findings, not proof of an exploitable app-specific vulnerability. They are also not dismissed as harmless: affected packages may execute in tooling or URL parsing paths. Do not ship a public production app until the residual advisories are evaluated for the chosen distribution and mitigated where feasible.

## Source and configuration review

- `src/data/db.ts` routes SQL through a driver abstraction and parameterized query arguments; the deterministic memory-driver tests reject unrecognized SQL.
- Daily verse uses a fixed HTTPS endpoint and validates untrusted response data (`src/data/dailyVerseRepository.ts`, `src/domain/dailyVerse.ts`). No authorization token is configured.
- `src/services/logger.ts` filters log levels and sanitizes likely sensitive fields. Avoid adding passwords, tokens, or raw user notes to logs.
- `src/services/authService.ts` delegates biometric checks to the device API; Meno does not receive raw biometric data. Native hardware behavior was not tested in this audit.
- `.env` and signing-key file patterns are ignored. The current local Android release build configuration uses a standard debug keystore; it is not a production signing arrangement.
- The Expo Router permission/advisory context remains relevant to URL handling; the repository should continue to reject untrusted deep-link input where appropriate.

## Verification limits

This audit did not perform penetration testing, device filesystem inspection, native SQLite failure testing, permission denial testing, or release APK installation. The dependency audit is point-in-time and will change as package advisories evolve. Re-run `npm audit` and `npx expo-doctor` before release.

## Changelog

| Date | Change | Evidence |
|---|---|---|
| 2026-11-19 | Updated compatible SDK 57 patches and applied non-breaking audit fixes; added notification permission regression coverage | Expo Doctor 21/21; 252 tests passed; 6 dependency advisories remain |
| 2026-11-19 | Replaced stale 2026-10-30 summary that reported 22/18 findings and unverified low-risk conclusions | Current npm audit and source review |
