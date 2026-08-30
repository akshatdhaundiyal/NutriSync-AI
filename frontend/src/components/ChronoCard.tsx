import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProtocolItem, Slot } from "@/src/types";
import { useTheme } from "@/src/theme/useTheme";

const SLOT_TIME: Record<Slot, string> = {
  morning: "7:00 AM · MORNING",
  post_workout: "POST-WORKOUT",
  evening: "9:30 PM · EVENING",
};

export function ChronoCard({
  item,
  taken,
  onToggle,
  onBuy,
}: {
  item: ProtocolItem;
  taken: boolean;
  onToggle: () => void;
  onBuy: (url: string, merchant: string) => void;
}) {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const timeLabel = SLOT_TIME[item.slot] || item.slot.toUpperCase();
  const slotColor = item.slot === "evening" ? colors.accent : colors.brand;

  return (
    <View
      testID={`chrono-card-${item.canonical}`}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.outlineVariant + "50",
        padding: spacing.lg,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        opacity: taken ? 0.75 : 1,
      }}
    >
      {/* Top Slot Header + In Stash Pill */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            color: slotColor,
            fontFamily: font.semibold,
            fontSize: fontSize.labelSm,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {timeLabel}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: item.inStash ? colors.primaryContainer : colors.secondaryFixed,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: radius.pill,
          }}
        >
          <Ionicons
            name={item.inStash ? "checkmark-circle" : "cart"}
            size={11}
            color={item.inStash ? colors.onPrimaryContainer : colors.onSecondaryFixed}
          />
          <Text
            style={{
              color: item.inStash ? colors.onPrimaryContainer : colors.onSecondaryFixed,
              fontFamily: font.medium,
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            {item.inStash ? "In Stash" : "Buy New"}
          </Text>
        </View>
      </View>

      {/* Title with target dose in parentheses + Checkoff button */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: font.heading,
              fontSize: fontSize.bodyLg,
              fontWeight: "700",
              lineHeight: 24,
            }}
          >
            {item.compound} ({item.targetDose}{item.doseUnit})
          </Text>
          {item.inStash && item.doseText ? (
            <Text
              testID={`dose-${item.canonical}`}
              style={{
                color: colors.brand,
                fontFamily: font.monoMed,
                fontSize: fontSize.base,
                marginTop: 2,
              }}
            >
              {item.doseText}
            </Text>
          ) : null}
        </View>

        {/* Check-off circle */}
        <Pressable
          testID={`checkoff-${item.canonical}`}
          onPress={onToggle}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: taken ? colors.brand : colors.surfaceContainerLow,
            borderWidth: taken ? 0 : StyleSheet.hairlineWidth,
            borderColor: colors.outlineVariant,
          }}
        >
          <Ionicons
            name={taken ? "checkmark" : "ellipse-outline"}
            size={taken ? 20 : 18}
            color={taken ? colors.onBrand : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Rationale & Directions */}
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: font.regular,
          fontSize: fontSize.sm,
          lineHeight: 20,
          marginTop: 6,
        }}
      >
        {item.rationale}
      </Text>

      {/* Whole-Food Alternative Pill */}
      {item.foodAlternatives && item.foodAlternatives.length > 0 && item.foodAlternatives[0] !== "—" ? (
        <View
          style={{
            alignSelf: "flex-start",
            marginTop: spacing.sm,
            backgroundColor: colors.surfaceContainer,
            borderRadius: radius.pill,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.outlineVariant + "50",
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons name="nutrition" size={11} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.medium,
              fontSize: fontSize.labelSm,
            }}
          >
            or {item.foodAlternatives.slice(0, 2).join(", ")}
          </Text>
        </View>
      ) : null}

      {/* Localized Buy Options if not in stash */}
      {!item.inStash && item.buyOptions && item.buyOptions.length > 0 ? (
        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
          {item.buyOptions.map((b) => (
            <Pressable
              key={b.merchant}
              testID={`buy-${item.canonical}-${b.merchant}`}
              onPress={() => onBuy(b.url, b.merchant)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 8,
                borderRadius: radius.sm,
                backgroundColor: colors.surfaceContainerLow,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
              }}
            >
              <Ionicons name="cart" size={13} color={colors.text} />
              <Text
                style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm }}
              >
                {b.merchant}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
