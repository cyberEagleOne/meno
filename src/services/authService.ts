import * as LocalAuthentication from "expo-local-authentication";
import { logger } from "./logger";

export interface BiometricCheckResult {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
}

export interface AuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

export interface DeviceAuthCapability extends BiometricCheckResult {
  securityLevel: number;
  canAuthenticate: boolean;
}

async function enrolledLevel(): Promise<number> {
  const getLevel = LocalAuthentication.getEnrolledLevelAsync;
  if (typeof getLevel !== "function") return 0;
  return getLevel();
}

/**
 * Checks hardware capability and enrolled biometric credentials (Fingerprint/FaceID/PIN).
 */
export async function checkBiometricSupport(): Promise<BiometricCheckResult> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  const typeNames = types.map((t) => {
    switch (t) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return "Sidik Jari (Fingerprint)";
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return "Pengenalan Wajah (Face ID)";
      case LocalAuthentication.AuthenticationType.IRIS:
        return "Pemindaian Iris";
      default:
        return "PIN / Pola Perangkat";
    }
  });

  return {
    hasHardware,
    isEnrolled,
    supportedTypes: typeNames,
  };
}

/**
 * Reports whether the device can authenticate with biometrics or its secure
 * screen lock (PIN/pattern/password). App Lock uses the OS credential and never
 * stores a separate plaintext PIN.
 */
export async function checkDeviceAuthCapability(): Promise<DeviceAuthCapability> {
  const [base, securityLevel] = await Promise.all([
    checkBiometricSupport(),
    enrolledLevel(),
  ]);
  return {
    ...base,
    securityLevel,
    canAuthenticate: base.hasHardware || securityLevel >= 1,
  };
}

/**
 * Authenticates user using biometrics, falling back to the device credential
 * when the platform supports it.
 */
export async function authenticateUser(prompt: string = "Konfirmasi identitasmu untuk membuka Meno"): Promise<AuthResult> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
  const securityLevel = await enrolledLevel();

  if (!hasHardware && securityLevel < 1) {
    return {
      success: false,
      error: "Perangkat ini tidak memiliki sensor biometrik atau kunci layar.",
    };
  }

  if (hasHardware && !isEnrolled && securityLevel < 1) {
    return {
      success: false,
      error: "Belum ada sidik jari atau PIN yang terdaftar di perangkat ini.",
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    cancelLabel: "Batal",
    fallbackLabel: "Gunakan PIN Perangkat",
    disableDeviceFallback: false,
  });

  if (result.success) {
    logger.info("SECURITY_AUTH", "biometric_auth_success", { hasHardware, securityLevel });
    return { success: true };
  }

  if (result.error === "user_cancel" || result.error === "app_cancel") {
    logger.warn("SECURITY_AUTH", "biometric_auth_cancelled", { userCancelled: true });
    return {
      success: false,
      cancelled: true,
      error: "Autentikasi dibatalkan oleh pengguna.",
    };
  }

  logger.warn("SECURITY_AUTH", "biometric_auth_failed", { errorReason: result.error || "unknown" });
  return {
    success: false,
    error: result.warning || "Autentikasi gagal.",
  };
}
