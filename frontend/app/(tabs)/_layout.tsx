import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Icon,
  Label,
  NativeTabs,
} from "expo-router/unstable-native-tabs";
import React from "react";
import { Platform, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

const useNativeTabs =
  Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;

export default function TabsLayout() {
  const { colors } = useTheme();

  if (useNativeTabs) {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Icon sf="bolt.heart.fill" />
          <Label>Today</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="stash">
          <Icon sf="pills.fill" />
          <Label>Stash</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="trends">
          <Icon sf="chart.xyaxis.line" />
          <Label>Trends</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Icon sf="gearshape.fill" />
          <Label>Settings</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontFamily: "Geist-Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stash"
        options={{
          title: "Stash",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: "Trends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
