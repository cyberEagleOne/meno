# Android Release Candidate

## Current status — 2026-11-19

**Not a verified release candidate.** The app identity is `com.meno.app` (visible in the existing Android Gradle configuration and the developer's unstaged `app.json` change). An ignored `app-release.apk` exists at `android/app/build/outputs/apk/release/app-release.apk` (120,194,054 bytes, timestamp Nov 15, 2026), plus an AAB. It is a pre-existing, debug-key-signed artifact and was not installed during this audit.

The current `npx expo export --platform android` succeeded after SDK patch updates and produced a 3.3 MB Hermes bundle. This does not build a native APK. A fresh local `android/gradlew.bat assembleRelease` failed before project compilation because the host Gradle process uses Java 8; this Gradle version requires Java 17 or later. Earlier GitHub Actions runs passed test/type/lint/bundle checks, then failed Gradle with exit 127 because `/android` is ignored and absent from a clean checkout. The corrected workflow in `a41bf72` generates Android with Expo prebuild; run `44513648948` completed successfully, including Gradle release APK build and artifact upload (53,627,356-byte ZIP artifact). The artifact is available from the Actions run to authorized repository users; public API download returned HTTP 401 in this workspace. No installation or device behavior was verified. `adb` and Android SDK environment variables were not found. No phone or emulator installation was verified.

## Release configuration observations

### Android runtime verification

The CI APK from run 44517378110 was downloaded and installed on the API 37 x86_64 AVD. It displayed the SQLite bootstrap failure; APK inspection showed `libexpo-sqlite.so` only under ARM64 despite x86 ABIs advertised. The workflow was narrowed to ARM64. Run [44529697756](https://github.com/cyberEagleOne/meno/actions/runs/44529697756) succeeded and its artifact was inspected: package `com.meno.app`, version 1.0.0/code 1, target SDK 36, native-code `arm64-v8a`, SQLite JNI present for ARM64, APK size 49,734,787 bytes, SHA-256 `CD388C88CD1119782B802CC1F03D8BD6765FA88AD12DD3B1DCC4486435C0C128`. `apksigner verify` passed; certificate is Android Debug. Local copy: `artifacts/android/meno-release.apk` (ignored by Git). The available x86_64 emulator cannot validate this ARM64-only build. No physical phone test has been completed.

- Expo package name and permissions are present in the local `app.json` change and are included with the corrected Android build configuration.
- Native Gradle namespace/application ID are `com.meno.app`; version code 1 and version name 1.0.0 are configured in `android/app/build.gradle`.
- Native release signing currently uses `android/app/debug.keystore` with the standard debug credentials. Do not ship this as a public/Play Store release; create a private release keystore and manage it as a secret if distribution is planned.
- Expo Android intent/network config is present in `android/app/src/main/AndroidManifest.xml`.
- The verified CI APK artifact is published on run `44513648948`, but could not be downloaded into `artifacts/android/` because GitHub requires authentication. It is not installed or device-verified.

## Remaining release steps

1. Configure JDK 17 and Android SDK Platform/build tools supported by the checked-in Gradle project.
2. Run `android\\gradlew.bat assembleRelease`; record exact output and APK metadata.
3. Install with `adb install -r <apk>` and launch, or install manually on the lecturer's device.
4. Verify core reader/progress, restart persistence, API behavior, and all three OS-feature permission paths.
5. Download the CI artifact from the Actions page when authenticated, inspect/install it, then capture screenshots/log evidence and place the verified demonstrator APK under `artifacts/android/`.
6. Decide whether a private release keystore is necessary; no public release is authorized by this task.

## v1.0 readiness

Not ready: current Bible content is synthetic placeholder text; native build/install, advanced features, physical persistence, device screenshots, failed-test demonstration, and release signing are incomplete/unverified. No `v1.0` branch or release tag should be created yet.
