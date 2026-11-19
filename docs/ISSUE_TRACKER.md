# GitHub Issue Tracker

Repository: [cyberEagleOne/meno](https://github.com/cyberEagleOne/meno/issues). The initial review found no existing issues or duplicates. Eleven task issues were created using the authorized repository credential.

| # | Issue | Type | Priority | Status |
|---:|---|---|---|---|
| 3 | [Notification denial kept stale `canAskAgain`](https://github.com/cyberEagleOne/meno/issues/3) | Verified bug | P1 | Closed; fixed in `882ae88` and regression-tested |
| 4 | [Goal-form load effect caused lint failure](https://github.com/cyberEagleOne/meno/issues/4) | Verified build/lint defect | P2 | Closed; fixed in `871548b` |
| 5 | [Decide Bible translation license and replace sample reader text](https://github.com/cyberEagleOne/meno/issues/5) | Content decision | P1 | Open |
| 6 | [Verify SQLite CRUD persistence across Android restart](https://github.com/cyberEagleOne/meno/issues/6) | Acceptance test | P1 | Open |
| 7 | [Exercise Android notification permission and scheduling paths](https://github.com/cyberEagleOne/meno/issues/7) | Acceptance test | P1 | Open |
| 8 | [Verify shake navigation sensor lifecycle and cooldown](https://github.com/cyberEagleOne/meno/issues/8) | Acceptance test | P1 | Open |
| 9 | [Verify biometric and PIN lock fallback paths](https://github.com/cyberEagleOne/meno/issues/9) | Acceptance test | P1 | Open |
| 10 | [Capture UI, keyboard and accessibility review evidence](https://github.com/cyberEagleOne/meno/issues/10) | UX/accessibility | P2 | Open |
| 11 | [Upgrade deprecated artifact action and confirm hosted build](https://github.com/cyberEagleOne/meno/issues/11) | CI maintenance | P2 | Open |
| 12 | [Review remaining npm audit advisories](https://github.com/cyberEagleOne/meno/issues/12) | Dependency security | P1 | Open |
| 13 | [Android launch falls into SQLite bootstrap error](https://github.com/cyberEagleOne/meno/issues/13) | Verified x86_64 packaging/runtime defect | P0 for x86_64 | Open; ARM64-only build awaiting CI verification |

Three defects/findings were established: the goal-form state update broke lint, notification denial showed stale permission guidance, and the APK advertised x86/x86_64 while packaging Expo SQLite JNI only for ARM64. The first two are fixed and closed. The ABI discrepancy is corrected by making the new CI APK ARM64-only (run 44529697756 passed and its package metadata was inspected). Issue #13 remains open until supported ARM64 phone startup is verified. Testing did not find five genuine bugs; the assignment's five-bug quota remains unmet. The other eight issues are concrete improvements or acceptance work, not bugs.

Failure evidence: `docs/evidence/android/02-x86_64-storage-error.png`, `02-x86_64-logcat.txt`, and `02-install-verification.txt`. This records a failed x86_64 run, not successful phone acceptance. The four passing UI screenshots and accessibility review remain outstanding.
