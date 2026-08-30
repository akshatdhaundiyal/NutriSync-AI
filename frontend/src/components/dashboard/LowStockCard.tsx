import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

export interface LowStockEntry {
  id: string;
  name: string;
  left: string;
  url: string;
  merchant: string;
}

export function LowStockCard({
  items,
  onReorder,
}: {
  items: LowStockEntry[];
  onReorder: (url: string, merchant: string) => void;
}) {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  if (items.length === 0) return null;

  return (
    <View
      testID="low-stock-card"
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name="alert-circle" size={18} color={colors.warning} />
        <Text
          style={{
            color: colors.text,
            fontFamily: font.heading,
            fontSize: fontSize.base,
            fontWeight: "700",
          }}
        >
          Running Low — Reorder
        </Text>
      </View>
      {items.map((it, i) => (
        <View
          key={it.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: i === 0 ? 0 : spacing.sm,
            marginTop: i === 0 ? 0 : spacing.sm,
            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: colors.outlineVariant + "30",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontFamily: font.medium,
                fontSize: fontSize.base,
              }}
              numberOfLines={1}
            >
              {it.name}
            </Text>
            <Text
              style={{
                color: colors.warning,
                fontFamily: font.mono,
                fontSize: fontSize.xs,
                marginTop: 1,
              }}
            >
              {it.left}
            </Text>
          </View>
          <Pressable
            testID={`reorder-${it.id}`}
            onPress={() => {
              tap();
              onReorder(it.url, it.merchant);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radius.sm,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.outlineVariant + "50",
            }}
          >
            <Ionicons name="cart" size={13} color={colors.brand} />
            <Text
              style={{
                color: colors.text,
                fontFamily: font.medium,
                fontSize: fontSize.sm,
              }}
            >
              {it.merchant}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
