# CI/CD

## Current status

`.github/workflows/android-ci.yml` was added and ran on GitHub. The pushed workflow passed npm install, all 250 tests, TypeScript, lint, and Android JS bundle export. Its native APK step failed with process exit 127 because the repository ignores `/android`; the wrapper present on this workstation is not checked into the remote. The GitHub job summary identifies the build step failure; log download requires repository admin rights and was denied to this environment.

The workflow now generates the native Android project with `expo prebuild --platform android --no-install` before running Gradle. That correction has not yet been pushed or verified by a new GitHub run.

No deployment host or credentials are configured. Meno has no backend to deploy.

## Workflow

On selected branch pushes and pull requests: checkout → Node 22/npm ci → Jest → TypeScript → ESLint → Android JS export → native Android prebuild → JDK 17/Gradle release APK build → upload APK artifact. Sequential steps ensure test/lint/type failure stops the build and artifact upload. It does not publish a public release.

## Verification boundary

The corrected workflow revision must be pushed and re-run. The previous run remains failed and is not reported as a successful APK build. Android native builds require hosted runner SDK setup and can be slow; the local native build attempt also failed before compilation because this host uses Java 8. No deployment step exists because there is no configured deployment target.
