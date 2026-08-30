import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ScanAction } from "./ScanAction";

import { AppButton, Card } from "@/src/components/ui";
import { useTheme } from "@/src/theme/useTheme";
import { BloodMarker } from "@/src/types";

export function BloodPanel({
  scanning,
  markers,
  onScan,
  onPick,
  onDone,
}: {
  scanning: boolean;
  markers: BloodMarker[];
  onScan: () => void;
  onPick: () => void;
  onDone: () => void;
}) {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  const statusColor = (s: BloodMarker["status"]) =>
    s === "low" ? colors.warning : s === "high" ? colors.danger : colors.textMuted;

  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <ScanAction icon="camera" label="Scan Panel" onPress={onScan} testID="blood-camera" />
        <ScanAction icon="images" label="From Photos" onPress={onPick} testID="blood-library" />
      </View>

      {scanning ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.md }}>
          <ActivityIndicator color={colors.brand} />
          <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.sm }}>
            Reading your blood panel…
          </Text>
        </View>
      ) : null}

      {markers.length === 0 && !scanning ? (
        <Text
          style={{
            color: colors.textFaint,
            fontFamily: font.regular,
            fontSize: fontSize.xs,
            marginTop: spacing.md,
          }}
        >
          Snap a lab report — low ferritin, vitamin D or magnesium auto-flow into today’s protocol.
        </Text>
      ) : null}

      {markers.length > 0 ? (
        <Card testID="blood-results" style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.headlineMd, marginBottom: spacing.sm }}>
            Detected Biomarkers
          </Text>
          {markers.map((m, i) => (
            <View
              key={m.name + i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 7,
                borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                borderTopColor: colors.outlineVariant + "40",
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
                  borderRadius: radius.pill,
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
        </Card>
      ) : null}

      {markers.length > 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <AppButton
            testID="blood-done"
            label="Done — applied to protocol"
            icon="checkmark-circle"
            onPress={onDone}
          />
        </View>
      ) : null}
    </View>
  );
}
