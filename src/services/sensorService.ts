import { Platform } from "react-native";
import { Accelerometer } from "expo-sensors";
import { placeholderBible } from "../data/placeholderBible";

export interface RandomVerseDestination {
  bookId: string;
  bookName: string;
  chapter: number;
}

/**
 * Returns a random book and chapter from the canon for the shake feature.
 */
export function getRandomChapter(): RandomVerseDestination {
  const books = placeholderBible.books;
  const randomBookIndex = Math.floor(Math.random() * books.length);
  const book = books[randomBookIndex];
  const randomChapter = Math.floor(Math.random() * book.chapters.length) + 1;

  return {
    bookId: book.id,
    bookName: book.name,
    chapter: randomChapter,
  };
}

/**
 * Subscribes to the Accelerometer sensor to detect shake gestures.
 * Web-safe: uses standard browser devicemotion when available.
 * Native-safe: uses expo-sensors Accelerometer on iOS / Android.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToShakeGesture(
  onShake: (destination: RandomVerseDestination) => void,
  threshold: number = 2.0
): () => void {
  let lastShakeTime = 0;

  // On Web, expo-sensors Accelerometer native module is not available.
  // We use the browser's native devicemotion API if supported by the browser.
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity || event.acceleration;
        if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
        // Convert m/s^2 to G-force approximation (1G ~ 9.81 m/s^2)
        const gX = acc.x / 9.81;
        const gY = acc.y / 9.81;
        const gZ = acc.z / 9.81;
        const magnitude = Math.sqrt(gX * gX + gY * gY + gZ * gZ);
        const now = Date.now();

        if (magnitude > threshold && now - lastShakeTime > 1500) {
          lastShakeTime = now;
          onShake(getRandomChapter());
        }
      };

      try {
        window.addEventListener("devicemotion", handleMotion);
        return () => {
          window.removeEventListener("devicemotion", handleMotion);
        };
      } catch {
        return () => {};
      }
    }
    return () => {};
  }

  // Native platform (Android / iOS)
  try {
    if (Accelerometer && typeof Accelerometer.addListener === "function") {
      Accelerometer.setUpdateInterval(150);

      const subscription = Accelerometer.addListener((accelerometerData) => {
        const { x, y, z } = accelerometerData;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        // Debounce shakes by 1.5 seconds so rapid movements trigger once
        if (magnitude > threshold && now - lastShakeTime > 1500) {
          lastShakeTime = now;
          const destination = getRandomChapter();
          onShake(destination);
        }
      });

      return () => {
        try {
          subscription?.remove();
        } catch {
          // ignore
        }
      };
    }
  } catch (err) {
    console.warn("Sensor Accelerometer tidak tersedia di perangkat ini:", err);
  }

  return () => {};
}
