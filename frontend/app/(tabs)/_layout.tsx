import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

const TAB_META: Record<
  string,
  { label: string; fill: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }
> = {
  index: { label: "Today", fill: "calendar", outline: "calendar-outline" },
  stash: { label: "Cabinet", fill: "medical", outline: "medical-outline" },
  trends: { label: "Trends", fill: "trending-up", outline: "trending-up-outline" },
  settings: { label: "Settings", fill: "settings", outline: "settings-outline" },
};

function FloatingTabBar({ state, navigation }: any) {
  const { colors, font } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: insets.bottom + 10,
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 8,
          gap: 2,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          shadowColor: "#0b1c30",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const meta = TAB_META[route.name] ?? {
            label: route.name,
            fill: "ellipse",
            outline: "ellipse-outline",
          };
          const onPress = () => {
            tap();
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              testID={`tab-${route.name}`}
              accessibilityRole="button"
              onPress={onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                paddingHorizontal: focused ? 16 : 14,
                paddingVertical: 11,
                borderRadius: 999,
                backgroundColor: focused ? colors.primaryContainer : "transparent",
              }}
            >
              <Ionicons
                name={focused ? meta.fill : meta.outline}
                size={20}
                color={focused ? colors.onPrimaryContainer : colors.textMuted}
              />
              {focused ? (
                <Text
                  style={{
                    color: colors.onPrimaryContainer,
                    fontFamily: font.semibold,
                    fontSize: 13,
                  }}
                >
                  {meta.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="stash" />
      <Tabs.Screen name="trends" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
