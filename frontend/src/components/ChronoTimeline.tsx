import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ChronoCard } from "@/src/components/ChronoCard";
import { ProtocolItem, Slot } from "@/src/types";
import { useTheme } from "@/src/theme/useTheme";

export function ChronoTimeline({
  items,
  isTaken,
  onToggle,
  onBuy,
}: {
  items: ProtocolItem[];
  isTaken: (slot: string, canonical: string) => boolean;
  onToggle: (item: ProtocolItem) => void;
  onBuy: (url: string, merchant: string) => void;
}) {
  const { colors, spacing } = useTheme();

  const NODE: Record<Slot, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> =
    {
      morning: { icon: "sunny", color: colors.brand, bg: colors.surfaceHigh },
      post_workout: { icon: "barbell", color: "#F59E0B", bg: colors.surfaceHigh },
      evening: { icon: "moon", color: colors.accent, bg: colors.secondaryFixed },
    };

  return (
    <View style={{ position: "relative" }}>
      {items.length > 1 ? (
        <View
          style={{
            position: "absolute",
            left: 21,
            top: 28,
            bottom: 28,
            width: 2,
            backgroundColor: colors.outlineVariant,
            opacity: 0.5,
          }}
        />
      ) : null}
      {items.map((item, idx) => {
        const node = NODE[item.slot];
        return (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(60 * idx).duration(400)}
            style={{
              flexDirection: "row",
              gap: spacing.md,
              marginBottom: idx === items.length - 1 ? 0 : spacing.lg,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                marginTop: 6,
                backgroundColor: node.bg,
                borderWidth: 4,
                borderColor: colors.canvas,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={node.icon} size={20} color={node.color} />
            </View>
            <View style={{ flex: 1 }}>
              <ChronoCard
                item={item}
                taken={isTaken(item.slot, item.canonical)}
                onToggle={() => onToggle(item)}
                onBuy={onBuy}
              />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}
