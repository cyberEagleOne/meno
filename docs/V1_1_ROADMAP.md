# V1.1 Development Roadmap

**Status:** planning only; not a release declaration. V1.1 work must remain separate from a verified v1.0 release. No `v1.0` or `v1.0_dev` branch is declared ready while the mandatory v1.0 gates remain unmet.

## Proposed improvements

| Priority | Improvement | Acceptance evidence |
|---|---|---|
| P0 | Select a real Bible translation and resolve embedding/redistribution permission | Written source, licence, attribution, and approval; content checks prove text is correctly labelled |
| P1 | Complete native Android build and device acceptance | CI artifact installs; phone/emulator walkthrough passes; SQLite survives process death |
| P1 | Complete notification, shake, and app-lock permission/fallback testing | Device evidence for allow, deny, cancel, unavailable hardware, and recovery paths |
| P1 | Close remaining Expo dependency advisories through an assessed SDK upgrade | Updated `npm audit` has no high findings, Expo Doctor passes, full regression suite passes |
| P2 | Accessibility and adaptive UI review | Real screenshots at compact/large dimensions; TalkBack and font-scale results; keyboard-safe forms |
| P2 | Authenticated issue tracking | File only genuine defects and prioritized improvements, without duplicate issues |
| P2 | Improve CI release delivery | Corrected pipeline produces downloadable APK artifact; no public release without explicit release decision |

## Completed after the initial audit

- Lint violation in goal form fixed and verified.
- Navigation boundary coverage expanded; current suite has 252 tests.
- SDK 57 compatible patch updates applied; Expo Doctor 21/21.
- Safe npm remediation reduced audit findings from 18 to 6; remaining dependency findings are documented in `SECURITY_AUDIT.md`.
- CI configured to prebuild Android before Gradle after the first runner revealed that `/android` is ignored.

## Release notes draft

### V1.1 (not released)

- Planned: licensed Bible content, verified native Android workflow, advanced-feature test coverage, accessibility improvements, and dependency-advisory remediation.
- Completed so far in the development line: SDK patch alignment, lint cleanup, exhaustive chapter-boundary tests, CI prebuild correction.
- Regression evidence: 15 suites / 252 tests passed after dependency changes and notification fix; Expo Doctor 21/21; Android bundle export passed. Corrected CI APK build is pending, and no device regression result exists.
