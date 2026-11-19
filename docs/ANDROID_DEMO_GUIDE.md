# Android Lecturer Demonstration Guide

## Status

This is a prepared walkthrough, not a claim that the current build has been installed on a phone. No `adb`, Android SDK environment, emulator, or physical device was detected in the audit shell. Build an APK with JDK 17 and SDK Platform 36, or use a configured EAS development/preview build, before the demonstration. The only current native APK in this workspace is a pre-existing 15-Nov debug-signed artifact.

The reader currently contains synthetic text labelled **TEKS CONTOH — BUKAN KITAB SUCI** because redistribution rights for the intended translation are unresolved. Disclose this limitation during the demo; do not represent sample text as Scripture.

## Install and start

For a fresh native APK, build with the environment requirements from `HowToRun.md` and `docs/RELEASE_CANDIDATE.md`, then install with:

```powershell
adb devices
adb install -r artifacts/android/meno-release.apk
adb shell monkey -p com.meno.app 1
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
