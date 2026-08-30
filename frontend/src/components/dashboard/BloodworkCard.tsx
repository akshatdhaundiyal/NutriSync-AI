import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";
import { BloodMarker } from "@/src/types";

export function BloodworkCard({
  markers,
  onClear,
}: {
  markers: BloodMarker[];
  onClear: () => void;
}) {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  if (markers.length === 0) return null;

  const statusColor = (s: BloodMarker["status"]) =>
    s === "low" ? colors.warning : s === "high" ? colors.danger : colors.textMuted;

  return (
    <View
      testID="bloodwork-card"
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
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name="water" size={18} color={colors.danger} />
        <Text
          style={{
            color: colors.text,
            fontFamily: font.heading,
            fontSize: fontSize.base,
            fontWeight: "700",
            marginLeft: 8,
            flex: 1,
          }}
        >
          Bloodwork Signals
        </Text>
        <Pressable testID="clear-bloodwork" onPress={onClear} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textFaint} />
        </Pressable>
      </View>
      {markers.map((m, i) => (
        <View
          key={m.name + i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 6,
            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: colors.outlineVariant + "30",
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontFamily: font.regular,
              fontSize: fontSize.sm,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {m.name}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.mono,
              fontSize: fontSize.sm,
              marginRight: 10,
            }}
          >
            {m.value}
            {m.unit ? ` ${m.unit}` : ""}
          </Text>
          <View
            style={{
              backgroundColor: statusColor(m.status) + "22",
              borderRadius: radius.pill,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                color: statusColor(m.status),
                fontFamily: font.semibold,
                fontSize: fontSize.xs,
              }}
            >
              {m.status === "low" ? "Low" : m.status === "high" ? "High" : "Normal"}
            </Text>
          </View>
        </View>
      ))}
      <Text
        style={{
          color: colors.textFaint,
          fontFamily: font.regular,
          fontSize: fontSize.xs,
          marginTop: spacing.sm,
        }}
      >
        Low markers auto-flow into today's protocol.
      </Text>
    </View>
  );
}
