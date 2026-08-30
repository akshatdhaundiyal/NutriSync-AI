import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LineChart } from "@/src/components/LineChart";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { Segmented } from "@/src/components/ui";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

export default function TrendsScreen() {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  const telemetry = useStore((s) => s.telemetry);
  const baselines = useStore((s) => s.baselines);

  const [metric, setMetric] = useState<"deep" | "hrv" | "steps">("deep");

  const valueFor = (t: (typeof telemetry)[number]) =>
    metric === "deep" ? t.deepSleepMin : metric === "hrv" ? t.hrvMs : t.steps;
  const data = telemetry.map(valueFor);
  const markers = telemetry.map((t) => !!t.intake);
  const color = metric === "deep" ? colors.brand : metric === "hrv" ? colors.accent : colors.tertiary;
  const unit = metric === "deep" ? "m" : metric === "hrv" ? "ms" : "";
  const formatValue = (value: number) =>
    metric === "steps" ? Math.round(value).toLocaleString() : `${Math.round(value)}${unit}`;

  const width = Dimensions.get("window").width - spacing.containerMargin * 2 - spacing.cardPadding * 2;
  const current = data[data.length - 1] ?? 0;
  const avg = data.length ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;
  const delta = avg ? Math.round(((current - avg) / avg) * 100) : 0;

  // N=1 correlation: metric on intake days vs non-intake days
  const on = telemetry.filter((t) => t.intake).map(valueFor);
  const off = telemetry.filter((t) => !t.intake).map(valueFor);
  const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const lift = Math.round(mean(on) - mean(off));

  const metricName = metric === "deep" ? "Deep Sleep" : metric === "hrv" ? "HRV" : "Steps";

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerMargin,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxxl * 2 + insets.bottom,
          gap: spacing.stackGap,
        }}
      >
        <Segmented
          testID="metric-segmented"
          value={metric}
          onChange={(v) => {
            tap();
            setMetric(v as "deep" | "hrv" | "steps");
          }}
          options={[
            { label: "Deep Sleep", value: "deep", icon: "moon" },
            { label: "HRV", value: "hrv", icon: "pulse" },
            { label: "Steps", value: "steps", icon: "walk" },
          ]}
        />

        {/* 14-Day Dual Metric Chart Card */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: radius.DEFAULT,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.outlineVariant + "50",
              padding: spacing.cardPadding,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
              <StatBlock label="Today" value={formatValue(current)} color={colors.text} />
              <StatBlock label="14-day avg" value={formatValue(avg)} color={colors.textMuted} />
              <StatBlock
                label="vs avg"
                value={`${delta > 0 ? "+" : ""}${delta}%`}
                color={delta >= 0 ? colors.brand : colors.warning}
              />
            </View>
            <LineChart width={width} data={data} markers={markers} color={color} unit={unit} formatValue={formatValue} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
              <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
                Filled markers = days protocol was consumed
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Efficacy Insight Section */}
        <Text
          style={{
            color: colors.text,
            fontFamily: font.heading,
            fontSize: fontSize.headlineMd,
            fontWeight: "700",
          }}
        >
          Efficacy Insight
        </Text>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: radius.DEFAULT,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.outlineVariant + "50",
              padding: spacing.cardPadding,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.primaryContainer,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="sparkles" size={22} color={colors.onPrimaryContainer} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: font.heading, fontSize: fontSize.bodyLg, fontWeight: "700" }}>
                  {lift > 0
                    ? `+${formatValue(Math.abs(lift))} ${metricName} on stack days`
                    : `${metricName} steady across the window`}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontFamily: font.regular,
                    fontSize: fontSize.bodyMd,
                    lineHeight: 22,
                    marginTop: 4,
                  }}
                >
                  {lift > 0
                    ? `On days you logged your protocol, ${metricName.toLowerCase()} averaged ${formatValue(Math.abs(lift))} higher than unsupplemented days.`
                    : `Not enough separation yet — keep logging intake to sharpen your personal N=1 correlation.`}
                </Text>
                {baselines ? (
                  <View
                    style={{
                      marginTop: spacing.md,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: radius.sm,
                      backgroundColor: colors.surfaceContainerLow,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.outlineVariant + "40",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontFamily: font.mono,
                        fontSize: fontSize.xs,
                      }}
                    >
                      7-day baseline · sleep {baselines.deepSleepMin}m · HRV {baselines.hrvMs}ms · RHR {baselines.restingHr}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const { colors, font, fontSize } = useTheme();
  return (
    <View>
      <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.labelSm }}>
        {label}
      </Text>
      <Text style={{ color, fontFamily: font.monoMed, fontSize: fontSize.xl, marginTop: 2, fontWeight: "700" }}>
        {value}
      </Text>
    </View>
  );
}
