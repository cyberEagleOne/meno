import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  APP_LOCK_SETTING_KEY,
  parseAppLockEnabled,
  serializeAppLockEnabled,
  shouldLockAfterBackground,
} from "../domain/appLock";
import {
  authenticateUser,
  checkDeviceAuthCapability,
  type AuthResult,
  type DeviceAuthCapability,
} from "../services/authService";
import { logger } from "../services/logger";
import { getAppSetting, setAppSetting } from "./db";

export type AppLockStatus = "loading" | "ready" | "error";

interface AppLockValue {
  status: AppLockStatus;
  enabled: boolean;
  locked: boolean;
  busy: boolean;
  authError: string | null;
  capability: DeviceAuthCapability | null;
  unlock: () => Promise<AuthResult>;
  updateEnabled: (enabled: boolean) => Promise<AuthResult>;
  disableRecovery: () => Promise<void>;
  retry: () => void;
}

const AppLockContext = createContext<AppLockValue | null>(null);

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AppLockStatus>("loading");
  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [capability, setCapability] = useState<DeviceAuthCapability | null>(null);
  const [attempt, setAttempt] = useState(0);
  const backgroundedAt = useRef<number | null>(null);
  const mounted = useRef(true);
  const unlockingRef = useRef(false);
  const updatingRef = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;

    (async () => {
      setStatus("loading");
      try {
        const [stored, capabilityResult] = await Promise.all([
          getAppSetting(APP_LOCK_SETTING_KEY),
          checkDeviceAuthCapability().catch(() => null),
        ]);
        if (cancelled || !mounted.current) return;
        const isEnabled = parseAppLockEnabled(stored);
        setEnabled(isEnabled);
        setLocked(isEnabled);
        setCapability(capabilityResult);
        setStatus("ready");
      } catch (err: unknown) {
        logger.error("SECURITY_AUTH", "app_lock_bootstrap_failed", err);
        if (cancelled || !mounted.current) return;
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [attempt]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === "background") {
        backgroundedAt.current = Date.now();
        return;
      }
      if (next !== "active") return;
      const at = backgroundedAt.current;
      backgroundedAt.current = null;
      if (!enabled || at === null) return;
      if (
        shouldLockAfterBackground({
          enabled,
          backgroundedAt: at,
          now: Date.now(),
        })
      ) {
        setLocked(true);
      }
    };
    const subscription = AppState.addEventListener("change", onChange);
    return () => subscription.remove();
  }, [enabled]);

  const unlock = useCallback(async (): Promise<AuthResult> => {
    if (unlockingRef.current) {
      return { success: false, error: "Verifikasi sedang berjalan." };
    }
    unlockingRef.current = true;
    setBusy(true);
    setAuthError(null);
    try {
      const result = await authenticateUser("Buka Meno");
      if (result.success) {
        backgroundedAt.current = null;
        setLocked(false);
      } else if (!result.cancelled) {
        setAuthError(result.error ?? "Autentikasi gagal.");
      }
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Autentikasi gagal.";
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      unlockingRef.current = false;
      if (mounted.current) setBusy(false);
    }
  }, []);

  const updateEnabled = useCallback(async (next: boolean): Promise<AuthResult> => {
    if (updatingRef.current) {
      return { success: false, error: "Pembaruan kunci sedang berjalan." };
    }
    updatingRef.current = true;
    setBusy(true);
    setAuthError(null);
    try {
      if (next && capability && !capability.canAuthenticate) {
        return {
          success: false,
          error: "Perangkat belum memiliki biometrik atau kunci layar.",
        };
      }
      const auth = await authenticateUser(
        next ? "Aktifkan kunci Meno" : "Matikan kunci Meno",
      );
      if (!auth.success) {
        if (!auth.cancelled) setAuthError(auth.error ?? "Autentikasi gagal.");
        return auth;
      }
      await setAppSetting(APP_LOCK_SETTING_KEY, serializeAppLockEnabled(next));
      if (!mounted.current) return auth;
      setEnabled(next);
      setLocked(false);
      backgroundedAt.current = null;
      return auth;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Pengaturan kunci gagal disimpan.";
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      updatingRef.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [capability]);

  const disableRecovery = useCallback(async () => {
    await setAppSetting(APP_LOCK_SETTING_KEY, serializeAppLockEnabled(false));
    setEnabled(false);
    setLocked(false);
    setAuthError(null);
    backgroundedAt.current = null;
  }, []);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const value = useMemo<AppLockValue>(
    () => ({
      status,
      enabled,
      locked,
      busy,
      authError,
      capability,
      unlock,
      updateEnabled,
      disableRecovery,
      retry,
    }),
    [
      status,
      enabled,
      locked,
      busy,
      authError,
      capability,
      unlock,
      updateEnabled,
      disableRecovery,
      retry,
    ],
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock(): AppLockValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) {
    throw new Error("useAppLock must be used within AppLockProvider");
  }
  return ctx;
}
