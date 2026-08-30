import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { COMPOUNDS } from "@/src/data/compounds";
import { useTheme } from "@/src/theme/useTheme";
import { ProtocolItem } from "@/src/types";

export function MissingCompoundCard({
  missing,
  missingOptions,
  onBuy,
}: {
  missing: ProtocolItem;
  missingOptions: { merchant: string; url: string }[];
  onBuy: (url: string) => void;
}) {
  const { colors, font, fontSize, radius, spacing } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      testID="missing-item-card"
      style={{
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radius.lg,
        padding: spacing.cardPadding,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.tertiaryContainer + "60",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.tertiaryContainer,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Ionicons name="warning" size={22} color={colors.onTertiaryContainer} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.tertiary,
              fontFamily: font.semibold,
              fontSize: fontSize.labelSm,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Missing Recommended Item
          </Text>
          <Text
            style={{
              color: colors.text,
              fontFamily: font.heading,
              fontSize: fontSize.headlineMd,
              fontWeight: "700",
            }}
          >
            {COMPOUNDS[missing.canonical]?.label ?? missing.compound}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.regular,
              fontSize: fontSize.bodyMd,
              marginTop: 2,
            }}
          >
            {missing.rationale}
          </Text>
        </View>
      </View>

      {/* Stitch Dual Merchant Buttons */}
      <View style={{ flexDirection: "row", gap: spacing.innerGap, marginTop: spacing.xs }}>
        {missingOptions.slice(0, 2).map((opt) => (
          <Pressable
            key={opt.merchant}
            testID={`missing-item-buy-${opt.merchant}`}
            onPress={() => onBuy(opt.url)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 44,
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: radius.md,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.outlineVariant + "50",
            }}
          >
            <Ionicons name="cart-outline" size={16} color={colors.brand} />
            <Text
              style={{
                color: colors.text,
                fontFamily: font.semibold,
                fontSize: fontSize.labelMd,
              }}
            >
              Buy on {opt.merchant}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}
