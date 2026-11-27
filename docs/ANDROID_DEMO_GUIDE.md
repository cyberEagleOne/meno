# Android Lecturer Demonstration Guide

## Current status (checked 2026-11-27)

The reader uses a local ILT3 SQLite asset for Bible chapters and Daily Verse. That asset is ignored by Git and absent from a fresh public clone and GitHub Actions. The app needs an authorized local copy at `assets/database/ilt3.sqlite`; permission to redistribute the content is not established here.

Historical artifacts show an earlier ARM64 APK built by [CI run 44529697756](https://github.com/cyberEagleOne/meno/actions/runs/44529697756) installed and started on an RMX2103 physical device, with SQLite startup evidence. The available screenshots/logs are under `docs/evidence/physical-android/`. This verifies startup at that historical source/build, not full current feature acceptance. The latest CI run, [45860247144](https://github.com/cyberEagleOne/meno/actions/runs/45860247144), skipped Android export/APK build/artifact upload because the database was absent; do not treat it as a new APK.

## Install and start

Connect an ARM64 Android phone with USB debugging enabled and authorize the computer. Supply a locally built APK from an authorized environment; the latest GitHub Actions run did not produce one. Install with:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r artifacts/android/meno-release.apk
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.meno.app 1
```

If installing manually, transfer an APK you have built in an authorized environment, allow the package installer to install that file if Android asks, and open **Meno**. No backend or account configuration is required. Reading and Daily Verse use the local ILT3 data; internet is not needed for those features.

## Historical AVD verification boundary — 2026-11-19

At the initial AVD check on 2026-11-19, `adb devices -l` detected only `emulator-5554` (`sdk_gphone64_x86_64`, API 37; ABI list `x86_64,arm64-v8a`). The ARM64-only release APK could not run on that x86_64 AVD. The app JavaScript was opened in Expo Go for preliminary UI and SQLite process-restart observation. This was not an APK test. Later that date, a physical RMX2103 startup was recorded in the evidence cited above. AVD screenshots and the restart sequence are documented in `docs/UI_UX_REVIEW.md` and `docs/evidence/android/08-avd-persistence-observation.txt`.

### Physical phone install checklist

Use an ARM64 Android phone (the release contains `arm64-v8a` only). On Windows PowerShell, from the repository root:

```powershell
$adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
& $adb devices -l
& $adb install -r artifacts/android/meno-release.apk
& $adb shell monkey -p com.meno.app 1
& $adb logcat -c
& $adb logcat -v time | Select-String 'Meno|DATABASE|NOTIFICATION|SECURITY_AUTH|AndroidRuntime|FATAL EXCEPTION'
```

If `adb devices` reports `unauthorized`, unlock the phone and accept its USB debugging prompt. For manual installation, transfer the APK to the phone and approve installation from that file source if Android asks. Confirm Meno opens, then use Logcat to check for startup/database errors. Do not install this debug-signed artifact as a public release.

### Device acceptance checklist

- [ ] `adb devices -l` shows the intended phone as `device`; note model, Android version, and ABI.
- [ ] ARM64 APK installs and launches; record package `com.meno.app`, version `1.0.0`.
- [ ] Navigate Home → Baca → book → chapter → reader; return and open Kemajuan.
- [ ] Mark a chapter complete; force-stop Meno (`& $adb shell am force-stop com.meno.app`), reopen, and confirm progress persists.
- [ ] Update/undo progress, repeat a restart, and confirm the intended state.
- [ ] Allow and deny notification permission separately; trigger test notification and schedule/cancel reminder; record OS notification result.
- [ ] Enable shake feature; make one deliberate shake, verify one destination, then verify cooldown/no repeated navigation.
- [ ] Check biometric hardware/enrollment; verify success, cancel, failure, and device credential fallback as supported by the phone.
- [ ] Verify permission denial, offline daily verse error/retry, keyboard-safe goal form, and screen-size/font scaling.
- [ ] Save genuine phone screenshots and filtered Logcat output under `docs/evidence/android/`.

Until this checklist is run, physical Android acceptance is blocked on connecting a suitable phone. API 37 Expo Go screenshots are only emulator preview evidence.

## 5–10 minute sequence

1. **Home / Reader (1 min):** show the Indonesian Home screen and open a chapter from the local ILT3 database.
2. **Browse (1 min):** open Library, choose a book and chapter, and point out book/chapter navigation.
3. **Read and navigate (1–2 min):** open a chapter, move to next/previous (including a book boundary if time permits), and show that merely opening a chapter does not mark it complete.
4. **Progress state (1–2 min):** tap **Tandai selesai**, show feedback, open **Kemajuan**, and show counts/progress. Undo once to demonstrate the reversible state if useful.
5. **Daily Verse (1 min):** show the date-keyed verse loaded from the local ILT3 database.
6. **Notifications (1 min):** in Settings enable/trigger a reminder, grant notification permission, and show the local notification.
7. **Shake navigation (30 sec):** enable the feature, shake once, and show the random destination. Avoid repeat shaking during its cooldown.
8. **Biometric/PIN lock (1 min):** enable lock and demonstrate successful authentication plus cancellation/fallback behavior on supported hardware.
9. **Persistence (1 min):** mark a chapter complete, fully close Meno, reopen it, return to Kemajuan and confirm the record remains. This is a manual Android acceptance check still to be captured.

## Troubleshooting

- **Build fails immediately:** check `java -version`; Gradle needs JDK 17+, not Java 8. Set `JAVA_HOME` to JDK 17 and install Android SDK/build tools.
- **No phone appears:** enable Developer Options and USB debugging, accept the phone's computer authorization prompt, then re-run `adb devices`.
- **Notification absent:** check Android notification permission/channel settings and battery restrictions; Android may delay scheduled notifications.
- **Shake does nothing:** confirm accelerometer availability and that shake detection is enabled; use the UI fallback if offered.
- **Biometric unavailable:** configure a device fingerprint/face and secure screen lock; use the app's PIN fallback.
- **Reader/Daily Verse unavailable:** verify that an authorized `assets/database/ilt3.sqlite` exists locally and matches the expected ILT3 schema; do not replace it with a fabricated database.

## Physical Android startup update — 2026-11-19

The local APK (`artifacts/android/meno-release.apk`, SHA-256 `CD388C88CD1119782B802CC1F03D8BD6765FA88AD12DD3B1DCC4486435C0C128`, artifact inspected from CI run 44529697756) installed successfully on the authorized RMX2103 (Android 11/API 30, ARM64). The package was not previously installed. `com.meno.app/.MainActivity` resumed, the app process stayed alive, and startup Logcat recorded `app_startup`, `sqlite_init_success`, and a successful daily-verse fetch. No Meno fatal exception, missing native library, SQLite initialization error, or JS runtime failure was found in the app PID log.

Physical evidence is under `docs/evidence/physical-android/`. The screenshot captured after launch shows the **Pilih kitab** screen. The later CI artifact from run 44558937344 has a different reported digest and was not used for this install; do not describe the tested local APK as that artifact. The separate crash buffer contains a ColorOS Phone Manager `DeadObjectException`, which is not from Meno.

Startup and SQLite initialization were verified on this physical phone on 2026-11-19. Core interactions, persistence after force-stop, notifications, shake, and biometrics were not included in that captured phone verification; follow the acceptance checklist above for a full walkthrough.
