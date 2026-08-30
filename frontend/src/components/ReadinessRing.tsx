import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

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
  size = 224,
}: {
  score: number;
  state: ReadinessState;
  size?: number;
}) {
  const { colors, font, fontSize, name } = useTheme();
  const stroke = 18;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
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
    <View
      style={[
        styles.wrap,
        { width: size, height: size },
        name === "dark"
          ? {
              shadowColor: ringColor,
              shadowOpacity: 0.45,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 0 },
            }
          : null,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="readinessGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={ringColor} />
            <Stop offset="1" stopColor={colors.accent} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.ringTrack}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#readinessGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="none"
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          testID="readiness-score"
          style={{
            color: colors.text,
            fontFamily: font.monoMed,
            fontSize: fontSize.huge,
            lineHeight: fontSize.huge + 2,
          }}
        >
          {clamped}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: font.mono,
            fontSize: fontSize.xs,
            letterSpacing: 2,
            marginTop: 2,
          }}
        >
          READINESS
        </Text>
        <View
          style={{
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: ringColor + "22",
          }}
        >
          <Text
            style={{
              color: ringColor,
              fontFamily: font.semibold,
              fontSize: fontSize.xs,
              letterSpacing: 1.2,
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
  wrap: { alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", alignItems: "center", justifyContent: "center" },
});
