import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { colors, fonts, radius } from "../../theme/colors";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { IconSpark } from "./Icons";
import { validateReadingGoal } from "../../domain/settingsValidation";
import { getReadingGoal, saveReadingGoal } from "../../data/goalRepository";
import { ReadingGoal } from "../../domain/goal";
import { logger } from "../../services/logger";

export interface ReadingGoalFormProps {
  onGoalSaved?: (goal: ReadingGoal) => void;
}

export function ReadingGoalForm({ onGoalSaved }: ReadingGoalFormProps) {
  // 6 UI States Management
  const [formState, setFormState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [targetChapters, setTargetChapters] = useState<string>("1");
  const [reflectionNote, setReflectionNote] = useState<string>("");
  const [savedGoal, setSavedGoal] = useState<ReadingGoal | null>(null);
  const [loadTrigger, setLoadTrigger] = useState<number>(0);

  // Field validation and submit states
  const [targetError, setTargetError] = useState<string>("");
  const [noteError, setNoteError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<string>("");

  // Load existing reading goal via GoalRepository
  useEffect(() => {
    let isMounted = true;

    getReadingGoal()
      .then((goal) => {
        if (!isMounted) return;
        if (goal) {
          setSavedGoal(goal);
          setTargetChapters(String(goal.target));
          setReflectionNote(goal.note);
          setFormState("ready");
        } else {
          setSavedGoal(null);
          setFormState("empty");
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        logger.error("FORM_VALIDATION", "goal_load_failed", err);
        setFormState("error");
      });

    return () => {
      isMounted = false;
    };
  }, [loadTrigger]);

  const handleRetryLoad = useCallback(() => {
    setFormState("loading");
    setSubmitFeedback("");
    setLoadTrigger((prev) => prev + 1);
  }, []);

  const isSubmittingRef = useRef(false);

  // Form submission with validation and Anti-Double Tap protection
  const handleSubmitGoal = async () => {
    if (isSubmittingRef.current) return;

    setTargetError("");
    setNoteError("");
    setSubmitFeedback("");

    // Validate using pure domain validation
    const validation = validateReadingGoal({
      targetChapters,
      reflectionNote,
    });

    if (!validation.valid) {
      if (validation.targetError) setTargetError(validation.targetError);
      if (validation.noteError) setNoteError(validation.noteError);
      logger.warn("FORM_VALIDATION", "goal_form_validation_rejected", {
        targetError: validation.targetError,
        noteError: validation.noteError,
      });
      return;
    }

    // Enter submitting state (anti double-tap: button disabled and re-entrance blocked)
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const saved = await saveReadingGoal({
        target: validation.parsedTarget!,
        note: reflectionNote.trim(),
      });
      setSavedGoal(saved);
      setFormState("ready");
      setSubmitFeedback("Target dan catatan berhasil disimpan!");
      if (onGoalSaved) onGoalSaved(saved);
    } catch (err: unknown) {
      logger.error("FORM_VALIDATION", "goal_submit_failed", err);
      setFormState("error");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Card tone="surface" style={styles.sectionCard}>
      <View style={styles.cardHeaderRow}>
        <Chip label="Target Bacaan" tone="gold" icon={<IconSpark size={12} color={colors.goldText} />} />
      </View>
      <Text style={styles.sectionTitle}>Target Bacaan & Komitmen Pribadi</Text>
      <Text style={styles.sectionDesc}>
        Tentukan target harian dan catatan komitmenmu. Perubahan disimpan di perangkat ini.
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
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            onPress={handleRetryLoad}
            accessibilityRole="button"
            accessibilityLabel="Coba Lagi Memuat Target"
          >
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
          accessibilityLabel="Target pasal per hari"
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
          accessibilityLabel="Catatan komitmen membaca"
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
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.coralTint,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  fieldErrorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  feedbackSuccessText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.mintInk,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: colors.indigo,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  submitButtonDisabled: {
    opacity: 0.65,
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
  pressed: {
    opacity: 0.75,
  },
});

