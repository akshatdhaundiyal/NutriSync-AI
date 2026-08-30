import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LineChart } from "@/src/components/LineChart";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { Card, SectionTitle, Segmented } from "@/src/components/ui";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

export default function TrendsScreen() {
  const { colors, font, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const telemetry = useStore((s) => s.telemetry);
  const baselines = useStore((s) => s.baselines);

  const [metric, setMetric] = useState<"deep" | "hrv">("deep");

  const data = telemetry.map((t) => (metric === "deep" ? t.deepSleepMin : t.hrvMs));
  const markers = telemetry.map((t) => !!t.intake);
  const color = metric === "deep" ? colors.brand : colors.accent;
  const unit = metric === "deep" ? "m" : "ms";

  const width = Dimensions.get("window").width - spacing.lg * 2 - spacing.lg * 2;
  const current = data[data.length - 1] ?? 0;
  const avg = data.length ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;
  const delta = avg ? Math.round(((current - avg) / avg) * 100) : 0;

  // N=1 correlation: metric on intake days vs non-intake days
  const on = telemetry.filter((t) => t.intake).map((t) => (metric === "deep" ? t.deepSleepMin : t.hrvMs));
  const off = telemetry.filter((t) => !t.intake).map((t) => (metric === "deep" ? t.deepSleepMin : t.hrvMs));
  const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const lift = Math.round(mean(on) - mean(off));

  const metricName = metric === "deep" ? "Deep Sleep" : "HRV";

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader title="Trends" subtitle="N=1 · 14-day correlation" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxxl + insets.bottom,
        }}
      >
        <Segmented
          testID="metric-segmented"
          value={metric}
          onChange={(v) => {
            tap();
            setMetric(v as "deep" | "hrv");
          }}
          options={[
            { label: "Deep Sleep", value: "deep", icon: "moon" },
            { label: "HRV", value: "hrv", icon: "pulse" },
          ]}
        />

        <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: spacing.lg }}>
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
              <StatBlock label="Today" value={`${current}${unit}`} color={colors.text} />
              <StatBlock label="14-day avg" value={`${avg}${unit}`} color={colors.textMuted} />
              <StatBlock
                label="vs avg"
                value={`${delta > 0 ? "+" : ""}${delta}%`}
                color={delta >= 0 ? colors.brand : colors.warning}
              />
            </View>
            <LineChart width={width} data={data} markers={markers} color={color} unit={unit} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color }} />
              <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
                Filled dots = days you took your protocol
              </Text>
            </View>
          </Card>
        </Animated.View>

        <SectionTitle title="Efficacy Insight" />
        <Animated.View entering={FadeInDown.delay(120).duration(400)}>
          <Card>
            <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.brandSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="sparkles" size={20} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }}>
                  {lift > 0
                    ? `+${lift}${unit} ${metricName} on stack days`
                    : `${metricName} steady across the window`}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontFamily: font.regular,
                    fontSize: fontSize.sm,
                    lineHeight: 20,
                    marginTop: 4,
                  }}
                >
                  {lift > 0
                    ? `On days you logged your protocol, ${metricName.toLowerCase()} averaged ${Math.abs(lift)}${unit} higher than unsupplemented days.`
                    : `Not enough separation yet — keep logging intake to sharpen your personal correlation.`}
                </Text>
                {baselines ? (
                  <Text
                    style={{
                      color: colors.textFaint,
                      fontFamily: font.mono,
                      fontSize: fontSize.xs,
                      marginTop: spacing.sm,
                    }}
                  >
                    7-day baseline · sleep {baselines.deepSleepMin}m · HRV {baselines.hrvMs}ms · RHR{" "}
                    {baselines.restingHr}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
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
      <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.xs }}>
        {label}
      </Text>
      <Text style={{ color, fontFamily: font.monoMed, fontSize: fontSize.xl, marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}
