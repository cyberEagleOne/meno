import * as LocalAuthentication from "expo-local-authentication";

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
 * Authenticates user using biometric or device PIN.
 */
export async function authenticateUser(prompt: string = "Konfirmasi identitasmu untuk membuka Meno"): Promise<AuthResult> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return {
      success: false,
      error: "Perangkat ini tidak memiliki sensor biometrik.",
    };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
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
    return { success: true };
  }

  if (result.error === "user_cancel" || result.error === "app_cancel") {
    return {
      success: false,
      cancelled: true,
      error: "Autentikasi dibatalkan oleh pengguna.",
    };
  }

  return {
    success: false,
    error: result.warning || "Autentikasi gagal.",
  };
}
