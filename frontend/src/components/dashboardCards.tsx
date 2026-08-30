import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { BloodMarker, Guardrail, ProtocolMode } from "@/src/types";
import { tap } from "@/src/utils/haptics";

const MODES: { value: ProtocolMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] =
  [
    { value: "auto", label: "Auto", icon: "flash" },
    { value: "travel", label: "Travel", icon: "airplane" },
    { value: "illness", label: "Illness", icon: "medkit" },
    { value: "deload", label: "Deload", icon: "bed" },
  ];

export function ModeSelector() {
  const { colors, font, fontSize, radius } = useTheme();
  const mode = useStore((s) => s.settings.mode);
  const setMode = useStore((s) => s.setMode);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, alignItems: "center" }}
    >
      {MODES.map((m) => {
        const active = mode === m.value;
        return (
          <Pressable
            key={m.value}
            testID={`mode-${m.value}`}
            onPress={() => {
              tap();
              setMode(m.value);
            }}
            style={{
              height: 36,
              flexShrink: 0,
              paddingHorizontal: 14,
              borderRadius: radius.pill,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: active ? colors.accent : colors.surfaceTertiary,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: active ? colors.accent : colors.border,
            }}
          >
            <Ionicons
              name={m.icon}
              size={14}
              color={active ? colors.onBrand : colors.textMuted}
            />
            <Text
              style={{
                color: active ? colors.onBrand : colors.textMuted,
                fontFamily: font.medium,
                fontSize: fontSize.sm,
              }}
            >
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function StreakCard({
  streak,
  best,
  todayComplete,
}: {
  streak: number;
  best: number;
  todayComplete: boolean;
}) {
  const { colors, font, fontSize, spacing } = useTheme();
  return (
    <Card testID="streak-card">
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: colors.warningSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="flame" size={24} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text
              testID="streak-count"
              style={{ color: colors.text, fontFamily: font.monoMed, fontSize: fontSize.xxl }}
            >
              {streak}
            </Text>
            <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.base }}>
              day streak
            </Text>
          </View>
          <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.xs, marginTop: 1 }}>
            Best {best} · {todayComplete ? "Logged today" : "Log your stack to extend"}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: todayComplete ? colors.brandSoft : colors.surfaceTertiary,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Ionicons
            name={todayComplete ? "checkmark-circle" : "time-outline"}
            size={13}
            color={todayComplete ? colors.brand : colors.textMuted}
          />
          <Text
            style={{
              color: todayComplete ? colors.brand : colors.textMuted,
              fontFamily: font.medium,
              fontSize: fontSize.xs,
            }}
          >
            {todayComplete ? "Complete" : "Pending"}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export function GuardrailCard({ warnings }: { warnings: Guardrail[] }) {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  if (warnings.length === 0) return null;
  return (
    <View
      testID="guardrail-card"
      style={{
        backgroundColor: colors.warningSoft,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.warning + "55",
        padding: spacing.lg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm }}>
        <Ionicons name="shield-half" size={16} color={colors.warning} />
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }}>
          Interaction Guardrails
        </Text>
      </View>
      {warnings.map((w, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8, marginTop: i === 0 ? 0 : 6 }}>
          <Ionicons
            name={w.severity === "danger" ? "alert-circle" : "warning"}
            size={14}
            color={w.severity === "danger" ? colors.danger : colors.warning}
            style={{ marginTop: 2 }}
          />
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.regular,
              fontSize: fontSize.sm,
              lineHeight: 19,
              flex: 1,
            }}
          >
            {w.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

export interface LowStockEntry {
  id: string;
  name: string;
  left: string;
  url: string;
  merchant: string;
}

export function LowStockCard({
  items,
  onReorder,
}: {
  items: LowStockEntry[];
  onReorder: (url: string, merchant: string) => void;
}) {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  if (items.length === 0) return null;
  return (
    <Card testID="low-stock-card">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.md }}>
        <Ionicons name="alert" size={16} color={colors.warning} />
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md }}>
          Running Low — Reorder
        </Text>
      </View>
      {items.map((it, i) => (
        <View
          key={it.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: i === 0 ? 0 : spacing.sm,
            marginTop: i === 0 ? 0 : spacing.sm,
            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.base }} numberOfLines={1}>
              {it.name}
            </Text>
            <Text style={{ color: colors.warning, fontFamily: font.mono, fontSize: fontSize.xs, marginTop: 1 }}>
              {it.left}
            </Text>
          </View>
          <Pressable
            testID={`reorder-${it.id}`}
            onPress={() => {
              tap();
              onReorder(it.url, it.merchant);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.surfaceTertiary,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="cart" size={14} color={colors.brand} />
            <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm }}>
              {it.merchant}
            </Text>
          </Pressable>
        </View>
      ))}
    </Card>
  );
}

export function BloodworkCard({
  markers,
  onClear,
}: {
  markers: BloodMarker[];
  onClear: () => void;
}) {
  const { colors, font, fontSize, spacing } = useTheme();
  if (markers.length === 0) return null;

  const statusColor = (s: BloodMarker["status"]) =>
    s === "low" ? colors.warning : s === "high" ? colors.danger : colors.textMuted;

  return (
    <Card testID="bloodwork-card">
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.md }}>
        <Ionicons name="water" size={16} color={colors.danger} />
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.md, marginLeft: 8, flex: 1 }}>
          Bloodwork Signals
        </Text>
        <Pressable testID="clear-bloodwork" onPress={onClear} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textFaint} />
        </Pressable>
      </View>
      {markers.map((m, i) => (
        <View
          key={m.name + i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 6,
            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontFamily: font.regular, fontSize: fontSize.sm, flex: 1 }} numberOfLines={1}>
            {m.name}
          </Text>
          <Text style={{ color: colors.textMuted, fontFamily: font.mono, fontSize: fontSize.sm, marginRight: 10 }}>
            {m.value}
            {m.unit ? ` ${m.unit}` : ""}
          </Text>
          <View
            style={{
              backgroundColor: statusColor(m.status) + "22",
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: statusColor(m.status), fontFamily: font.medium, fontSize: fontSize.xs }}>
              {m.status === "low" ? "Low" : m.status === "high" ? "High" : "Normal"}
            </Text>
          </View>
        </View>
      ))}
      <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.xs, marginTop: spacing.sm }}>
        Low markers are auto-flowing into today's protocol.
      </Text>
    </Card>
  );
}
