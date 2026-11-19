# Android Lecturer Demonstration Guide

## Status

The ARM64 APK from [successful CI run 44529697756](https://github.com/cyberEagleOne/meno/actions/runs/44529697756) is saved locally at `artifacts/android/meno-release.apk`. It has not been run on a physical phone. The earlier multi-ABI APK from run 44517378110 failed SQLite bootstrap on the API 37 x86_64 AVD because Expo SQLite JNI was absent for x86_64; this was captured at `docs/evidence/android/`. The newer APK is ARM64-only and cannot be tested on that x86_64 emulator. Windows local Gradle fails in Reanimated CMake/Ninja.

The reader currently contains synthetic text labelled **TEKS CONTOH — BUKAN KITAB SUCI** because redistribution rights for the intended translation are unresolved. Disclose this limitation during the demo; do not represent sample text as Scripture.

## Install and start

Connect an ARM64 Android phone with USB debugging enabled and authorize the computer. The APK is already available at `artifacts/android/meno-release.apk`. Install with:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r artifacts/android/meno-release.apk
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.meno.app 1
```

If installing manually, transfer the APK to the phone, allow the package installer to install that file if Android asks, and open **Meno**. No backend or account configuration is required. Internet is only needed for the daily verse API. No demonstration account or credentials exist.

## 5–10 minute sequence

1. **Home / Reader (1 min):** show the calm Indonesian home screen and placeholder-content notice.
2. **Browse (1 min):** open Library, choose a book and chapter, and point out book/chapter navigation.
3. **Read and navigate (1–2 min):** open a chapter, move to next/previous (including a book boundary if time permits), and show that merely opening a chapter does not mark it complete.
4. **Progress state (1–2 min):** tap **Tandai selesai**, show feedback, open **Kemajuan**, and show counts/progress. Undo once to demonstrate the reversible state if useful.
5. **Daily verse API (1 min):** show its loading/success state; if offline or provider fails, show the error and retry path.
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
- **Daily verse error:** check internet and use Retry; the provider is an external service.
- **Unexpected content:** the local reader is synthetic sample content, explicitly not a Bible translation.
