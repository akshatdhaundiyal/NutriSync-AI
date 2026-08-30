import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChronoCard } from "@/src/components/ChronoCard";
import { DeltaTag } from "@/src/components/DeltaTag";
import { ReadinessRing } from "@/src/components/ReadinessRing";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { StressBanner } from "@/src/components/StressBanner";
import { useToast } from "@/src/components/ToastProvider";
import { AppButton, Card, Pill, SectionTitle } from "@/src/components/ui";
import { PROVIDER_LABEL } from "@/src/services/ai";
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
  const provider = useStore((s) => s.settings.aiProvider);
  const reanalyze = useStore((s) => s.reanalyze);
  const toggleIntake = useStore((s) => s.toggleIntake);

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader
        title="Today"
        subtitle={dateLabel()}
        right={
          <Pill
            label={PROVIDER_LABEL[provider].split(" (")[0]}
            color={colors.accent}
            bg={colors.accentSoft}
            icon="hardware-chip"
          />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxxl + insets.bottom,
        }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card style={{ alignItems: "center" }}>
            <ReadinessRing score={readiness.score} state={readiness.state} />
            <View
              style={{
                flexDirection: "row",
                gap: spacing.sm,
                marginTop: spacing.lg,
                alignSelf: "stretch",
              }}
            >
              <DeltaTag
                label="Deep Sleep"
                value={fmtSleep(today.deepSleepMin)}
                delta={readiness.deepSleepDelta}
              />
              <DeltaTag
                label="HRV"
                value={`${today.hrvMs}ms`}
                delta={readiness.hrvDelta}
              />
              <DeltaTag
                label="Active Strain"
                value={`${today.strain}`}
                delta={readiness.strainDelta}
                goodWhenPositive={false}
              />
            </View>
          </Card>
        </Animated.View>

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

        <SectionTitle
          title="Today's Chrono-Stack"
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
          protocol.items.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(60 * idx).duration(400)}
              style={{ marginBottom: spacing.md }}
            >
              <ChronoCard
                item={item}
                taken={isTaken(item.slot, item.canonical)}
                onToggle={() => {
                  isTaken(item.slot, item.canonical) ? tap() : success();
                  toggleIntake(item.slot, item.canonical);
                }}
                onBuy={(url, merchant) => {
                  tap();
                  WebBrowser.openBrowserAsync(url);
                  toast.show(`Opening ${merchant}…`, "info");
                }}
              />
            </Animated.View>
          ))
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
