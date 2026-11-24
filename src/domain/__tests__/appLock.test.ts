import {
  APP_LOCK_GRACE_MS,
  parseAppLockEnabled,
  serializeAppLockEnabled,
  shouldLockAfterBackground,
  shouldLockOnColdStart,
} from "../appLock";

describe("app lock policy", () => {
  it("treats only the explicit 'true' setting as enabled", () => {
    expect(parseAppLockEnabled("true")).toBe(true);
    expect(parseAppLockEnabled("false")).toBe(false);
    expect(parseAppLockEnabled(null)).toBe(false);
    expect(parseAppLockEnabled("1")).toBe(false);
    expect(serializeAppLockEnabled(true)).toBe("true");
    expect(serializeAppLockEnabled(false)).toBe("false");
  });

  it("always requires authentication on a cold start when enabled", () => {
    expect(shouldLockOnColdStart(true)).toBe(true);
    expect(shouldLockOnColdStart(false)).toBe(false);
  });

  it("keeps the 10-minute grace period exclusive at the boundary", () => {
    const backgroundedAt = 1_000_000;
    expect(
      shouldLockAfterBackground({
        enabled: true,
        backgroundedAt,
        now: backgroundedAt + APP_LOCK_GRACE_MS - 1,
      }),
    ).toBe(false);
    expect(
      shouldLockAfterBackground({
        enabled: true,
        backgroundedAt,
        now: backgroundedAt + APP_LOCK_GRACE_MS,
      }),
    ).toBe(true);
  });

  it("never locks when disabled or when there is no background timestamp", () => {
    expect(
      shouldLockAfterBackground({ enabled: false, backgroundedAt: 0, now: APP_LOCK_GRACE_MS * 2 }),
    ).toBe(false);
    expect(
      shouldLockAfterBackground({ enabled: true, backgroundedAt: null, now: Date.now() }),
    ).toBe(false);
  });

  it("disabling app lock ensures neither cold start nor background locks the app", () => {
    expect(shouldLockOnColdStart(false)).toBe(false);
    expect(
      shouldLockAfterBackground({
        enabled: false,
        backgroundedAt: 1000,
        now: 1000 + APP_LOCK_GRACE_MS * 5,
      }),
    ).toBe(false);
  });

  it("handles multi-step background lifecycle correctly", () => {
    const t0 = 100_000;
    // App backgrounded at t0 and returned after 5 minutes (within 10-minute grace period)
    expect(
      shouldLockAfterBackground({
        enabled: true,
        backgroundedAt: t0,
        now: t0 + 5 * 60 * 1000,
      }),
    ).toBe(false);

    // App backgrounded at t1 and returned after 10 minutes + 1 second
    const t1 = 500_000;
    expect(
      shouldLockAfterBackground({
        enabled: true,
        backgroundedAt: t1,
        now: t1 + APP_LOCK_GRACE_MS + 1000,
      }),
    ).toBe(true);
  });
});
