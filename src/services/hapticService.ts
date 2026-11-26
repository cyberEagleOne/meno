import { Vibration } from "react-native";

export function triggerSuccessHaptic(): void {
  try {
    Vibration.vibrate(50);
  } catch {
    // Haptic feedback must never interrupt a successful app action.
  }
}