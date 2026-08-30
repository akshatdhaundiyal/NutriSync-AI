import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

export function DeltaTag({
  label,
  value,
  delta,
  goodWhenPositive = true,
  neutral = false,
}: {
  label: string;
  value: string;
  delta: number; // percentage
  goodWhenPositive?: boolean;
  neutral?: boolean;
}) {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const positive = delta >= 0;
  const good = neutral
    ? false
    : goodWhenPositive
      ? positive
      : !positive;
  const color = neutral
    ? colors.textMuted
    : good
      ? colors.brand
      : colors.warning;
  const arrow: keyof typeof Ionicons.glyphMap =
    delta === 0 ? "remove" : positive ? "arrow-up" : "arrow-down";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceTertiary,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        gap: 4,
      }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: font.medium,
          fontSize: fontSize.xs,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontFamily: font.monoMed,
          fontSize: fontSize.lg,
        }}
      >
        {value}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
        <Ionicons name={arrow} size={11} color={color} />
        <Text style={{ color, fontFamily: font.medium, fontSize: fontSize.xs }}>
          {delta > 0 ? "+" : ""}
          {delta}% vs base
        </Text>
      </View>
    </View>
  );
}
