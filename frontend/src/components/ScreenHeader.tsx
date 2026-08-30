import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast } from "@/src/components/ToastProvider";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA2cPhPgx37KadGXfXP1RtpTSTvh0Iylm2uZn-9CgdeTwbDaUxcdMVewCTi1PuOUW6_m7TIaq5nTJ6F5I3hVUeHHE-8z5xaJBOkOHI3jJckcpSrechbU3YpSb9GCqxlnSQBhqCYB7Ss7uTfdLsPOJbK_UBh8RsdYAhoYutYki8N4JjVXX-l86IQ2NWJeP0FOnrmLhAnMyBGFqHw-ziAATHW6LR2o10PQeNp0QkCHMILj0Ch51gDP8Gc";

export function ScreenHeader({
  title = "NutriSync",
  context,
  showSync = true,
  onSync,
  showSettings = true,
  isBackScreen = false,
  onBack,
}: {
  title?: string;
  context?: string;
  showSync?: boolean;
  onSync?: () => void;
  showSettings?: boolean;
  isBackScreen?: boolean;
  onBack?: () => void;
}) {
  const { colors, font } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const reanalyze = useStore((s) => s.reanalyze);

  const handleSync = async () => {
    tap();
    if (onSync) {
      onSync();
    } else {
      await reanalyze();
      toast.show("Protocol re-analyzed");
    }
  };

  const handleSettings = () => {
    tap();
    router.push("/(tabs)/settings");
  };

  const handleBack = () => {
    tap();
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  return (
    <View style={{ backgroundColor: colors.canvas, zIndex: 40 }}>
      {/* Top Header Bar */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 8) + 4,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: context ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.outlineVariant + "25",
        }}
      >
        {/* Left: App Logo / Avatar + "NutriSync" OR Back Button + Title */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          {isBackScreen ? (
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
            {title}
          </Text>
        </View>

        {/* Right Actions: Sync and Settings */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {showSync && !isBackScreen ? (
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
          ) : null}

          {showSettings && !isBackScreen ? (
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
              <Ionicons name="settings-sharp" size={17} color={colors.text} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Context Line After the Header */}
      {context ? (
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
            {context}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
