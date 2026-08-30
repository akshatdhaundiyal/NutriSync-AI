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

  const NODE_CONFIG: Record<
    Slot,
    { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
  > = {
    morning: {
      icon: "sunny",
      color: colors.brand,
      bg: colors.surfaceContainerHigh,
    },
    post_workout: {
      icon: "barbell",
      color: "#F59E0B",
      bg: colors.surfaceContainerHighest,
    },
    evening: {
      icon: "moon",
      color: colors.accent,
      bg: colors.secondaryFixed,
    },
  };

  return (
    <View style={{ position: "relative" }}>
      {/* Continuous Vertical Connector Line */}
      {items.length > 1 ? (
        <View
          style={{
            position: "absolute",
            left: 23,
            top: 24,
            bottom: 24,
            width: 2,
            backgroundColor: colors.outlineVariant + "50",
            zIndex: 1,
          }}
        />
      ) : null}

      <View style={{ gap: spacing.xl }}>
        {items.map((item, idx) => {
          const node = NODE_CONFIG[item.slot] || NODE_CONFIG.morning;
          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(50 * idx).duration(350)}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: spacing.lg,
                zIndex: 2,
              }}
            >
              {/* Stitch 48x48px Circular Node with 4px Canvas Border */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: node.bg,
                  borderWidth: 4,
                  borderColor: colors.canvas,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                }}
              >
                <Ionicons name={node.icon} size={20} color={node.color} />
              </View>

              {/* Event Card */}
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
    </View>
  );
}
