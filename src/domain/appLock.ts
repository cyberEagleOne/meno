export const APP_LOCK_GRACE_MS = 10 * 60 * 1000;
export const APP_LOCK_SETTING_KEY = "app_lock_enabled";

export function parseAppLockEnabled(value: string | null): boolean {
  return value === "true";
}

export function serializeAppLockEnabled(enabled: boolean): string {
  return enabled ? "true" : "false";
}

export interface BackgroundLockInput {
  enabled: boolean;
  backgroundedAt: number | null;
  now: number;
}

/** True only when the app was backgrounded for at least the full grace period. */
export function shouldLockAfterBackground({
  enabled,
  backgroundedAt,
  now,
}: BackgroundLockInput): boolean {
  if (!enabled || backgroundedAt === null) return false;
  return now - backgroundedAt >= APP_LOCK_GRACE_MS;
}

/** Cold starts always require authentication when the user enabled App Lock. */
export function shouldLockOnColdStart(enabled: boolean): boolean {
  return enabled;
}
