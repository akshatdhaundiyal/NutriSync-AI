import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QualityBadge } from "@/src/components/QualityBadge";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useToast } from "@/src/components/ToastProvider";
import { Chip, ChipRow } from "@/src/components/ui";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { DoseUnit, StashItem } from "@/src/types";
import { tap } from "@/src/utils/haptics";

function doseLabel(u: DoseUnit): string {
  if (u === "IU") return " IU";
  if (u === "serving") return " serving";
  return u;
}

const FILTERS = [
  { value: "all", label: "All", icon: "apps" as const },
  { value: "optimal", label: "Optimal", icon: "shield-checkmark" as const },
  { value: "low", label: "Low Bioavail.", icon: "warning" as const },
  { value: "running_low", label: "Running Low", icon: "trending-down" as const },
];

export default function StashScreen() {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();

  const stash = useStore((s) => s.stash);
  const adjustStock = useStore((s) => s.adjustStock);
  const removeStashItem = useStore((s) => s.removeStashItem);

  const [filter, setFilter] = useState("all");

  const active = stash.filter((s) => !s.deletedAt);
  const isLow = (i: StashItem) =>
    i.stockUnits <= Math.max(10, Math.round(i.unitsPerContainer * 0.15));

  const filtered = active.filter((i) => {
    if (filter === "optimal") return i.quality === "optimal";
    if (filter === "low") return i.quality === "low";
    if (filter === "running_low") return isLow(i);
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader
        title="Cabinet Stash"
        subtitle={`${active.length} supplements on shelf`}
      />
      <ChipRow testID="stash-filter-row">
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            testID={`filter-${f.value}`}
            label={f.label}
            icon={f.icon}
            active={filter === f.value}
            onPress={() => {
              tap();
              setFilter(f.value);
            }}
          />
        ))}
      </ChipRow>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxxl + insets.bottom + 60,
        }}
      >
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: spacing.xxxl, gap: spacing.md }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: colors.surfaceTertiary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="cube-outline" size={40} color={colors.textFaint} />
            </View>
            <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>
              {active.length === 0 ? "Your cabinet is empty" : "No matches"}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontFamily: font.regular,
                fontSize: fontSize.sm,
                textAlign: "center",
                maxWidth: 260,
              }}
            >
              {active.length === 0
                ? "Add or scan a supplement bottle to unlock product-specific dosing."
                : "Try a different filter to see your shelf."}
            </Text>
          </View>
        ) : (
          filtered.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(40 * idx).duration(350)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
                padding: spacing.lg,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.xs }}>
                    {item.brand}
                  </Text>
                  <Text
                    style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg, marginTop: 1 }}
                  >
                    {item.name}
                  </Text>
                </View>
                <Pressable
                  testID={`delete-${item.id}`}
                  hitSlop={8}
                  onPress={() => {
                    tap();
                    removeStashItem(item.id);
                    toast.show(`${item.name} removed`, "info");
                  }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
                </Pressable>
              </View>

              <View style={{ marginTop: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <QualityBadge quality={item.quality} form={item.chemicalForm} />
                <Text style={{ color: colors.brand, fontFamily: font.monoMed, fontSize: fontSize.sm }}>
                  {item.dosePerUnit}
                  {doseLabel(item.doseUnit)} / {item.unit}
                </Text>
              </View>

              {/* stock progress */}
              <View
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.surfaceTertiary,
                  marginTop: spacing.md,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: `${Math.min(100, (item.stockUnits / item.unitsPerContainer) * 100)}%`,
                    backgroundColor: isLow(item) ? colors.warning : colors.brand,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: spacing.md,
                }}
              >
                <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm }}>
                  <Text style={{ fontFamily: font.monoMed, color: colors.text }}>{item.stockUnits}</Text> of{" "}
                  {item.unitsPerContainer} {item.unit}s left
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Stepper
                    icon="remove"
                    testID={`stock-minus-${item.id}`}
                    onPress={() => {
                      tap();
                      adjustStock(item.id, -1);
                    }}
                  />
                  <Stepper
                    icon="add"
                    testID={`stock-plus-${item.id}`}
                    onPress={() => {
                      tap();
                      adjustStock(item.id, 1);
                    }}
                  />
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Floating add / scan */}
      <Pressable
        testID="stash-fab"
        onPress={() => {
          tap();
          router.push("/scan");
        }}
        style={{
          position: "absolute",
          right: spacing.lg,
          bottom: insets.bottom + spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.brand,
          borderRadius: radius.pill,
          paddingHorizontal: 18,
          paddingVertical: 14,
          shadowColor: colors.glowShadow,
          shadowOpacity: 0.4,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="scan" size={18} color={colors.onBrand} />
        <Text style={{ color: colors.onBrand, fontFamily: font.semibold, fontSize: fontSize.base }}>
          Add / Scan
        </Text>
      </Pressable>
    </View>
  );
}

function Stepper({
  icon,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceTertiary,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}
