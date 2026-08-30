import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { ReadinessState } from "@/src/types";
import { useTheme } from "@/src/theme/useTheme";

const STATE_LABEL: Record<ReadinessState, string> = {
  optimal: "OPTIMAL",
  balanced: "BALANCED",
  recovery: "RECOVERY",
  stress: "STRESS LOAD",
};

export function ReadinessRing({
  score,
  state,
  size = 192,
}: {
  score: number;
  state: ReadinessState;
  size?: number;
}) {
  const { colors, font, fontSize } = useTheme();
  const stroke = 8;
  const r = 40; // SVG viewBox coordinate radius (100x100 space)
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r; // ~251.3
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);

  const ringColor =
    state === "stress"
      ? colors.danger
      : state === "recovery"
        ? colors.warning
        : state === "balanced"
          ? colors.accent
          : colors.brand;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={styles.svg}>
        {/* Background Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.primaryFixed}
          strokeWidth={stroke}
          strokeOpacity={0.25}
          fill="transparent"
        />
        {/* Active Progress */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="transparent"
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: font.medium,
            fontSize: fontSize.labelMd,
            marginBottom: 2,
          }}
        >
          Readiness
        </Text>
        <Text
          testID="readiness-score"
          style={{
            color: colors.text,
            fontFamily: font.display,
            fontSize: fontSize.displayMetric,
            fontWeight: "700",
            lineHeight: 52,
            letterSpacing: -1,
          }}
        >
          {clamped}
        </Text>
        <View
          style={{
            marginTop: 4,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 9999,
            backgroundColor: ringColor + "1A",
          }}
        >
          <Text
            style={{
              color: ringColor,
              fontFamily: font.semibold,
              fontSize: 11,
              letterSpacing: 0.8,
            }}
          >
            {STATE_LABEL[state]}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", position: "relative" },
  svg: { position: "absolute", top: 0, left: 0 },
  center: { alignItems: "center", justifyContent: "center" },
});
