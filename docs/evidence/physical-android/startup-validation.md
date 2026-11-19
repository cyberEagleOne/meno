# Physical Android Install and Startup Validation

**Date:** 2026-11-19  
**Device:** RMX2103, Android 11 / API 30, `arm64-v8a`  
**ADB serial:** `a719e24d`  
**Artifact tested:** `artifacts/android/meno-release.apk`, SHA-256 `CD388C88CD1119782B802CC1F03D8BD6765FA88AD12DD3B1DCC4486435C0C128`  
**Artifact metadata:** `com.meno.app` version 1.0.0 / code 1; ARM64-only; signature verified; Android Debug certificate SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.

This is the local APK previously inspected from CI run 44529697756. It is **not asserted to be identical** to the later CI artifact from run 44558937344, whose reported digest is `1d918bb58905bc4772fd8f4e3683f0084f4bc7813cd51e3e3475ea7cb273d544`.

## Installation and launch

- The target device was authorized and showed state `device`; an emulator was also connected, so commands were scoped to serial `a719e24d`.
- Before installation, `pm list packages -f com.meno.app` returned no installed Meno package. No existing app data was present to overwrite.
- `adb -s a719e24d install -r artifacts/android/meno-release.apk` returned **Success**.
- Explicit launcher component `com.meno.app/.MainActivity` was started with `am start -W`; it returned `Status: ok`. `dumpsys activity activities` subsequently reported `com.meno.app/.MainActivity` as the resumed activity. The app process remained alive as PID 20675.

Raw command evidence is in `install-output.txt`, `launch-output.txt`, and `resumed-activity.txt`; device and artifact details are in `device-and-apk.txt`.

## Startup log review

The app-process Logcat contains:

- `APP_LIFECYCLE / app_startup` with `fontsLoaded: true`.
- `DATABASE / sqlite_init_success` from the Android SQLite startup path.
- `API_INTEGRATION / daily_verse_fetch_success` for John 3:16.
- No app-process `FATAL EXCEPTION`, `UnsatisfiedLinkError`, SQLite initialization failure, or React Native JavaScript error was found in the captured startup log.

The app log includes non-fatal Android/Oplus warnings (edge-to-edge status-bar change and a hidden ICU API access) and a moderate memory-pressure notification. The separate crash buffer contains a `DeadObjectException` from the unrelated ColorOS `com.coloros.phonemanager` process, not Meno. See `startup-logcat-app.txt` and `startup-logcat-crash.txt`.

The genuine device screenshot `01-startup.png` shows Meno open on the book chooser (`Pilih kitab`). It was captured after launch, not as a first-frame startup screenshot. No app controls were tapped by the automation during this startup step, although the app-process log contains touch input events during the capture window. Therefore no navigation action is attributed to this validation. The user should confirm the screen currently visible on the phone before functional checks continue.

## Scope

Verified on this physical phone: fresh APK installation, launch, active Meno process, native SQLite initialization, and successful daily verse fetch at startup. Not tested yet: navigation actions, completion/goal CRUD, persistence across force-stop, notifications, shake sensor, biometrics, permission denial, keyboard behavior, or accessibility. Do not infer these from startup logs or the screenshot.
