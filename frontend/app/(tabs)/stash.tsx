import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MissingCompoundCard } from "@/src/components/cabinet/MissingCompoundCard";
import { SupplementCard } from "@/src/components/cabinet/SupplementCard";
import { useToast } from "@/src/components/ToastProvider";
import { Chip, ChipRow } from "@/src/components/ui";
import { COMPOUNDS } from "@/src/data/compounds";
import { buyOptions } from "@/src/services/procurement";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { StashItem } from "@/src/types";
import { tap } from "@/src/utils/haptics";

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
  const missingOptions = missing
    ? buyOptions(COMPOUNDS[missing.canonical]?.label ?? missing.compound, missing.chemicalForm, region)
    : [];

  const handleBuy = async (url: string) => {
    tap();
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Search and Scan Header */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.innerGap,
          paddingHorizontal: spacing.containerMargin,
          marginTop: spacing.xs,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            backgroundColor: colors.surfaceContainer,
            borderRadius: radius.DEFAULT,
            paddingHorizontal: spacing.lg,
            height: 56,
          }}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            testID="stash-search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search cabinet..."
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              flex: 1,
              color: colors.text,
              fontFamily: font.regular,
              fontSize: fontSize.bodyMd,
            }}
          />
          {query.length > 0 ? (
            <Pressable testID="stash-search-clear" hitSlop={8} onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>

        {/* Square-Rounded Primary Scan Button */}
        <Pressable
          testID="stash-scan"
          onPress={() => {
            tap();
            router.push("/scan");
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.DEFAULT,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.brand,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Ionicons name="camera" size={26} color={colors.onBrand} />
        </Pressable>
      </View>

      {/* Filter Chips */}
      <View style={{ marginVertical: spacing.md, paddingHorizontal: spacing.containerMargin }}>
        <ChipRow>
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerMargin,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxxl * 2 + insets.bottom,
          gap: spacing.stackGap,
        }}
      >
        {/* Missing Recommended Item Highlight Card */}
        {missing ? (
          <MissingCompoundCard
            missing={missing}
            missingOptions={missingOptions}
            onBuy={handleBuy}
          />
        ) : null}

        {/* Shelf Supplement List */}
        {filtered.length === 0 ? (
          <View
            style={{
              paddingVertical: spacing.xxxl,
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.surfaceContainerLow,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing.xs,
              }}
            >
              <Ionicons name="archive-outline" size={28} color={colors.textMuted} />
            </View>
            <Text style={{ color: colors.text, fontFamily: font.heading, fontSize: fontSize.headlineMd, fontWeight: "700" }}>
              {active.length === 0 ? "Your cabinet is empty" : "No matches found"}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontFamily: font.regular,
                fontSize: fontSize.bodyMd,
                textAlign: "center",
                maxWidth: 280,
              }}
            >
              {active.length === 0
                ? "Scan a supplement bottle to auto-fill dosing and shelf tracking."
                : "Try searching a different keyword or resetting filters."}
            </Text>
          </View>
        ) : (
          filtered.map((item, idx) => (
            <SupplementCard
              key={item.id}
              item={item}
              index={idx}
              onAdjustStock={(id, delta) => adjustStock(id, delta)}
              onRemove={(toRemove) => {
                removeStashItem(toRemove.id);
                toast.show(`${toRemove.name} removed`, "info");
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
