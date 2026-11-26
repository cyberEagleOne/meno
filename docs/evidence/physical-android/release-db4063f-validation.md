# Physical Android Release Validation (db4063f)

**Date:** 2026-11-24 (device local time; captured 2026-11-24T00:02:11+07:00)  
**Commit:** `db4063f` — `fix: finalize daily verse navigation and regression tests`  
**Device:** Connected Android test device, RMX2103, Android 11 / API 30, `arm64-v8a`
**ADB serial:** redacted
**ADB path:** `$ANDROID_SDK/platform-tools/adb`

## Build provenance

- Push to `feat/assignment-completion` triggered GitHub Actions Android CI run
  [45215477217](https://github.com/cyberEagleOne/meno/actions/runs/45215477217)
  for `db4063f`; it completed with conclusion `success` (tests, type check,
  lint, export, prebuild, Gradle ARM64 build, artifact upload).
- Downloading the CI artifact through the GitHub API returned HTTP 401
  `Requires authentication` because no GitHub token or `gh` CLI was configured.
  The workflow's exact commands were therefore reproduced locally with JDK 17,
  Node 22 via fnm, and Android SDK 36:

  ```text
  npx expo export --platform android
  npx expo prebuild --platform android --no-install
  bash android/gradlew --no-daemon -p android -PreactNativeArchitectures=arm64-v8a assembleRelease
  ```

- Local build result: `BUILD SUCCESSFUL`, 576 actionable tasks.

## APK verification

- Path: `artifacts/android/meno-release-db4063f.apk`
  (copy of `android/app/build/outputs/apk/release/app-release.apk`)
- Size: 49,739,427 bytes
- SHA-256: `d9a0735b374af2d53849cfdb39413b04445060d5f1c8a6eafb8c9efef062868c`
- Package: `com.meno.app`; versionName `1.0.0`; versionCode `1`
- SDK: compileSdk 36, targetSdk 36, minSdk 24
- ABI: ARM64-only (`lib/arm64-v8a/` only; 26 native libraries)
- Required native SQLite library present: `lib/arm64-v8a/libexpo-sqlite.so`
- Signature: APK Signature Scheme v2 verified; Android Debug certificate
  SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`

## Installation

- Existing package before the upgrade: `com.meno.app` version 1.0.0,
  first installed 2026-11-19 23:30:58.
- The host-side ADB install call for the connected Android test device did not return before the
  tool timeout (the screen had been asleep), but the device committed the
  upgrade: `lastUpdateTime` became **2026-11-23 23:55:53**, while
  `firstInstallTime` remained 2026-11-19 23:30:58.
- The installed `base.apk` was pulled from
  `/data/app/~~WlEs9rPGebZAfkQhuq6lPQ==/com.meno.app-eICOL0iyzSV1a_YY_EriPw==/base.apk`
  and its SHA-256 is `d9a0735b374af2d53849cfdb39413b04445060d5f1c8a6eafb8c9efef062868c`,
  byte-identical to the new build.
- A later `pm install -r` attempt also hung host-side and produced no further
  timestamp change; the temporary on-device copy was removed.
- No force-push, branch switch, uninstall, or data-clearing operation was
  performed.

## Launch

```text
Starting: Intent { cmp=com.meno.app/.MainActivity }
Status: ok
LaunchState: COLD
Activity: com.meno.app/.MainActivity
TotalTime: 2928
WaitTime: 2939
Complete
```

- App process PID: 19060 (alive and responding after launch).
- `mResumedActivity`: `com.meno.app/.MainActivity`.
- `mCurrentFocus`: `com.meno.app/com.meno.app.MainActivity`.
- The captured screenshot shows the Home screen with the online daily verse
  (John 3:16, World English) and the **Baca Pasal Lengkap** action, plus
  “Perjalananmu” progress and the 66-book selector.

## Log review

- No `FATAL EXCEPTION` and no `AndroidRuntime` crash for `com.meno.app` in the
  captured startup window.
- Android biometric logs show an incidental prompt for `com.meno.app` during
  the launch window and `onAuthenticated(true)`; this was not an intentional
  biometric feature test and is not counted as one.

## Scope

Verified on this physical phone: package upgrade, installed APK hash equality,
cold launch, foreground activity, live process, and Home-screen rendering with
the online daily verse. Not tested deliberately in this validation: navigation
actions, completion/goal CRUD, persistence across force-stop, notifications,
shake sensor, biometrics as a feature check, permission denial, keyboard
behavior, or accessibility. Do not infer those from this startup evidence.

## Raw evidence files

- `release-db4063f-startup.png` — device screenshot at 2026-11-24 00:01.
- `release-db4063f-device-and-apk.txt` — device, package timestamps, hashes.
- `release-db4063f-logcat-app.txt` — filtered app/biometric startup log lines.
