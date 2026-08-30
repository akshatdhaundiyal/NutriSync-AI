import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useToast } from "@/src/components/ToastProvider";
import { Card, Pill, Segmented, SettingRow } from "@/src/components/ui";
import { PRESETS } from "@/src/data/mockData";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { TelemetrySource } from "@/src/types";
import { tap } from "@/src/utils/haptics";

export function TelemetrySourceSection() {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const toast = useToast();

  const settings = useStore((s) => s.settings);
  const setPermission = useStore((s) => s.setPermission);
  const applyPreset = useStore((s) => s.applyPreset);
  const setTelemetrySource = useStore((s) => s.setTelemetrySource);

  const [syncingSource, setSyncingSource] = useState(false);

  const sectionLabel = {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: fontSize.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    marginBottom: spacing.xs,
    marginLeft: 4,
  };

  return (
    <View>
      <Text style={sectionLabel}>Biometric Data Source</Text>
      <Card style={{ gap: spacing.md }}>
        <Segmented
          testID="datasource-segmented"
          value={settings.telemetrySource ?? "mock"}
          onChange={async (v) => {
            tap();
            setSyncingSource(true);
            try {
              const msg = await setTelemetrySource(v as TelemetrySource);
              toast.show(msg, "info");
            } catch (err: any) {
              toast.show("Error switching source: " + err.message, "error");
            } finally {
              setSyncingSource(false);
            }
          }}
          options={[
            { label: "Mock Simulator", value: "mock", icon: "flask" },
            { label: "Live Health Connect", value: "health_connect", icon: "pulse" },
          ]}
        />

        {settings.telemetrySource === "health_connect" ? (
          <View style={{ gap: spacing.md, marginTop: 4 }}>
            <View
              style={{
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.md,
                padding: spacing.md,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "40",
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="logo-android" size={20} color={colors.brand} />
                  <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.bodyMd }}>
                    Android Health Connect
                  </Text>
                </View>
                <Pill
                  label={Platform.OS === "android" ? "Native Ready" : "Bridge Mode"}
                  color={colors.brand}
                  bg={colors.brandSoft}
                  icon="radio-button-on"
                />
              </View>

              <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
                Synchronizes live Sleep Stages, RMSSD Heart Rate Variability, Resting HR, and Workouts into your daily protocol.
              </Text>

              <Pressable
                testID="sync-healthconnect-now"
                onPress={async () => {
                  tap();
                  setSyncingSource(true);
                  try {
                    const msg = await setTelemetrySource("health_connect");
                    toast.show(msg, "success");
                  } catch (err: any) {
                    toast.show("Sync failed: " + err.message, "error");
                  } finally {
                    setSyncingSource(false);
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  backgroundColor: colors.brand,
                  borderRadius: radius.sm,
                  paddingVertical: 10,
                  marginTop: 4,
                }}
              >
                {syncingSource ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="sync" size={16} color="#fff" />
                )}
                <Text style={{ color: "#fff", fontFamily: font.semibold, fontSize: fontSize.sm }}>
                  {syncingSource ? "Reading Biometrics…" : "Sync Live Data Now"}
                </Text>
              </Pressable>
            </View>

            <View style={{ gap: 2 }}>
              <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.xs, marginBottom: 4 }}>
                PERMISSIONS
              </Text>
              {(["sleep", "hrv", "workouts"] as const).map((k, i) => (
                <SettingRow
                  key={k}
                  icon={k === "sleep" ? "bed" : k === "hrv" ? "pulse" : "barbell"}
                  label={k === "sleep" ? "Sleep Stages" : k === "hrv" ? "Heart Rate Variability" : "Workouts & Strain"}
                  sublabel={settings.permissions[k] ? "Granted" : "Not granted"}
                  last={i === 2}
                  right={
                    <Switch
                      testID={`perm-${k}`}
                      value={settings.permissions[k]}
                      onValueChange={(v) => {
                        tap();
                        setPermission(k, v);
                      }}
                      trackColor={{ true: colors.brand, false: colors.surfaceContainerLow }}
                      thumbColor="#fff"
                    />
                  }
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={{ gap: spacing.sm, marginTop: 4 }}>
            <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.xs }}>
              SELECT SIMULATED SCENARIO
            </Text>
            {PRESETS.map((preset) => {
              const activeP = settings.activePreset === preset.id;
              return (
                <Card
                  key={preset.id}
                  testID={`preset-${preset.id}`}
                  style={{
                    borderColor: activeP ? colors.brand : colors.outlineVariant + "40",
                    borderWidth: activeP ? 1.5 : StyleSheet.hairlineWidth,
                    backgroundColor: activeP ? colors.surfaceContainer : colors.surfaceContainerLow,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: activeP ? colors.brand : colors.surfaceContainerHigh,
                      }}
                    >
                      <Ionicons
                        name={preset.icon as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={activeP ? colors.onBrand : colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.base }}>
                        {preset.label}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
                        {preset.subtitle}
                      </Text>
                    </View>
                    {activeP ? (
                      <Pill label="Active" color={colors.brand} bg={colors.brandSoft} icon="checkmark" />
                    ) : (
                      <Text
                        testID={`preset-run-${preset.id}`}
                        onPress={() => {
                          tap();
                          applyPreset(preset.id);
                          toast.show("Telemetry loaded · re-analyzing");
                        }}
                        style={{
                          color: colors.accent,
                          fontFamily: font.semibold,
                          fontSize: fontSize.sm,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                        }}
                      >
                        Load
                      </Text>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </Card>
    </View>
  );
}
