import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useToast } from "@/src/components/ToastProvider";
import { Card } from "@/src/components/ui";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { BiometricThresholds } from "@/src/types";
import { tap } from "@/src/utils/haptics";

export function BiometricThresholdsSection() {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const toast = useToast();

  const settings = useStore((s) => s.settings);
  const setThresholds = useStore((s) => s.setThresholds);

  const [targetHrv, setTargetHrv] = useState(String(settings.thresholds?.targetHrvMs ?? 65));
  const [minSleep, setMinSleep] = useState(String(settings.thresholds?.minDeepSleepMin ?? 60));
  const [maxStrain, setMaxStrain] = useState(String(settings.thresholds?.maxStrain ?? 15.0));

  useEffect(() => {
    if (settings.thresholds) {
      setTargetHrv(String(settings.thresholds.targetHrvMs ?? 65));
      setMinSleep(String(settings.thresholds.minDeepSleepMin ?? 60));
      setMaxStrain(String(settings.thresholds.maxStrain ?? 15.0));
    }
  }, [settings.thresholds]);

  const handleSaveThresholds = async () => {
    tap();
    const t: BiometricThresholds = {
      targetHrvMs: Number(targetHrv) || 65,
      minDeepSleepMin: Number(minSleep) || 60,
      maxStrain: Number(maxStrain) || 15.0,
    };
    await setThresholds(t);
    toast.show("Biometric thresholds updated");
  };

  const sectionLabel = {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: fontSize.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    marginBottom: spacing.xs,
    marginLeft: 4,
  };

  return (
    <View>
      <Text style={sectionLabel}>Custom Biometric Targets</Text>
      <Card>
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.base }}>
                Target Baseline HRV (ms)
              </Text>
              <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
                Defines optimal parasympathetic tone
              </Text>
            </View>
            <TextInput
              testID="threshold-hrv-input"
              value={targetHrv}
              onChangeText={setTargetHrv}
              keyboardType="numeric"
              style={{
                width: 72,
                height: 40,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
                color: colors.text,
                fontFamily: font.monoMed,
                fontSize: fontSize.bodyMd,
                textAlign: "center",
              }}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.base }}>
                Minimum Deep Sleep Target (min)
              </Text>
              <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
                Triggers GABA-ergic recovery when breached
              </Text>
            </View>
            <TextInput
              testID="threshold-sleep-input"
              value={minSleep}
              onChangeText={setMinSleep}
              keyboardType="numeric"
              style={{
                width: 72,
                height: 40,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
                color: colors.text,
                fontFamily: font.monoMed,
                fontSize: fontSize.bodyMd,
                textAlign: "center",
              }}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.base }}>
                Max Daily Strain Ceiling
              </Text>
              <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
                Workload threshold triggering phosphocreatine replenishment
              </Text>
            </View>
            <TextInput
              testID="threshold-strain-input"
              value={maxStrain}
              onChangeText={setMaxStrain}
              keyboardType="numeric"
              style={{
                width: 72,
                height: 40,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
                color: colors.text,
                fontFamily: font.monoMed,
                fontSize: fontSize.bodyMd,
                textAlign: "center",
              }}
            />
          </View>

          <Pressable
            testID="save-thresholds-btn"
            onPress={handleSaveThresholds}
            style={{
              backgroundColor: colors.brand,
              borderRadius: radius.sm,
              paddingVertical: 10,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text style={{ color: colors.onBrand, fontFamily: font.semibold, fontSize: fontSize.sm }}>
              Save Custom Targets
            </Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}
