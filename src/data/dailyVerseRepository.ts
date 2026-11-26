/** Returns the device's local calendar date as a stable YYYY-MM-DD key. */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Maps each local calendar day to a stable verse ordinal. UTC arithmetic is
 * used after parsing the date key so daylight-saving transitions do not skip
 * or repeat a day.
 */
export function getDailyVerseOffset(dateKey: string, verseCount: number): number {
  if (!Number.isInteger(verseCount) || verseCount <= 0) {
    throw new Error("Daily verse selection requires at least one verse.");
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) throw new Error("Daily verse date must use YYYY-MM-DD format.");

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() !== Number(month) - 1 ||
    parsed.getUTCDate() !== Number(day)
  ) {
    throw new Error("Daily verse date is not a valid calendar date.");
  }

  const epochDay = Math.floor(parsed.getTime() / 86_400_000);
  return ((epochDay % verseCount) + verseCount) % verseCount;
}
