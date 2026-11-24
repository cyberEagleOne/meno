import * as LocalAuthentication from "expo-local-authentication";
import { authenticateUser, checkBiometricSupport, checkDeviceAuthCapability } from "../authService";

jest.mock("expo-local-authentication", () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  getEnrolledLevelAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

describe("biometric authentication service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (LocalAuthentication.getEnrolledLevelAsync as jest.Mock).mockResolvedValue(0);
  });

  it("reports actual hardware, enrollment, and supported authentication types", async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([1, 2]);
    await expect(checkBiometricSupport()).resolves.toEqual({
      hasHardware: true,
      isEnrolled: true,
      supportedTypes: ["Sidik Jari (Fingerprint)", "Pengenalan Wajah (Face ID)"],
    });
  });

  it("does not prompt when biometric hardware is unavailable", async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
    await expect(authenticateUser()).resolves.toMatchObject({ success: false, error: expect.stringContaining("tidak memiliki") });
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
    expect(LocalAuthentication.isEnrolledAsync).not.toHaveBeenCalled();
  });

  it("supports a device screen-lock credential when no biometric hardware exists", async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
    (LocalAuthentication.getEnrolledLevelAsync as jest.Mock).mockResolvedValue(1);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });
    await expect(checkDeviceAuthCapability()).resolves.toMatchObject({
      hasHardware: false,
      securityLevel: 1,
      canAuthenticate: true,
    });
    await expect(authenticateUser()).resolves.toEqual({ success: true });
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
  });

  it("does not prompt when no biometric credential is enrolled", async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);
    await expect(authenticateUser()).resolves.toMatchObject({ success: false, error: expect.stringContaining("Belum ada") });
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
  });

  it("requests native authentication with device fallback enabled", async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });
    await expect(authenticateUser("Unlock Meno")).resolves.toEqual({ success: true });
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(expect.objectContaining({
      promptMessage: "Unlock Meno", disableDeviceFallback: false,
    }));
  });

  it.each(["user_cancel", "app_cancel"]) ("reports native cancellation (%s)", async (error) => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false, error });
    await expect(authenticateUser()).resolves.toMatchObject({ success: false, cancelled: true });
  });

  it("returns the native failure warning without treating it as success", async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false, error: "lockout", warning: "Try later" });
    await expect(authenticateUser()).resolves.toEqual({ success: false, error: "Try later" });
  });
});
