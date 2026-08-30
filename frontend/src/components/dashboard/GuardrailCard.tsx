import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";
import { Guardrail } from "@/src/types";

export function GuardrailCard({ warnings }: { warnings: Guardrail[] }) {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  if (warnings.length === 0) return null;
  return (
    <View
      testID="guardrail-card"
      style={{
        backgroundColor: colors.warningSoft,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.warning + "60",
        padding: spacing.lg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: spacing.sm,
        }}
      >
        <Ionicons name="shield-half" size={18} color={colors.warning} />
        <Text
          style={{
            color: colors.text,
            fontFamily: font.heading,
            fontSize: fontSize.base,
            fontWeight: "700",
          }}
        >
          Interaction Guardrails
        </Text>
      </View>
      {warnings.map((w, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8, marginTop: i === 0 ? 0 : 6 }}>
          <Ionicons
            name={w.severity === "danger" ? "alert-circle" : "warning"}
            size={14}
            color={w.severity === "danger" ? colors.danger : colors.warning}
            style={{ marginTop: 2 }}
          />
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.regular,
              fontSize: fontSize.sm,
              lineHeight: 19,
              flex: 1,
            }}
          >
            {w.message}
          </Text>
        </View>
      ))}
    </View>
  );
}
