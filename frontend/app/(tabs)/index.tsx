import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
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
  const { colors, font, fontSize, spacing } = useTheme();
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
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        <ScreenHeader title="Today" subtitle={dateLabel()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <ActivityIndicator color={colors.brand} />
          <Text style={{ color: colors.textMuted, fontFamily: font.medium }}>
            Computing your biometric protocol…
          </Text>
        </View>
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
      <ScreenHeader
        title="Today"
        subtitle={dateLabel()}
        right={
          <Pressable
            testID="header-sync"
            onPress={async () => {
              tap();
              await reanalyze();
              toast.show("Protocol re-analyzed");
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surfaceTertiary,
            }}
          >
            <Ionicons name="sync" size={18} color={colors.brand} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxxl * 2 + insets.bottom,
        }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card style={{ alignItems: "center" }}>
            <ReadinessRing score={readiness.score} state={readiness.state} />
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.sm,
                marginTop: spacing.lg,
                justifyContent: "center",
              }}
            >
              <Pill
                icon="moon"
                label={`Deep Sleep ${fmtSleep(today.deepSleepMin)} (${readiness.deepSleepDelta > 0 ? "+" : ""}${readiness.deepSleepDelta}%)`}
                color={colors.onSecondaryFixed}
                bg={colors.secondaryFixed}
              />
              <Pill
                icon="heart"
                label={`HRV ${today.hrvMs}ms (${readiness.hrvDelta > 0 ? "+" : ""}${readiness.hrvDelta}%)`}
                color={readiness.hrvDelta < 0 ? colors.onErrorContainer : colors.brand}
                bg={readiness.hrvDelta < 0 ? colors.errorContainer : colors.brandSoft}
              />
              <Pill
                icon="flame"
                label={`Strain ${today.strain}`}
                color={colors.brand}
                bg={colors.brandSoft}
              />
            </View>
          </Card>
        </Animated.View>

        <View style={{ marginTop: spacing.lg }}>
          <ModeSelector />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <StreakCard streak={streak} best={best} todayComplete={todayComplete} />
        </View>

        {readiness.state === "stress" ? (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={{ marginTop: spacing.lg }}
          >
            <StressBanner
              onStart={() => {
                impact();
                router.push("/breath");
              }}
            />
          </Animated.View>
        ) : null}

        {guardrails.length > 0 ? (
          <View style={{ marginTop: spacing.lg }}>
            <GuardrailCard warnings={guardrails} />
          </View>
        ) : null}

        {lowEntries.length > 0 ? (
          <View style={{ marginTop: spacing.lg }}>
            <LowStockCard
              items={lowEntries}
              onReorder={(url, m) => {
                WebBrowser.openBrowserAsync(url);
                toast.show(`Opening ${m}…`, "info");
              }}
            />
          </View>
        ) : null}

        {bloodMarkers.length > 0 ? (
          <View style={{ marginTop: spacing.lg }}>
            <BloodworkCard
              markers={bloodMarkers}
              onClear={() => {
                clearBloodMarkers();
                toast.show("Bloodwork cleared", "info");
              }}
            />
          </View>
        ) : null}

        <SectionTitle
          title="Today's Chrono-Protocol"
          right={
            <Pill
              label={`${activeCount}/3 active`}
              color={colors.textMuted}
              bg={colors.surfaceTertiary}
              icon="shield-checkmark"
            />
          }
        />

        {protocol.zeroPill ? (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card testID="zero-pill-card" style={{ alignItems: "center", paddingVertical: spacing.xl }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.brandSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="leaf" size={28} color={colors.brand} />
              </View>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: font.semibold,
                  fontSize: fontSize.lg,
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
            </Card>
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

        <View style={{ marginTop: spacing.md }}>
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
        </View>

        <Text
          style={{
            color: colors.textFaint,
            fontFamily: font.regular,
            fontSize: fontSize.xs,
            textAlign: "center",
            marginTop: spacing.md,
          }}
        >
          Generated on-device · {protocol.generatedBy}
        </Text>
      </ScrollView>
    </View>
  );
}
