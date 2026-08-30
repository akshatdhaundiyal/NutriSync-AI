import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QualityBadge } from "@/src/components/QualityBadge";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useToast } from "@/src/components/ToastProvider";
import { Chip, ChipRow } from "@/src/components/ui";
import { COMPOUNDS } from "@/src/data/compounds";
import { buyOptions } from "@/src/services/procurement";
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
  const protocol = useStore((s) => s.protocol);
  const region = useStore((s) => s.settings.region);
  const adjustStock = useStore((s) => s.adjustStock);
  const removeStashItem = useStore((s) => s.removeStashItem);

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
    "vitamin-d3": "sunny",
    omega3: "water",
    creatine: "flash",
    magnesium: "moon",
    "l-theanine": "leaf",
    ashwagandha: "leaf",
    zinc: "shield-half",
    iron: "magnet",
    "vitamin-b12": "flash",
    "vitamin-c": "nutrition",
    glycine: "flask",
    apigenin: "moon",
    electrolytes: "flask",
  };
  const iconFor = (c: string) => ICON[c] ?? "medical";

  const active = stash.filter((s) => !s.deletedAt);
  const isLow = (i: StashItem) =>
    i.stockUnits <= Math.max(10, Math.round(i.unitsPerContainer * 0.15));

  const q = query.trim().toLowerCase();
  const filtered = active.filter((i) => {
    const matchesQ =
      !q || `${i.brand} ${i.name} ${i.chemicalForm}`.toLowerCase().includes(q);
    const matchesF =
      filter === "optimal"
        ? i.quality === "optimal"
        : filter === "low"
          ? i.quality === "low"
          : filter === "running_low"
            ? isLow(i)
            : true;
    return matchesQ && matchesF;
  });

  const missing = protocol?.items.find((i) => !i.inStash) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader
        title="Cabinet Stash"
        subtitle={`${active.length} supplements on shelf`}
      />

      {/* search + scan row */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          marginTop: spacing.xs,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            backgroundColor: colors.surface,
            borderRadius: radius.pill,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
            height: 48,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            testID="stash-search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search your cabinet"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, color: colors.text, fontFamily: font.regular, fontSize: fontSize.base }}
          />
          {query.length > 0 ? (
            <Pressable testID="stash-search-clear" hitSlop={8} onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          testID="stash-scan"
          onPress={() => {
            tap();
            router.push("/scan");
          }}
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.lg,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.brand,
            shadowColor: colors.glowShadow,
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <Ionicons name="scan" size={22} color={colors.onBrand} />
        </Pressable>
      </View>

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
          paddingBottom: spacing.xxxl + insets.bottom + 24,
        }}
      >
        {missing ? (
          <Animated.View
            entering={FadeInDown.duration(350)}
            testID="missing-item-card"
            style={{
              backgroundColor: colors.secondaryFixed,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: colors.onSecondaryFixed + "22",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add-circle" size={24} color={colors.onSecondaryFixed} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: colors.onSecondaryFixed, fontFamily: font.medium, fontSize: fontSize.xs, letterSpacing: 0.5 }}
              >
                RECOMMENDED · NOT IN CABINET
              </Text>
              <Text
                style={{ color: colors.onSecondaryFixed, fontFamily: font.semibold, fontSize: fontSize.lg, marginTop: 2 }}
              >
                {COMPOUNDS[missing.canonical]?.label ?? missing.compound}
              </Text>
            </View>
            <Pressable
              testID="missing-item-buy"
              onPress={() => {
                tap();
                const opt =
                  missing.buyOptions?.[0] ??
                  buyOptions(
                    COMPOUNDS[missing.canonical]?.label ?? missing.compound,
                    missing.chemicalForm,
                    region,
                  )[0];
                WebBrowser.openBrowserAsync(opt.url);
                toast.show(`Opening ${opt.merchant}…`, "info");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.onSecondaryFixed,
                borderRadius: radius.pill,
                paddingHorizontal: 14,
                paddingVertical: 9,
              }}
            >
              <Ionicons name="cart" size={14} color={colors.secondaryFixed} />
              <Text style={{ color: colors.secondaryFixed, fontFamily: font.semibold, fontSize: fontSize.sm }}>
                Buy
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}

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
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: colors.brandSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={iconFor(item.canonical)} size={22} color={colors.brand} />
                </View>
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
