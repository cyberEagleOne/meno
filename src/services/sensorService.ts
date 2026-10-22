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
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToShakeGesture(
  onShake: (destination: RandomVerseDestination) => void,
  threshold: number = 2.0
): () => void {
  Accelerometer.setUpdateInterval(150);

  let lastShakeTime = 0;

  const subscription = Accelerometer.addListener((accelerometerData) => {
    const { x, y, z } = accelerometerData;
    // Calculate total G-force acceleration magnitude
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
    subscription.remove();
  };
}
