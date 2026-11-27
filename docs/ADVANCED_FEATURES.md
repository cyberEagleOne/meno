# Advanced Features

Three relevant OS features are implemented and integrated in Settings. Service-level automated tests now exercise permission, scheduling, sensor threshold/debounce/cleanup, and biometric outcomes. Native permission and hardware flows remain unverified on the standalone APK and physical Android.

| Feature | Implementation | Permission/error behavior | Device verification |
|---|---|---|---|
| Daily reading reminder | `src/services/notificationService.ts`; Settings controls; Expo Notifications | Requests permission; rejects if denied; replaces scheduled reminders; supports immediate local test notification | Automated service tests pass. Emulator/physical notification display and Android permission prompt not verified. Expo Go warns remote push is unsupported; this app uses local notifications. |
| Shake for random chapter | `src/services/sensorService.ts`; reader/settings integration | Accelerometer sampling at 150 ms, magnitude threshold, 1.5 s debounce, listener cleanup; no compatible sensor returns no-op | Automated threshold/debounce/destination/cleanup tests pass. Physical accelerometer behavior not verified. |
| Biometric/device credential app lock | `src/services/authService.ts`; Settings controls | Uses `expo-local-authentication`; checks hardware/enrollment; reports success/failure/cancellation; passes `disableDeviceFallback: false` | Automated capability, no-hardware, no-enrollment, success, cancellation, and failure tests pass. Native prompt, biometric enrollment, and secure credential fallback not verified. |

**Permission/configuration inspection:** app config requests `USE_BIOMETRIC`, `USE_FINGERPRINT`, `RECEIVE_BOOT_COMPLETED`, and `VIBRATE`; the generated Android manifest also contains `POST_NOTIFICATIONS`. Shake reads the accelerometer and does not request a runtime permission in this implementation. No device was connected during the feature-specific permission/hardware verification described here. A later physical startup check confirmed app/SQLite startup only; it did not exercise these OS features.

**Device behavior status:** the Android emulator hosted the app in Expo Go, but native notification prompt/delivery, accelerometer input, and biometric authentication were not physically exercised. No feature is marked physically verified.

## Demonstration outline

On an installed native build, enable a reading reminder and confirm the OS permission prompt; trigger the test notification. Enable shake navigation and shake once to open the random chapter, then verify repeated motion is debounced. Enable the app lock and exercise biometric success, cancellation, denial, and fallback PIN.

These device steps remain required for final native acceptance. Screenshots under `docs/evidence/ui-review/` show app UI from the emulator's Expo Go preview; they do not establish that these OS integrations work on the standalone APK.
