import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, fonts, radius } from "../theme/colors";
import { Card } from "../components/ui/Card";
import { Chip } from "../components/ui/Chip";
import { IconChevron, IconSpark } from "../components/ui/Icons";
import {
  scheduleDailyReminder,
  triggerTestNotification,
} from "../services/notificationService";
import {
  subscribeToShakeGesture,
  getRandomChapter,
  RandomVerseDestination,
} from "../services/sensorService";
import {
  checkBiometricSupport,
  authenticateUser,
  BiometricCheckResult,
} from "../services/authService";
import { validateReadingGoal } from "../domain/settingsValidation";

export default function SettingsScreen() {
  const router = useRouter();

  // ==========================================
  // P4: State Management & Form with 6 UI States
  // ==========================================
  const [formState, setFormState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [targetChapters, setTargetChapters] = useState<string>("1");
  const [reflectionNote, setReflectionNote] = useState<string>("");
  const [savedGoal, setSavedGoal] = useState<{ target: number; note: string } | null>(null);
  const [loadTrigger, setLoadTrigger] = useState<number>(0);

  // Form Validation & Submit loading
  const [targetError, setTargetError] = useState<string>("");
  const [noteError, setNoteError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isMounted) return;
      setFormState(savedGoal ? "ready" : "empty");
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [loadTrigger, savedGoal]);

  const handleRetryLoad = useCallback(() => {
    setFormState("loading");
    setSubmitFeedback("");
    setLoadTrigger((prev) => prev + 1);
  }, []);

  // Form Submission with Anti-Double Tap & Validation
  const handleSubmitGoal = async () => {
    setTargetError("");
    setNoteError("");
    setSubmitFeedback("");

    const validation = validateReadingGoal({
      targetChapters,
      reflectionNote,
    });

    if (!validation.valid) {
      if (validation.targetError) setTargetError(validation.targetError);
      if (validation.noteError) setNoteError(validation.noteError);
      return;
    }

    // Loading saat proses submit agar pengguna tidak dapat melakukan double tap
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 750));
      setSavedGoal({ target: validation.parsedTarget!, note: reflectionNote.trim() });
      setFormState("ready");
      setSubmitFeedback("Target dan catatan berhasil disimpan!");
    } catch {
      setFormState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // P7: Advanced Feature 1 - Local Notifications
  // ==========================================
  const [notificationMsg, setNotificationMsg] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState<boolean>(false);

  const handleScheduleReminder = async () => {
    setIsScheduling(true);
    setNotificationMsg("");
    try {
      await scheduleDailyReminder(7, 0);
      setNotificationMsg("Pengingat harian dijadwalkan setiap pukul 07:00 WIB.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengatur notifikasi.";
      setNotificationMsg(`Error: ${msg}`);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await triggerTestNotification();
      setNotificationMsg("Notifikasi uji coba berhasil dikirim ke perangkat!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Izin notifikasi ditolak.";
      setNotificationMsg(`Error: ${msg}`);
    }
  };

  // ==========================================
  // P7: Advanced Feature 2 - Shake Sensor
  // ==========================================
  const [shakeEnabled, setShakeEnabled] = useState<boolean>(false);
  const [lastShakenVerse, setLastShakenVerse] = useState<RandomVerseDestination | null>(null);

  useEffect(() => {
    if (!shakeEnabled) return;

    const unsubscribe = subscribeToShakeGesture((destination) => {
      setLastShakenVerse(destination);
      Alert.alert(
        "Kocokan Sensor Terdeteksi! 📱",
        `Kamu mendapatkan ayat acak dari ${destination.bookName} Pasal ${destination.chapter}. Ingin membacanya sekarang?`,
        [
          { text: "Nanti saja", style: "cancel" },
          {
            text: "Buka Pasal",
            onPress: () => {
              router.push({
                pathname: "/reader/[book]/[chapter]",
                params: { book: destination.bookId, chapter: String(destination.chapter) },
              });
            },
          },
        ]
      );
    });

    return () => {
      unsubscribe();
    };
  }, [shakeEnabled, router]);

  const handleSimulateShake = () => {
    const destination = getRandomChapter();
    setLastShakenVerse(destination);
    Alert.alert(
      "Simulasi Kocokan Sensor! 📱",
      `Kitab acak terpilih: ${destination.bookName} Pasal ${destination.chapter}.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Buka Pasal",
          onPress: () => {
            router.push({
              pathname: "/reader/[book]/[chapter]",
              params: { book: destination.bookId, chapter: String(destination.chapter) },
            });
          },
        },
      ]
    );
  };

  // ==========================================
  // P7: Advanced Feature 3 - Biometric Auth
  // ==========================================
  const [biometricInfo, setBiometricInfo] = useState<BiometricCheckResult | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("");

  useEffect(() => {
    checkBiometricSupport().then(setBiometricInfo).catch(() => {});
  }, []);

  const handleAuthenticate = async () => {
    setAuthStatus("Menunggu konfirmasi sidik jari / Face ID / PIN...");
    const result = await authenticateUser("Verifikasi identitasmu untuk membuka fitur privat Meno");
    if (result.success) {
      setAuthStatus("Autentikasi Berhasil! Identitas terverifikasi.");
    } else if (result.cancelled) {
      setAuthStatus("Autentikasi Dibatalkan oleh pengguna.");
    } else {
      setAuthStatus(`Autentikasi Gagal: ${result.error}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Navigation */}
        <View style={styles.navHeader}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
          >
            <View style={{ transform: [{ rotate: "180deg" }] }}>
              <IconChevron size={22} color={colors.indigo} />
            </View>
            <Text style={styles.backText}>Kembali</Text>
          </Pressable>
          <Text style={styles.pageTitle}>Pengaturan & Fitur</Text>
        </View>

        {/* ======================================================== */}
        {/* P4: FORM DENGAN 6 KONDISI UI & STATE MANAGEMENT         */}
        {/* ======================================================== */}
        <Card tone="surface" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Chip label="P4: State & Form" tone="gold" icon={<IconSpark size={12} color={colors.goldText} />} />
          </View>
          <Text style={styles.sectionTitle}>Target Bacaan & Komitmen Pribadi</Text>
          <Text style={styles.sectionDesc}>
            Fitur ini mengimplementasikan form dengan validasi, loading, empty state, error handling, serta proteksi anti-double tap.
          </Text>

          {/* 1. Initial Loading State */}
          {formState === "loading" && (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={styles.helperText}>Memuat data preferensi...</Text>
            </View>
          )}

          {/* 4. Error State with Retry */}
          {formState === "error" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Terjadi kesalahan saat memuat data.</Text>
              <Pressable style={styles.retryBtn} onPress={handleRetryLoad}>
                <Text style={styles.retryBtnText}>Coba Lagi</Text>
              </Pressable>
            </View>
          )}

          {/* 3. Empty State Notice */}
          {formState === "empty" && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Belum ada target membaca yang disimpan. Tentukan komitmenmu di bawah ini.</Text>
            </View>
          )}

          {/* 2. Success State Notice */}
          {formState === "ready" && savedGoal && (
            <View style={styles.savedGoalBox}>
              <Text style={styles.savedGoalTitle}>Target Aktif:</Text>
              <Text style={styles.savedGoalBody}>📖 {savedGoal.target} pasal per hari</Text>
              <Text style={styles.savedGoalBody}>💬 “{savedGoal.note}”</Text>
            </View>
          )}

          {/* 5. Input Fields with Live Validation */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Pasal per Hari (1 - 50):</Text>
            <TextInput
              style={[styles.input, targetError ? styles.inputError : null]}
              value={targetChapters}
              onChangeText={(text) => {
                setTargetChapters(text);
                setTargetError("");
              }}
              keyboardType="number-pad"
              placeholder="Contoh: 2"
              placeholderTextColor={colors.stone}
            />
            {targetError ? <Text style={styles.fieldErrorText}>{targetError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catatan Komitmen Membaca:</Text>
            <TextInput
              style={[styles.input, styles.textArea, noteError ? styles.inputError : null]}
              value={reflectionNote}
              onChangeText={(text) => {
                setReflectionNote(text);
                setNoteError("");
              }}
              multiline
              numberOfLines={3}
              placeholder="Contoh: Membaca renungan setiap pagi sebelum beraktivitas."
              placeholderTextColor={colors.stone}
            />
            {noteError ? <Text style={styles.fieldErrorText}>{noteError}</Text> : null}
          </View>

          {submitFeedback ? <Text style={styles.feedbackSuccessText}>{submitFeedback}</Text> : null}

          {/* 6. Loading saat Submit (Anti-Double Tap) */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              pressed && !isSubmitting && styles.pressed,
            ]}
            onPress={handleSubmitGoal}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Simpan Komitmen Bacaan"
          >
            {isSubmitting ? (
              <View style={styles.submitRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Menyimpan...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Simpan Komitmen</Text>
            )}
          </Pressable>
        </Card>

        {/* ======================================================== */}
        {/* P7: ADVANCED FEATURE 1 - NOTIFIKASI LOKAL               */}
        {/* ======================================================== */}
        <Card tone="surface" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Chip label="P7: Advanced 1 (Notifikasi)" tone="lavender" icon={<IconSpark size={12} color={colors.lavenderInk} />} />
          </View>
          <Text style={styles.sectionTitle}>Pengingat Bacaan Harian</Text>
          <Text style={styles.sectionDesc}>
            Manfaat: Membangun kebiasaan membaca Alkitab secara konsisten melalui notifikasi pengingat lokal di jam tenang pagi hari.
          </Text>

          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [styles.actionButton, isScheduling && styles.submitButtonDisabled, pressed && styles.pressed]}
              onPress={handleScheduleReminder}
              disabled={isScheduling}
            >
              <Text style={styles.actionButtonText}>Jadwalkan Jam 07:00</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={handleTestNotification}
            >
              <Text style={styles.secondaryButtonText}>Uji Notifikasi Sekarang</Text>
            </Pressable>
          </View>

          {notificationMsg ? <Text style={styles.serviceFeedbackText}>{notificationMsg}</Text> : null}
        </Card>

        {/* ======================================================== */}
        {/* P7: ADVANCED FEATURE 2 - SENSOR GERAK (ACCELEROMETER)    */}
        {/* ======================================================== */}
        <Card tone="surface" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Chip label="P7: Advanced 2 (Sensor)" tone="mint" icon={<IconSpark size={12} color={colors.mintInk} />} />
          </View>
          <Text style={styles.sectionTitle}>Kocok HP untuk Ayat Acak (Shake)</Text>
          <Text style={styles.sectionDesc}>
            Manfaat: Memberikan pengalaman interaktif menjelajah Alkitab secara spontan menggunakan sensor gerak Accelerometer saat perangkat diguncang.
          </Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Aktifkan Sensor Gerak:</Text>
            <Switch
              value={shakeEnabled}
              onValueChange={setShakeEnabled}
              trackColor={{ false: colors.divider, true: colors.mint }}
              thumbColor={shakeEnabled ? colors.mintInk : colors.stone}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={handleSimulateShake}
          >
            <Text style={styles.secondaryButtonText}>Simulasi Gerakan Goyang (Emulator)</Text>
          </Pressable>

          {lastShakenVerse ? (
            <Text style={styles.serviceFeedbackText}>
              Terakhir digoyang: {lastShakenVerse.bookName} Pasal {lastShakenVerse.chapter}
            </Text>
          ) : null}
        </Card>

        {/* ======================================================== */}
        {/* P7: ADVANCED FEATURE 3 - AUTENTIKASI BIOMETRIK / PIN    */}
        {/* ======================================================== */}
        <Card tone="surface" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Chip label="P7: Advanced 3 (Autentikasi)" tone="gold" icon={<IconSpark size={12} color={colors.goldText} />} />
          </View>
          <Text style={styles.sectionTitle}>Kunci Privasi Aplikasi (Biometrik)</Text>
          <Text style={styles.sectionDesc}>
            Manfaat: Melindungi catatan refleksi pribadi dan riwayat bacaan pengguna menggunakan sensor sidik jari (Fingerprint), Face ID, atau PIN perangkat.
          </Text>

          {biometricInfo ? (
            <View style={styles.biometricInfoBox}>
              <Text style={styles.biometricInfoText}>
                Sensor Tersedia: {biometricInfo.hasHardware ? "Ya (Aktif)" : "Tidak"}
              </Text>
              <Text style={styles.biometricInfoText}>
                Tipe Biometrik: {biometricInfo.supportedTypes.length > 0 ? biometricInfo.supportedTypes.join(", ") : "PIN Perangkat"}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            onPress={handleAuthenticate}
          >
            <Text style={styles.actionButtonText}>Uji Autentikasi Biometrik / PIN</Text>
          </Pressable>

          {authStatus ? <Text style={styles.serviceFeedbackText}>{authStatus}</Text> : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  backText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.indigo,
    marginLeft: 4,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.indigo,
  },
  sectionCard: {
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.divider,
  },
  cardHeaderRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.indigo,
    marginBottom: 6,
  },
  sectionDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginBottom: 14,
  },
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  helperText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkMuted,
  },
  errorBox: {
    backgroundColor: colors.coralTint,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  errorTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.error,
    marginBottom: 6,
  },
  retryBtn: {
    backgroundColor: colors.error,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    alignSelf: "flex-start",
  },
  retryBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: "#FFFFFF",
  },
  emptyBox: {
    backgroundColor: colors.goldTint,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.goldText,
  },
  savedGoalBox: {
    backgroundColor: colors.mintTint,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  savedGoalTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.mintInk,
    marginBottom: 4,
  },
  savedGoalBody: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.mintInk,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.indigo,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.indigo,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
  },
  fieldErrorText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
  },
  feedbackSuccessText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.mintInk,
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: colors.indigo,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  btnRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    backgroundColor: colors.indigo,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.indigo,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  switchLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.indigo,
  },
  biometricInfoBox: {
    backgroundColor: colors.goldTint,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  biometricInfoText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.goldText,
  },
  serviceFeedbackText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.indigo,
    marginTop: 10,
    backgroundColor: colors.ivory,
    padding: 8,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
