import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useToast } from "@/src/components/ToastProvider";
import { Card, Chip, ChipRow, Segmented } from "@/src/components/ui";
import { REGION_LABELS } from "@/src/services/procurement";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { Region, ThemeMode } from "@/src/types";
import { tap } from "@/src/utils/haptics";

export function GeneralSettingsSection() {
  const { colors, font, fontSize, spacing } = useTheme();
  const toast = useToast();

  const settings = useStore((s) => s.settings);
  const setThemeMode = useStore((s) => s.setThemeMode);
  const setRegion = useStore((s) => s.setRegion);

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
    <>
      {/* Appearance */}
      <View>
        <Text style={sectionLabel}>Appearance</Text>
        <Card>
          <Segmented
            testID="theme-segmented"
            value={settings.themeMode}
            onChange={(v) => {
              tap();
              setThemeMode(v as ThemeMode);
            }}
            options={[
              { label: "System", value: "system", icon: "phone-portrait" },
              { label: "Light", value: "light", icon: "sunny" },
              { label: "Dark", value: "dark", icon: "moon" },
            ]}
          />
        </Card>
      </View>

      {/* Region & Store */}
      <View>
        <Text style={sectionLabel}>Region & Store</Text>
        <Card padded={false} style={{ paddingVertical: spacing.md }}>
          <ChipRow testID="region-row">
            {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
              <Chip
                key={r}
                testID={`region-${r}`}
                label={REGION_LABELS[r]}
                active={settings.region === r}
                onPress={() => {
                  tap();
                  setRegion(r);
                  toast.show(`Buy links set to ${REGION_LABELS[r]}`, "info");
                }}
              />
            ))}
          </ChipRow>
          <Text
            style={{
              color: colors.textFaint,
              fontFamily: font.regular,
              fontSize: fontSize.xs,
              paddingHorizontal: spacing.lg,
              marginTop: 4,
            }}
          >
            Controls localized store links (Amazon, iHerb, Tata 1mg, etc.).
          </Text>
        </Card>
      </View>
    </>
  );
}
