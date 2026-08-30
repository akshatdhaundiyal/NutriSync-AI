import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProtocolItem, Slot } from "@/src/types";
import { useTheme } from "@/src/theme/useTheme";

const SLOT_META: Record<Slot, { title: string; icon: keyof typeof Ionicons.glyphMap }> =
  {
    morning: { title: "Morning", icon: "sunny" },
    post_workout: { title: "Post-Workout", icon: "barbell" },
    evening: { title: "Evening", icon: "moon" },
  };

const TAG_LABEL: Record<string, string> = {
  lab: "From your labs",
  travel: "Travel mode",
  illness: "Illness mode",
  deload: "Deload mode",
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
  const meta = SLOT_META[item.slot];

  return (
    <View
      testID={`chrono-card-${item.canonical}`}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        opacity: taken ? 0.72 : 1,
      }}
    >
      {/* header row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: colors.accentSoft,
            borderRadius: radius.pill,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Ionicons name={meta.icon} size={12} color={colors.accent} />
          <Text
            style={{ color: colors.accent, fontFamily: font.semibold, fontSize: fontSize.xs }}
          >
            {meta.title}
          </Text>
        </View>
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: font.mono,
            fontSize: fontSize.xs,
            marginLeft: spacing.sm,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {item.window}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: item.inStash ? colors.brandSoft : colors.warningSoft,
            borderRadius: radius.pill,
            paddingHorizontal: 9,
            paddingVertical: 4,
          }}
        >
          <Ionicons
            name={item.inStash ? "cube" : "cart"}
            size={11}
            color={item.inStash ? colors.brand : colors.warning}
          />
          <Text
            style={{
              color: item.inStash ? colors.brand : colors.warning,
              fontFamily: font.medium,
              fontSize: fontSize.xs,
            }}
          >
            {item.inStash ? "In Your Stash" : "Buy New"}
          </Text>
        </View>
      </View>

      {/* main row */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: font.semibold,
              fontSize: fontSize.lg,
            }}
          >
            {item.compound}
          </Text>
          {item.tag && TAG_LABEL[item.tag] ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                alignSelf: "flex-start",
                marginTop: 4,
                backgroundColor: item.tag === "lab" ? colors.dangerSoft : colors.accentSoft,
                borderRadius: radius.pill,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Ionicons
                name={item.tag === "lab" ? "water" : "sparkles"}
                size={10}
                color={item.tag === "lab" ? colors.danger : colors.accent}
              />
              <Text
                style={{
                  color: item.tag === "lab" ? colors.danger : colors.accent,
                  fontFamily: font.medium,
                  fontSize: fontSize.xs,
                }}
              >
                {TAG_LABEL[item.tag]}
              </Text>
            </View>
          ) : null}
          <Text
            style={{
              color: colors.brand,
              fontFamily: font.monoMed,
              fontSize: fontSize.base,
              marginTop: 3,
            }}
            testID={`dose-${item.canonical}`}
          >
            {item.doseText}
          </Text>
        </View>

        <Pressable
          testID={`checkoff-${item.canonical}`}
          onPress={onToggle}
          hitSlop={10}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: taken ? colors.brand : "transparent",
            borderWidth: taken ? 0 : 2,
            borderColor: colors.borderStrong,
          }}
        >
          <Ionicons
            name={taken ? "checkmark" : "ellipse-outline"}
            size={taken ? 22 : 20}
            color={taken ? colors.onBrand : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* rationale */}
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: font.regular,
          fontSize: fontSize.sm,
          lineHeight: 19,
          marginTop: spacing.sm,
        }}
      >
        {item.rationale}
      </Text>

      {/* food alternatives */}
      {item.foodAlternatives.length > 0 && item.foodAlternatives[0] !== "—" ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md, flexWrap: "wrap" }}>
          <Ionicons name="nutrition" size={13} color={colors.textFaint} />
          {item.foodAlternatives.map((f) => (
            <View
              key={f}
              style={{
                backgroundColor: colors.surfaceTertiary,
                borderRadius: radius.sm,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}
              >
                {f}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* buy options */}
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
                paddingVertical: 10,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceTertiary,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="open-outline" size={14} color={colors.text} />
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
