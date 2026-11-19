# Advanced Features

Three relevant OS features are implemented and integrated in Settings. Their code presence is confirmed; native permission and hardware flows have not been verified in this audit.

| Feature | Implementation | Permission/error behavior | Device verification |
|---|---|---|---|
| Daily reading reminder | `src/services/notificationService.ts`; Settings controls; Expo Notifications | Requests notification permission; rejects when denied; schedules daily reminder and cancels previous scheduled reminders | Not verified on current Android device |
| Shake for random chapter | `src/services/sensorService.ts`; reader/settings integration | Native accelerometer subscription with cleanup and debounce; web fallback; no sensor does nothing | Not verified on current Android device |
| Biometric/PIN app lock | `src/services/authService.ts`; Settings controls | Uses local authentication and app fallback paths; exact denial/cancellation UX requires device review | Not verified on current Android device |

## Demonstration outline

On an installed native build, enable a reading reminder and confirm the OS permission prompt; trigger the test notification. Enable shake navigation and shake once to open the random chapter, then verify repeated motion is debounced. Enable the app lock and exercise biometric success, cancellation, denial, and fallback PIN.

These steps are instructions for future verification, not test results. No screenshots or hardware test results are claimed here.
