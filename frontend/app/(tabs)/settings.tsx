import React from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AiProviderSection } from "@/src/components/settings/AiProviderSection";
import { BackupRestoreSection } from "@/src/components/settings/BackupRestoreSection";
import { BiometricThresholdsSection } from "@/src/components/settings/BiometricThresholdsSection";
import { GeneralSettingsSection } from "@/src/components/settings/GeneralSettingsSection";
import { TelemetrySourceSection } from "@/src/components/settings/TelemetrySourceSection";
import { useTheme } from "@/src/theme/useTheme";

export default function SettingsScreen() {
  const { colors, font, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerMargin,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxxl * 2 + insets.bottom,
          gap: spacing.stackGap,
        }}
      >
        {/* Appearance & Region Settings */}
        <GeneralSettingsSection />

        {/* Customizable Biometric Thresholds */}
        <BiometricThresholdsSection />

        {/* Data Backup & Export (JSON / CSV + Restore Modal) */}
        <BackupRestoreSection />

        {/* AI Protocol Engine & On-Device API Keys */}
        <AiProviderSection />

        {/* Biometric Data Source (Health Connect vs Mock Presets) */}
        <TelemetrySourceSection />

        {/* About Footer */}
        <View style={{ alignItems: "center", marginTop: spacing.xl, gap: 4 }}>
          <Text style={{ color: colors.text, fontFamily: font.heading, fontSize: fontSize.base, fontWeight: "700" }}>
            NutriSync AI
          </Text>
          <Text style={{ color: colors.textFaint, fontFamily: font.mono, fontSize: fontSize.xs }}>
            v1.0.0 · 100% on-device
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
