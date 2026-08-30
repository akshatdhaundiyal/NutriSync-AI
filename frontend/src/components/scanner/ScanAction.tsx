import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

export function ScanAction({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: spacing.xl,
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.outlineVariant + "50",
        borderStyle: "dashed",
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.brandSoft,
        }}
      >
        <Ionicons name={icon} size={22} color={colors.brand} />
      </View>
      <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm }}>
        {label}
      </Text>
    </Pressable>
  );
}
