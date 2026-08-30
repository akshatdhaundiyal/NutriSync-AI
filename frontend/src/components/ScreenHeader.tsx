import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

export function ScreenHeader({
  title,
  subtitle,
  right,
  showThemeToggle = true,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showThemeToggle?: boolean;
}) {
  const { colors, font, fontSize, spacing, name } = useTheme();
  const insets = useSafeAreaInsets();
  const setThemeMode = useStore((s) => s.setThemeMode);

  return (
    <View
      style={{
        paddingTop: insets.top + spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
        backgroundColor: colors.canvas,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primaryContainer,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person" size={22} color={colors.onPrimaryContainer} />
        </View>
        <View style={{ flex: 1 }}>
          {subtitle ? (
            <Text
              style={{
                color: colors.textMuted,
                fontFamily: font.medium,
                fontSize: fontSize.sm,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
          <Text
            numberOfLines={1}
            style={{
              color: colors.text,
              fontFamily: font.display,
              fontSize: fontSize.xxl,
            }}
          >
            {title}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        {right}
        {showThemeToggle ? (
          <Pressable
            testID="theme-toggle"
            onPress={() => {
              tap();
              setThemeMode(name === "dark" ? "light" : "dark");
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surfaceTertiary,
            }}
          >
            <Ionicons
              name={name === "dark" ? "sunny" : "moon"}
              size={18}
              color={colors.text}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
