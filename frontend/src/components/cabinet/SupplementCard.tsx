import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { QualityBadge } from "@/src/components/QualityBadge";

import { useTheme } from "@/src/theme/useTheme";
import { StashItem } from "@/src/types";
import { tap } from "@/src/utils/haptics";

function doseLabel(unit: string): string {
  switch (unit) {
    case "mg":
      return "mg";
    case "mcg":
      return "mcg";
    case "iu":
      return " IU";
    case "g":
      return "g";
    case "cfu":
      return " CFU";
    default:
      return unit;
  }
}

function iconFor(canonical: string): keyof typeof Ionicons.glyphMap {
  switch (canonical) {
    case "magnesium_glycinate":
    case "magnesium_l_threonate":
      return "moon";
    case "creatine_monohydrate":
      return "barbell";
    case "omega_3":
      return "fish";
    case "vitamin_d3":
      return "sunny";
    case "ashwagandha":
    case "l_theanine":
      return "leaf";
    case "zinc_picolinate":
    case "coq10":
      return "flash";
    default:
      return "medical";
  }
}

function Stepper({
  icon,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  testID?: string;
}) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        width: 34,
        height: 34,
        borderRadius: radius.sm,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceContainerLow,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.outlineVariant + "60",
      }}
    >
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
}

export function SupplementCard({
  item,
  index,
  onAdjustStock,
  onRemove,
}: {
  item: StashItem;
  index: number;
  onAdjustStock: (id: string, delta: number) => void;
  onRemove: (item: StashItem) => void;
}) {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const isLow = item.stockUnits <= Math.max(3, Math.round(item.unitsPerContainer * 0.15));

  return (
    <Animated.View
      entering={FadeInDown.delay(40 * index).duration(350)}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: radius.DEFAULT,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.outlineVariant + "50",
        padding: spacing.cardPadding,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
        {/* Stitch 64x64px Icon Tile */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.DEFAULT,
            backgroundColor: colors.surfaceContainerHigh,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Ionicons name={iconFor(item.canonical)} size={28} color={colors.brand} />
        </View>

        {/* Title & Top Right Bold Dose */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text
              numberOfLines={1}
              style={{
                color: colors.text,
                fontFamily: font.heading,
                fontSize: fontSize.headlineMd,
                fontWeight: "700",
                flex: 1,
                marginRight: 6,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: colors.brand,
                fontFamily: font.monoMed,
                fontSize: fontSize.labelMd,
                fontWeight: "700",
              }}
            >
              {item.dosePerUnit}
              {doseLabel(item.doseUnit)}
            </Text>
          </View>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.regular,
              fontSize: fontSize.bodyMd,
              marginTop: 2,
              marginBottom: 6,
            }}
          >
            {item.stockUnits} {item.unit}s left
          </Text>

          {/* Form / Certification Pill Tag */}
          <View style={{ alignSelf: "flex-start" }}>
            <QualityBadge quality={item.quality} form={item.chemicalForm} />
          </View>
        </View>
      </View>

      {/* Stock Progress Line */}
      <View
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.surfaceContainerHigh,
          marginTop: spacing.md,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 4,
            borderRadius: 2,
            width: `${Math.min(100, (item.stockUnits / item.unitsPerContainer) * 100)}%`,
            backgroundColor: isLow ? colors.warning : colors.brand,
          }}
        />
      </View>

      {/* Card Footer: Steppers + Delete */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: spacing.md,
        }}
      >
        <Text style={{ color: colors.textFaint, fontFamily: font.medium, fontSize: fontSize.xs }}>
          Capacity: {item.unitsPerContainer} {item.unit}s ({item.brand})
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Stepper
            icon="remove"
            testID={`stock-minus-${item.id}`}
            onPress={() => {
              tap();
              onAdjustStock(item.id, -1);
            }}
          />
          <Stepper
            icon="add"
            testID={`stock-plus-${item.id}`}
            onPress={() => {
              tap();
              onAdjustStock(item.id, 1);
            }}
          />
          <Pressable
            testID={`delete-${item.id}`}
            hitSlop={8}
            onPress={() => {
              tap();
              onRemove(item);
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textFaint} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
