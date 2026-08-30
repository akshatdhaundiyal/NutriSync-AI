import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { ProtocolMode } from "@/src/types";
import { tap } from "@/src/utils/haptics";

const MODES: { value: ProtocolMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "auto", label: "Auto", icon: "flash" },
  { value: "travel", label: "Travel", icon: "airplane" },
  { value: "illness", label: "Illness", icon: "medkit" },
  { value: "deload", label: "Deload", icon: "bed" },
];

export function ModeSelector() {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const mode = useStore((s) => s.settings.mode);
  const setMode = useStore((s) => s.setMode);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, alignItems: "center" }}
    >
      {MODES.map((m) => {
        const active = mode === m.value;
        return (
          <Pressable
            key={m.value}
            testID={`mode-${m.value}`}
            onPress={() => {
              tap();
              setMode(m.value);
            }}
            style={{
              height: 38,
              paddingHorizontal: 16,
              borderRadius: radius.pill,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: active ? colors.brand : colors.surfaceContainerHigh,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: active ? colors.brand : colors.outlineVariant + "40",
            }}
          >
            <Ionicons
              name={m.icon}
              size={15}
              color={active ? colors.onBrand : colors.textMuted}
            />
            <Text
              style={{
                color: active ? colors.onBrand : colors.text,
                fontFamily: font.semibold,
                fontSize: fontSize.labelMd,
              }}
            >
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
