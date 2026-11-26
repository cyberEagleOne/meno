# UI/UX Runtime Review

**Evidence date:** 2026-11-19. These are genuine screenshots from the Meno JavaScript bundle running in Expo Go on the API 37 `sdk_gphone64_x86_64` Android Virtual Device (1080 × 2400). They are emulator preview evidence, not screenshots from the standalone ARM64 APK or a physical phone. The Expo development overlay is visible in the captures.

| Screenshot | Screen/state | Review notes |
|---|---|---|
| `evidence/ui-review/01-home-expo-go-avd.png` | Home and online daily verse | Main action and bottom navigation are visible; page scrolls vertically. Daily verse loaded in this session. |
| `evidence/ui-review/02-library-expo-go-avd.png` | Book/chapter selection | Chapter grid is scrollable and book progress is shown. |
| `evidence/ui-review/02-reader-expo-go-avd.png` | Reader | Sample text is explicitly labeled as not Scripture; completion action is available. |
| `evidence/ui-review/03-progress-expo-go-avd.png` | Progress after a completed chapter | Shows completion count and overall progress after a real interaction. |
| `evidence/ui-review/04-settings-expo-go-avd.png` | Settings and notification feature | Goal form and reminder controls render; screen is vertically scrollable. |

The emulator screenshots show no visible clipping at the captured viewport. A keyboard-open form, TalkBack traversal, font scaling, contrast audit, and physical-device layout remain unverified. Notification delivery, sensor behavior, and biometric prompts also require native hardware/runtime validation; the screen capture alone does not verify those actions.

## Reproduction

The project was started with `npx expo start --localhost`; `adb reverse tcp:8081 tcp:8081` connected the emulator to Metro, then Expo Go opened `exp://127.0.0.1:8081`. This test path verifies the current JS application in Expo Go only. The AVD is x86_64, while the release APK contains ARM64 native libraries.
