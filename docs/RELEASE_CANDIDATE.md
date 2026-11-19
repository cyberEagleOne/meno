# Android Release Candidate

## Current status — 2026-11-19

**Not a verified release candidate.** The app identity is `com.meno.app` (visible in the existing Android Gradle configuration and the developer's unstaged `app.json` change). An ignored `app-release.apk` exists at `android/app/build/outputs/apk/release/app-release.apk` (120,194,054 bytes, timestamp Nov 15, 2026), plus an AAB. It is a pre-existing, debug-key-signed artifact and was not installed during this audit.

The current `npx expo export --platform android` succeeded after SDK patch updates and produced a 3.3 MB Hermes bundle. This does not build a native APK. A fresh local `android/gradlew.bat assembleRelease` failed before project compilation because the host Gradle process uses Java 8; this Gradle version requires Java 17 or later. GitHub Actions passed test/type/lint/bundle checks, then failed Gradle with exit 127 because the generated `/android` directory is ignored by Git and absent from a clean checkout. The workflow now runs Expo prebuild before Gradle, but this correction has not been rerun. `adb` and Android SDK environment variables were not found. No phone or emulator installation was verified.

## Release configuration observations

- Expo package name and permissions are present in the local `app.json` change and are included with the corrected Android build configuration.
- Native Gradle namespace/application ID are `com.meno.app`; version code 1 and version name 1.0.0 are configured in `android/app/build.gradle`.
- Native release signing currently uses `android/app/debug.keystore` with the standard debug credentials. Do not ship this as a public/Play Store release; create a private release keystore and manage it as a secret if distribution is planned.
- Expo Android intent/network config is present in `android/app/src/main/AndroidManifest.xml`.
- A valid release APK artifact is not yet copied to `artifacts/android/`; the existing file remains in ignored build output until rebuilt and inspected.

## Remaining release steps

1. Configure JDK 17 and Android SDK Platform/build tools supported by the checked-in Gradle project.
2. Run `android\\gradlew.bat assembleRelease`; record exact output and APK metadata.
3. Install with `adb install -r <apk>` and launch, or install manually on the lecturer's device.
4. Verify core reader/progress, restart persistence, API behavior, and all three OS-feature permission paths.
5. Capture screenshots/log evidence and copy the verified demonstrator APK under `artifacts/android/`.
6. Decide whether a private release keystore is necessary; no public release is authorized by this task.

## v1.0 readiness

Not ready: current Bible content is synthetic placeholder text; native build/install, advanced features, physical persistence, device screenshots, failed-test demonstration, and release signing are incomplete/unverified. No `v1.0` branch or release tag should be created yet.
