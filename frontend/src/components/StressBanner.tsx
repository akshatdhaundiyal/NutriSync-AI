import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

export function StressBanner({ onStart }: { onStart: () => void }) {
  const { colors, font, fontSize, radius, spacing } = useTheme();

  return (
    <View
      testID="stress-banner"
      style={{
        backgroundColor: colors.errorContainer,
        borderRadius: radius.DEFAULT,
        padding: spacing.cardPadding,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.outlineVariant + "80",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.innerGap }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.onTertiaryContainer + "1A",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Ionicons name="warning" size={20} color={colors.tertiary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.onErrorContainer,
              fontFamily: font.semibold,
              fontSize: fontSize.labelMd,
              fontWeight: "700",
            }}
          >
            Stress Anomaly Detected
          </Text>
          <Text
            style={{
              color: colors.onErrorContainer,
              fontFamily: font.regular,
              fontSize: fontSize.sm,
              marginTop: 3,
              opacity: 0.9,
              lineHeight: 18,
            }}
          >
            HRV dropped significantly below baseline. Down-regulate before dosing.
          </Text>
        </View>
      </View>

      <Pressable
        testID="start-breath-pacer"
        onPress={onStart}
        style={({ pressed }) => ({
          backgroundColor: colors.tertiary,
          borderRadius: radius.pill,
          paddingVertical: 10,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          alignSelf: "flex-start",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="leaf" size={14} color={colors.onTertiary} />
        <Text
          style={{
            color: colors.onTertiary,
            fontFamily: font.semibold,
            fontSize: fontSize.labelMd,
          }}
        >
          2-Min Cyclic Sighing
        </Text>
      </Pressable>
    </View>
  );
}
