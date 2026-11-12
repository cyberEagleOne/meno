/**
 * Common formatting utilities to prevent duplicated number and percentage formatting
 * logic across multiple screens and components.
 */

export function formatNumber(n: number, locale: string = "id-ID"): string {
  if (isNaN(n) || !isFinite(n)) return "0";
  return n.toLocaleString(locale);
}

export function formatPercent(
  current: number,
  total: number,
  fractionDigits: number = 1,
  locale: string = "id-ID"
): string {
  if (!total || total <= 0 || isNaN(current) || !isFinite(current)) {
    return "0";
  }
  const ratio = (current / total) * 100;
  return ratio.toLocaleString(locale, { maximumFractionDigits: fractionDigits });
}

export function calculatePercentNumber(current: number, total: number): number {
  if (!total || total <= 0 || isNaN(current) || !isFinite(current)) {
    return 0;
  }
  return Math.min(Math.max((current / total) * 100, 0), 100);
}

