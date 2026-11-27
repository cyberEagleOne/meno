# CI/CD

## Current workflow status (verified 2026-11-27)

The workflow is `.github/workflows/android-ci.yml`. The latest GitHub Actions run checked for this review is [45860247144](https://github.com/cyberEagleOne/meno/actions/runs/45860247144), on `master` at commit `6a174c56445dbdf1117fd5aeb3748a84b8526b37`. The job concluded **success**.

| Stage | Latest run result |
|---|---|
| Install dependencies | Success |
| Unit Tests | Success |
| TypeScript check | Success |
| ESLint | Success |
| Android JavaScript export | Skipped |
| Native Android project generation | Skipped |
| Android release APK build | Skipped |
| APK artifact upload | Skipped |
| Deployment / publication | Not configured |

The workflow checks for `assets/database/ilt3.sqlite`. That local-use database is not tracked in the public repository, so the GitHub runner does not have it; all Android export/build/artifact steps are conditional on its presence and were skipped. A green run therefore confirms the executed test and static-check steps, not an APK build or deployment. The workflow does not publish the app.

The Actions run detail metadata verified the three required check steps as successful, but the exact latest-run Jest case count was not independently captured in this evidence set. Do not report the local **316/316** count as the CI count. A local 316-case output is available at `docs/evidence/P11/unit-tests-restored.txt`.

## Workflow behavior

For pushes to `master`, `feat/assignment-completion`, or `v1.0_dev`, and pull requests targeting `master` or `feat/assignment-completion`, the workflow performs:

1. Checkout, Node 22 setup, and `npm ci`.
2. Check whether the local ILT3 database is present.
3. Run Jest, TypeScript, and ESLint.
4. Only if the database exists: export the Android bundle, generate the native Android project, set up JDK 17, build an ARM64 release APK, and upload it as an Actions artifact (14-day retention).

There is no deployment host, signing-secret setup, store publishing, or GitHub Release step in this workflow. The app has no Meno backend to deploy.

## Historical CI evidence

Earlier runs in November 2026 built ARM64 APKs, including run [44529697756](https://github.com/cyberEagleOne/meno/actions/runs/44529697756). That historical APK was inspected and startup was later observed on an ARM64 physical test phone. It does not establish an APK build for the latest run or the current documentation checkout. Historical run failures and artifacts are retained in their original records.
