# Android Release Candidate

## Current status — 2026-11-19

**Not a verified release candidate.** The app identity is `com.meno.app`. A fresh ARM64 APK from CI run 44529697756 is saved at `artifacts/android/meno-release.apk` and described below. A pre-existing ignored APK/AAB remains under `android/app/build/outputs`; it is not the fresh artifact described here.

The current `npx expo export --platform android` succeeded after SDK patch updates. Local Windows Gradle failed in Reanimated CMake/Ninja. The corrected CI workflow generates Android with Expo prebuild, builds APKs, and uploads artifacts. The fresh ARM64 APK from run 44529697756 was downloaded and inspected. Its multi-ABI predecessor was installed on the x86_64 emulator and exposed the SQLite ABI mismatch. The ARM64 APK has not been run on a physical phone.

## Release configuration observations

### Android runtime verification

The CI APK from run 44517378110 was downloaded and installed on the API 37 x86_64 AVD. It displayed the SQLite bootstrap failure; APK inspection showed `libexpo-sqlite.so` only under ARM64 despite x86 ABIs advertised. The workflow was narrowed to ARM64. Run [44529697756](https://github.com/cyberEagleOne/meno/actions/runs/44529697756) succeeded and its artifact was inspected: package `com.meno.app`, version 1.0.0/code 1, target SDK 36, native-code `arm64-v8a`, SQLite JNI present for ARM64, APK size 49,734,787 bytes, SHA-256 `CD388C88CD1119782B802CC1F03D8BD6765FA88AD12DD3B1DCC4486435C0C128`. `apksigner verify` passed; certificate is Android Debug. Local copy: `artifacts/android/meno-release.apk` (ignored by Git). The available x86_64 emulator cannot validate this ARM64-only build. No physical phone test has been completed.

- Expo package name and permissions are present in the local `app.json` change and are included with the corrected Android build configuration.
- Native Gradle namespace/application ID are `com.meno.app`; version code 1 and version name 1.0.0 are configured in `android/app/build.gradle`.
- Native release signing currently uses `android/app/debug.keystore` with the standard debug credentials. Do not ship this as a public/Play Store release; create a private release keystore and manage it as a secret if distribution is planned.
- Expo Android intent/network config is present in `android/app/src/main/AndroidManifest.xml`.
- The fresh CI APK is downloaded to `artifacts/android/meno-release.apk`; its signature and ARM64 SQLite library are verified. Runtime remains unverified on a physical phone.

## Remaining release steps

1. Connect an ARM64 Android phone with USB debugging enabled.
2. Install `artifacts/android/meno-release.apk` with `adb install -r <apk>` and launch, or install the transferred APK manually.
4. Verify core reader/progress, restart persistence, API behavior, and all three OS-feature permission paths.
5. Capture screenshots/log evidence from the physical phone and record the install/run outcome.
6. Decide whether a private release keystore is necessary; no public release is authorized by this task.

## v1.0 readiness

Not ready: current Bible content is synthetic placeholder text; native build/install, advanced features, physical persistence, device screenshots, failed-test demonstration, and release signing are incomplete/unverified. No `v1.0` branch or release tag should be created yet.

## Continuation check — 2026-11-19

The continuation added six disk-backed SQLite repository tests and service tests for notification, shake, and biometric behavior. Latest test result is 274/274 across 18 suites; TypeScript, lint, and Android JS/Hermes export pass. Real Expo Go AVD screenshots and a process-restart persistence observation are recorded, but they are not tests of this standalone APK. The connected AVD is x86_64 and the ARM64-only APK cannot run there. The current APK is still the CI artifact from run 44529697756 (debug-signed; hash in the Android verification record); this continuation did not produce a fresh native APK.

`v1.0` and `v1.0_dev` remain intentionally uncreated: physical installation and feature verification, real content rights, outstanding npm audit findings, and final release acceptance are unresolved. The dependency audit result is six findings (three high, three moderate); details and remediation assessment are in `docs/SECURITY_AUDIT.md`.
