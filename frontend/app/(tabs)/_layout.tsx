import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast } from "@/src/components/ToastProvider";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA2cPhPgx37KadGXfXP1RtpTSTvh0Iylm2uZn-9CgdeTwbDaUxcdMVewCTi1PuOUW6_m7TIaq5nTJ6F5I3hVUeHHE-8z5xaJBOkOHI3jJckcpSrechbU3YpSb9GCqxlnSQBhqCYB7Ss7uTfdLsPOJbK_UBh8RsdYAhoYutYki8N4JjVXX-l86IQ2NWJeP0FOnrmLhAnMyBGFqHw-ziAATHW6LR2o10PQeNp0QkCHMILj0Ch51gDP8Gc";

const TAB_META: Record<
  string,
  { label: string; fill: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }
> = {
  index: { label: "Today", fill: "calendar", outline: "calendar-outline" },
  stash: { label: "Cabinet", fill: "medical", outline: "medical-outline" },
  trends: { label: "Trends", fill: "trending-up", outline: "trending-up-outline" },
};

function dateLabel(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function PersistentAppHeader({ currentRouteName }: { currentRouteName: string }) {
  const { colors, font } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const reanalyze = useStore((s) => s.reanalyze);
  const stash = useStore((s) => s.stash);
  const isSettings = currentRouteName === "settings";
  const activeStashCount = stash.filter((s) => !s.deletedAt).length;

  const handleSync = async () => {
    tap();
    await reanalyze();
    toast.show("Protocol re-analyzed");
  };

  const handleSettings = () => {
    tap();
    router.push("/(tabs)/settings");
  };

  const handleBack = () => {
    tap();
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  // Dedicated context line based on active tab
  let contextText = `Today · ${dateLabel()}`;
  if (currentRouteName === "stash") {
    contextText = `Cabinet · ${activeStashCount} supplements on shelf`;
  } else if (currentRouteName === "trends") {
    contextText = "Trends · N=1 14-day biometric correlation";
  } else if (currentRouteName === "settings") {
    contextText = "Settings · Configuration & developer tools";
  }

  return (
    <View style={{ backgroundColor: colors.canvas, zIndex: 40 }}>
      {/* Top Header Bar: Unified and persistent */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 8) + 4,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.outlineVariant + "25",
        }}
      >
        {/* Left: User Photo + "NutriSync" OR Back Button + "Settings" */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          {isSettings ? (
            <Pressable
              testID="header-back"
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surfaceContainerLow,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "40",
              }}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </Pressable>
          ) : (
            <Image
              source={{ uri: AVATAR_URL }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.surfaceContainerHigh,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "40",
              }}
            />
          )}

          <Text
            numberOfLines={1}
            style={{
              color: colors.brand,
              fontFamily: font.heading,
              fontSize: 18,
              fontWeight: "700",
              lineHeight: 22,
              letterSpacing: -0.3,
            }}
          >
            {isSettings ? "Settings" : "NutriSync"}
          </Text>
        </View>

        {/* Right Actions: Sync and Settings Gear */}
        {!isSettings ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              testID="header-sync"
              accessibilityRole="button"
              accessibilityLabel="Sync and reanalyze"
              onPress={handleSync}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surfaceContainerLow,
                borderWidth: 1,
                borderColor: colors.outlineVariant + "40",
              }}
            >
              <Ionicons name="sync" size={16} color={colors.brand} />
            </Pressable>

            <Pressable
              testID="header-settings"
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={handleSettings}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surfaceContainerLow,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "40",
              }}
            >
              <Ionicons name="settings-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* Context Line After the Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 6,
          backgroundColor: colors.surfaceContainerLow,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.outlineVariant + "25",
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.brand,
          }}
        />
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: font.medium,
            fontSize: 12,
            letterSpacing: 0.2,
          }}
        >
          {contextText}
        </Text>
      </View>
    </View>
  );
}

function FloatingTabBar({ state, navigation }: any) {
  const { colors, font, fontSize, radius } = useTheme();
  const insets = useSafeAreaInsets();

  // Filter routes to only include the 3 core tabs (Today, Cabinet, Trends)
  const visibleRoutes = state.routes.filter((r: any) => TAB_META[r.name]);
  const currentRouteName = state.routes[state.index]?.name;

  // Hide tab bar when viewing Settings
  if (currentRouteName === "settings") {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: insets.bottom + 12,
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.pill,
          paddingHorizontal: 8,
          paddingVertical: 6,
          gap: 6,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.outlineVariant + "50",
          shadowColor: "#000",
          shadowOpacity: 0.10,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
          alignItems: "center",
        }}
      >
        {visibleRoutes.map((route: any) => {
          const focused = currentRouteName === route.name;
          const meta = TAB_META[route.name];
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
                gap: 6,
                paddingHorizontal: focused ? 16 : 12,
                paddingVertical: 9,
                borderRadius: radius.pill,
                backgroundColor: focused ? colors.primaryContainer : "transparent",
              }}
            >
              <Ionicons
                name={focused ? meta.fill : meta.outline}
                size={18}
                color={focused ? colors.onPrimaryContainer : colors.textMuted}
              />
              <Text
                style={{
                  color: focused ? colors.onPrimaryContainer : colors.textMuted,
                  fontFamily: focused ? font.semibold : font.medium,
                  fontSize: fontSize.labelSm,
                }}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,
          header: () => <PersistentAppHeader currentRouteName={route.name} />,
        })}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="stash" />
        <Tabs.Screen name="trends" />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
