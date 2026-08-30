import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

export function StressBanner({ onStart }: { onStart: () => void }) {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.1] });

  return (
    <View
      testID="stress-banner"
      style={{
        backgroundColor: colors.dangerSoft,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.danger + "55",
        padding: spacing.lg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Animated.View
            style={{
              position: "absolute",
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.danger,
              opacity,
              transform: [{ scale }],
            }}
          />
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.danger,
            }}
          >
            <Ionicons name="pulse" size={18} color="#fff" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }}>
            Acute Stress Interdiction
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.regular,
              fontSize: fontSize.sm,
              marginTop: 2,
            }}
          >
            Sedentary sympathetic spike detected. Down-regulate before dosing.
          </Text>
        </View>
      </View>

      <Pressable
        testID="start-breath-pacer"
        onPress={onStart}
        style={({ pressed }) => ({
          marginTop: spacing.md,
          backgroundColor: colors.danger,
          borderRadius: radius.md,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="leaf" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontFamily: font.semibold, fontSize: fontSize.base }}>
          Start 2-min Cyclic Sighing
        </Text>
      </Pressable>
    </View>
  );
}
