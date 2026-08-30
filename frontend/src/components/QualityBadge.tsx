import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { QualityTier } from "@/src/types";
import { useTheme } from "@/src/theme/useTheme";

export function QualityBadge({
  quality,
  form,
}: {
  quality: QualityTier;
  form: string;
}) {
  const { colors, font, fontSize, radius } = useTheme();

  const map = {
    optimal: {
      color: colors.brand,
      bg: colors.brandSoft,
      icon: "shield-checkmark" as const,
      suffix: "Optimal",
    },
    good: {
      color: colors.info,
      bg: colors.info + "1e",
      icon: "checkmark-circle" as const,
      suffix: "Good",
    },
    low: {
      color: colors.warning,
      bg: colors.warningSoft,
      icon: "warning" as const,
      suffix: "Low Bioavailability",
    },
  }[quality];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        alignSelf: "flex-start",
        backgroundColor: map.bg,
        borderRadius: radius.pill,
        paddingHorizontal: 9,
        paddingVertical: 4,
      }}
    >
      <Ionicons name={map.icon} size={12} color={map.color} />
      <Text
        style={{ color: map.color, fontFamily: font.medium, fontSize: fontSize.xs }}
      >
        {form} · {map.suffix}
      </Text>
    </View>
  );
}
