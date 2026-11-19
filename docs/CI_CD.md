# CI/CD

## Current status

`.github/workflows/android-ci.yml` was added and ran on GitHub. The pushed workflow passed npm install, all 250 tests, TypeScript, lint, Android JS bundle export, native prebuild, Gradle release APK build, and artifact upload. Its earlier native APK step failed with exit 127 because `/android` is ignored and absent from a clean checkout. The GitHub job summary identifies the failure; log download requires repository admin rights and was denied to this environment.

The workflow now generates the native Android project with `expo prebuild --platform android --no-install` before running Gradle. The correction was pushed in `a41bf72`; run [44513648948](https://github.com/cyberEagleOne/meno/actions/runs/44513648948) completed successfully. Every job step passed, including release APK build and artifact upload. The 53,627,356-byte ZIP artifact is available from the run page to authorized repository users. This run predates the notification fix and its two added tests; a new CI run will verify that follow-up commit.

No deployment host or credentials are configured. Meno has no backend to deploy.

## Workflow

On selected branch pushes and pull requests: checkout → Node 22/npm ci → Jest → TypeScript → ESLint → Android JS export → native Android prebuild → JDK 17/Gradle release APK build → upload APK artifact. Sequential steps ensure test/lint/type failure stops the build and artifact upload. It does not publish a public release.

## Verification boundary

The previous runs remain failed and are not reported as successful APK builds. The corrected run completed its Gradle and artifact steps successfully; the next commit will trigger regression CI for the notification fix. Android native builds require hosted runner SDK setup and can be slow; the local native build attempt also failed before compilation because this host uses Java 8. No deployment step exists because there is no configured deployment target.
