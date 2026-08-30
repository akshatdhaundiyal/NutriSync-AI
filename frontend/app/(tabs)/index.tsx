import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChronoTimeline } from "@/src/components/ChronoTimeline";
import { ReadinessRing } from "@/src/components/ReadinessRing";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { StressBanner } from "@/src/components/StressBanner";
import { useToast } from "@/src/components/ToastProvider";
import { AppButton, Card, Pill, SectionTitle } from "@/src/components/ui";
import {
  BloodworkCard,
  GuardrailCard,
  LowStockCard,
  LowStockEntry,
  ModeSelector,
  StreakCard,
} from "@/src/components/dashboardCards";
import { COMPOUNDS } from "@/src/data/compounds";
import { computeBestStreak, computeStreak, isLowStock } from "@/src/services/adherence";
import { computeGuardrails } from "@/src/services/guardrails";
import { buyOptions } from "@/src/services/procurement";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { impact, success, tap } from "@/src/utils/haptics";

function fmtSleep(m: number): string {
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardScreen() {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();

  const hydrated = useStore((s) => s.hydrated);
  const protocol = useStore((s) => s.protocol);
  const readiness = useStore((s) => s.readiness);
  const telemetry = useStore((s) => s.telemetry);
  const intake = useStore((s) => s.intake);
  const generating = useStore((s) => s.generating);
  const reanalyze = useStore((s) => s.reanalyze);
  const toggleIntake = useStore((s) => s.toggleIntake);
  const stash = useStore((s) => s.stash);
  const adherenceDates = useStore((s) => s.adherenceDates);
  const bloodMarkers = useStore((s) => s.bloodMarkers);
  const region = useStore((s) => s.settings.region);
  const clearBloodMarkers = useStore((s) => s.clearBloodMarkers);

  const today = telemetry[telemetry.length - 1];

  const isTaken = (slot: string, canonical: string) =>
    intake.find((i) => i.id === `${todayKey()}:${slot}:${canonical}`)?.taken ??
    false;

  if (!hydrated || !protocol || !readiness || !today) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ActivityIndicator color={colors.brand} />
        <Text style={{ color: colors.textMuted, fontFamily: font.medium }}>
          Computing your biometric protocol…
        </Text>
      </View>
    );
  }

  const activeCount = protocol.items.length;
  const guardrails = computeGuardrails(protocol.items);
  const streak = computeStreak(adherenceDates, todayKey());
  const best = computeBestStreak(adherenceDates);
  const todayComplete = adherenceDates.includes(todayKey());
  const lowEntries: LowStockEntry[] = stash
    .filter((s) => !s.deletedAt && isLowStock(s))
    .map((s) => {
      const label = COMPOUNDS[s.canonical]?.label ?? s.name;
      const opt = buyOptions(label, s.chemicalForm, region)[0];
      return {
        id: s.id,
        name: `${s.brand} ${s.name}`,
        left: `${s.stockUnits} ${s.unit}s left`,
        url: opt.url,
        merchant: opt.merchant,
      };
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerMargin,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxxl * 2 + insets.bottom,
          gap: spacing.sectionMargin,
        }}
      >
        {/* Section 1: Hero Readiness Ring & Stitch Health Metric Pills */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <ReadinessRing score={readiness.score} state={readiness.state} />

          {/* Stitch Health Metric Pills */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing.innerGap,
              marginTop: spacing.xl,
              justifyContent: "center",
            }}
          >
            {/* Deep Sleep Pill */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.secondaryFixed,
                borderRadius: radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
              }}
            >
              <Ionicons name="bed" size={14} color={colors.onSecondaryFixed} />
              <Text
                style={{
                  color: colors.onSecondaryFixed,
                  fontFamily: font.medium,
                  fontSize: fontSize.labelSm,
                }}
              >
                Deep Sleep: {fmtSleep(today.deepSleepMin)} ({readiness.deepSleepDelta > 0 ? "+" : ""}{readiness.deepSleepDelta}%)
              </Text>
            </View>

            {/* HRV Pill */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: readiness.hrvDelta < 0 ? colors.errorContainer : colors.primaryContainer,
                borderRadius: radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
              }}
            >
              <Ionicons
                name="pulse"
                size={14}
                color={readiness.hrvDelta < 0 ? colors.onErrorContainer : colors.onPrimaryContainer}
              />
              <Text
                style={{
                  color: readiness.hrvDelta < 0 ? colors.onErrorContainer : colors.onPrimaryContainer,
                  fontFamily: font.medium,
                  fontSize: fontSize.labelSm,
                }}
              >
                HRV: {today.hrvMs}ms ({readiness.hrvDelta > 0 ? "+" : ""}{readiness.hrvDelta}%)
              </Text>
            </View>

            {/* Daily Strain Pill */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
              }}
            >
              <Ionicons name="flame" size={14} color={colors.brand} />
              <Text
                style={{
                  color: colors.text,
                  fontFamily: font.medium,
                  fontSize: fontSize.labelSm,
                }}
              >
                Strain: {today.strain}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Section 2: Mode Selector */}
        <View style={{ gap: spacing.xs }}>
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.heading,
              fontSize: fontSize.labelSm,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Protocol Context Mode
          </Text>
          <ModeSelector />
        </View>

        {/* Section 3: Adherence Streak */}
        <StreakCard streak={streak} best={best} todayComplete={todayComplete} />

        {/* Section 4: Stress Anomaly Banner */}
        {readiness.state === "stress" ? (
          <Animated.View entering={FadeInDown.delay(100).duration(350)}>
            <StressBanner
              onStart={() => {
                impact();
                router.push("/breath");
              }}
            />
          </Animated.View>
        ) : null}

        {/* Section 5: Guardrails, Low Stock & Bloodwork */}
        {guardrails.length > 0 ? <GuardrailCard warnings={guardrails} /> : null}
        {lowEntries.length > 0 ? (
          <LowStockCard
            items={lowEntries}
            onReorder={(url, m) => {
              WebBrowser.openBrowserAsync(url);
              toast.show(`Opening ${m}…`, "info");
            }}
          />
        ) : null}
        {bloodMarkers.length > 0 ? (
          <BloodworkCard
            markers={bloodMarkers}
            onClear={() => {
              clearBloodMarkers();
              toast.show("Bloodwork cleared", "info");
            }}
          />
        ) : null}

        {/* Section 6: Today's Chrono-Protocol Timeline */}
        <View style={{ gap: spacing.stackGap }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontFamily: font.heading,
                fontSize: fontSize.headlineMd,
                fontWeight: "700",
              }}
            >
              Today's Chrono-Protocol
            </Text>
            <View
              style={{
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "40",
              }}
            >
              <Text
                style={{
                  color: colors.textMuted,
                  fontFamily: font.semibold,
                  fontSize: fontSize.labelSm,
                }}
              >
                {activeCount}/3 active
              </Text>
            </View>
          </View>

          {protocol.zeroPill ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View
                testID="zero-pill-card"
                style={{
                  backgroundColor: colors.surfaceContainerLowest,
                  borderRadius: radius.lg,
                  padding: spacing.cardPadding,
                  alignItems: "center",
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.outlineVariant + "40",
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.primaryContainer,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="leaf" size={26} color={colors.onPrimaryContainer} />
                </View>
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: font.heading,
                    fontSize: fontSize.bodyLg,
                    fontWeight: "700",
                    marginTop: spacing.md,
                    textAlign: "center",
                  }}
                >
                  System Balanced — Whole Food Focus
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontFamily: font.regular,
                    fontSize: fontSize.sm,
                    lineHeight: 20,
                    textAlign: "center",
                    marginTop: spacing.sm,
                  }}
                >
                  {protocol.wholeFoodNote}
                </Text>
              </View>
            </Animated.View>
          ) : (
            <ChronoTimeline
              items={protocol.items}
              isTaken={isTaken}
              onToggle={(item) => {
                if (isTaken(item.slot, item.canonical)) tap();
                else success();
                toggleIntake(item.slot, item.canonical);
              }}
              onBuy={(url, merchant) => {
                tap();
                WebBrowser.openBrowserAsync(url);
                toast.show(`Opening ${merchant}…`, "info");
              }}
            />
          )}
        </View>

        {/* Section 7: Sync & Re-Analyze Action */}
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <AppButton
            testID="sync-reanalyze"
            label="Sync & Re-Analyze"
            icon="sync"
            loading={generating}
            onPress={async () => {
              tap();
              await reanalyze();
              success();
              toast.show("Protocol re-analyzed");
            }}
          />
          <Text
            style={{
              color: colors.textFaint,
              fontFamily: font.regular,
              fontSize: fontSize.xs,
              textAlign: "center",
            }}
          >
            Generated on-device · {protocol.generatedBy}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
