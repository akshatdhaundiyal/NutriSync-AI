import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

export function StreakCard({
  streak,
  best,
  todayComplete,
}: {
  streak: number;
  best: number;
  todayComplete: boolean;
}) {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  return (
    <View
      testID="streak-card"
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: radius.md,
        padding: spacing.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.outlineVariant + "40",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: colors.warningSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="flame" size={24} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text
              testID="streak-count"
              style={{
                color: colors.text,
                fontFamily: font.display,
                fontSize: fontSize.xxl,
                fontWeight: "700",
              }}
            >
              {streak}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontFamily: font.medium,
                fontSize: fontSize.base,
              }}
            >
              day streak
            </Text>
          </View>
          <Text
            style={{
              color: colors.textFaint,
              fontFamily: font.regular,
              fontSize: fontSize.xs,
              marginTop: 2,
            }}
          >
            Best {best} · {todayComplete ? "Logged today" : "Log your stack to extend"}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: todayComplete ? colors.primaryContainer : colors.surfaceContainerLow,
            borderRadius: radius.pill,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Ionicons
            name={todayComplete ? "checkmark-circle" : "time-outline"}
            size={13}
            color={todayComplete ? colors.onPrimaryContainer : colors.textMuted}
          />
          <Text
            style={{
              color: todayComplete ? colors.onPrimaryContainer : colors.textMuted,
              fontFamily: font.semibold,
              fontSize: fontSize.xs,
            }}
          >
            {todayComplete ? "Complete" : "Pending"}
          </Text>
        </View>
      </View>
    </View>
  );
}
