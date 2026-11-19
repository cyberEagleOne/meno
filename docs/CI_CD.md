# CI/CD

## Current status

`.github/workflows/android-ci.yml` was added and ran on GitHub. An early workflow run stopped at the native APK step (exit 127) because `/android` is ignored and absent from a clean checkout. The corrected workflow generates the native project before Gradle; corrected run results are summarized below.

The workflow generates Android with `expo prebuild --platform android --no-install`. Runs [44513648948](https://github.com/cyberEagleOne/meno/actions/runs/44513648948) and [44517378110](https://github.com/cyberEagleOne/meno/actions/runs/44517378110) successfully built and uploaded APKs. The latter passed 252 tests and all static/bundle/build steps. Installing its APK on API 37 x86_64 exposed missing Expo SQLite JNI for x86_64. The workflow now targets ARM64 only; run [44529697756](https://github.com/cyberEagleOne/meno/actions/runs/44529697756) for commit `54619fd` succeeded, including all checks and APK upload. The downloaded APK advertises only `arm64-v8a` and contains `lib/arm64-v8a/libexpo-sqlite.so`. Its SHA-256 is `CD388C88CD1119782B802CC1F03D8BD6765FA88AD12DD3B1DCC4486435C0C128`; physical-device runtime remains unverified. The current local suite passes 253 tests.

No deployment host or credentials are configured. Meno has no backend to deploy.

## Workflow

On selected branch pushes and pull requests: checkout → Node 22/npm ci → Jest → TypeScript → ESLint → Android JS export → native Android prebuild → JDK 17/Gradle release APK build → upload APK artifact. Sequential steps ensure test/lint/type failure stops the build and artifact upload. It does not publish a public release.

## Verification boundary

The previous runs remain failed and are not reported as successful APK builds. The corrected run completed its Gradle and artifact steps successfully; the next commit will trigger regression CI for the notification fix. Android native builds require hosted runner SDK setup and can be slow; the local native build attempt also failed before compilation because this host uses Java 8. No deployment step exists because there is no configured deployment target.
