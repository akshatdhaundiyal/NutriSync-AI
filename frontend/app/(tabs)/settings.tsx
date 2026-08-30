import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useToast } from "@/src/components/ToastProvider";
import { Card, Chip, ChipRow, Pill, Segmented, SettingRow } from "@/src/components/ui";
import { PROVIDER_LABEL } from "@/src/services/ai";
import { REGION_LABELS } from "@/src/services/procurement";
import { PRESETS } from "@/src/data/mockData";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { AIProvider, Region } from "@/src/types";
import { tap } from "@/src/utils/haptics";

const PROVIDERS: { value: AIProvider; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "mock", sub: "Works out-of-the-box · no key", icon: "hardware-chip" },
  { value: "gemini-direct", sub: "Uses your own Gemini key", icon: "sparkles" },
  { value: "openai-direct", sub: "Uses your own OpenAI key", icon: "sparkles" },
  { value: "emergent-gpt", sub: "No setup · via Emergent Universal Key", icon: "cloud" },
  { value: "emergent-gemini", sub: "No setup · via Emergent Universal Key", icon: "cloud" },
];

export default function SettingsScreen() {
  const { colors, font, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const settings = useStore((s) => s.settings);
  const keys = useStore((s) => s.keys);
  const setThemeMode = useStore((s) => s.setThemeMode);
  const setRegion = useStore((s) => s.setRegion);
  const setProvider = useStore((s) => s.setProvider);
  const setPermission = useStore((s) => s.setPermission);
  const applyPreset = useStore((s) => s.applyPreset);
  const saveKey = useStore((s) => s.saveKey);

  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

  useEffect(() => {
    setGeminiKey(keys.gemini);
    setOpenaiKey(keys.openai);
  }, [keys.gemini, keys.openai]);

  const sectionLabel = {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader title="Settings" subtitle="Developer & simulator" />
      <KeyboardAwareScrollView
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxxl + insets.bottom,
        }}
      >
        {/* Appearance */}
        <Text style={sectionLabel}>APPEARANCE</Text>
        <Card>
          <Segmented
            testID="theme-segmented"
            value={settings.themeMode}
            onChange={(v) => {
              tap();
              setThemeMode(v as any);
            }}
            options={[
              { label: "System", value: "system", icon: "phone-portrait" },
              { label: "Light", value: "light", icon: "sunny" },
              { label: "Dark", value: "dark", icon: "moon" },
            ]}
          />
        </Card>

        {/* Region */}
        <Text style={[sectionLabel, { marginTop: spacing.xl }]}>REGION & STORE</Text>
        <Card padded={false} style={{ paddingVertical: spacing.md }}>
          <ChipRow testID="region-row">
            {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
              <Chip
                key={r}
                testID={`region-${r}`}
                label={REGION_LABELS[r]}
                active={settings.region === r}
                onPress={() => {
                  tap();
                  setRegion(r);
                  toast.show(`Buy links set to ${REGION_LABELS[r]}`, "info");
                }}
              />
            ))}
          </ChipRow>
          <Text
            style={{
              color: colors.textFaint,
              fontFamily: font.regular,
              fontSize: fontSize.xs,
              paddingHorizontal: spacing.lg,
            }}
          >
            Controls which merchants appear on “Buy New” cards.
          </Text>
        </Card>

        {/* AI Provider */}
        <Text style={[sectionLabel, { marginTop: spacing.xl }]}>AI PROTOCOL ENGINE</Text>
        <Card>
          {PROVIDERS.map((p, i) => {
            const activeP = settings.aiProvider === p.value;
            return (
              <SettingRow
                key={p.value}
                testID={`provider-${p.value}`}
                icon={p.icon}
                iconColor={activeP ? colors.brand : colors.textMuted}
                label={PROVIDER_LABEL[p.value]}
                sublabel={p.sub}
                last={i === PROVIDERS.length - 1}
                onPress={() => {
                  tap();
                  setProvider(p.value);
                  toast.show(`Engine: ${PROVIDER_LABEL[p.value]}`, "info");
                }}
                right={
                  <Ionicons
                    name={activeP ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={activeP ? colors.brand : colors.textFaint}
                  />
                }
              />
            );
          })}
        </Card>

        {/* API Keys */}
        <Text style={[sectionLabel, { marginTop: spacing.xl }]}>ON-DEVICE API KEYS</Text>
        <Card>
          <KeyField
            testID="gemini-key-input"
            label="Google Gemini API Key"
            placeholder="AIza…"
            value={geminiKey}
            onChangeText={setGeminiKey}
            onSave={() => {
              tap();
              saveKey("gemini", geminiKey.trim());
              toast.show("Gemini key stored securely");
            }}
          />
          <View style={{ height: spacing.md }} />
          <KeyField
            testID="openai-key-input"
            label="OpenAI API Key"
            placeholder="sk-…"
            value={openaiKey}
            onChangeText={setOpenaiKey}
            onSave={() => {
              tap();
              saveKey("openai", openaiKey.trim());
              toast.show("OpenAI key stored securely");
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md }}>
            <Ionicons name="lock-closed" size={13} color={colors.brand} />
            <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.xs, flex: 1 }}>
              Hardware-backed keychain (expo-secure-store). Keys never leave your device.
            </Text>
          </View>
        </Card>

        {/* Telemetry Simulator */}
        <Text style={[sectionLabel, { marginTop: spacing.xl }]}>TELEMETRY SIMULATOR</Text>
        <View style={{ gap: spacing.sm }}>
          {PRESETS.map((preset) => {
            const activeP = settings.activePreset === preset.id;
            return (
              <Card
                key={preset.id}
                testID={`preset-${preset.id}`}
                style={{
                  borderColor: activeP ? colors.brand : colors.border,
                  borderWidth: activeP ? 1.5 : StyleSheet.hairlineWidth,
                }}
              >
                <View
                  // Pressable behaviour via onStartShouldSetResponder is fussy; use SettingRow-like Pressable
                  style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: activeP ? colors.brand : colors.surfaceTertiary,
                    }}
                  >
                    <Ionicons
                      name={preset.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={activeP ? colors.onBrand : colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.base }}>
                      {preset.label}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm }}>
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
                        paddingVertical: 8,
                        paddingHorizontal: 12,
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

        {/* Health Connect */}
        <Text style={[sectionLabel, { marginTop: spacing.xl }]}>HEALTH CONNECT</Text>
        <Card>
          {(["sleep", "hrv", "workouts"] as const).map((k, i) => (
            <SettingRow
              key={k}
              icon={k === "sleep" ? "bed" : k === "hrv" ? "pulse" : "barbell"}
              label={k === "sleep" ? "Sleep Stages" : k === "hrv" ? "Heart Rate Variability" : "Workouts & Strain"}
              sublabel={settings.permissions[k] ? "Granted (simulated)" : "Not granted"}
              last={i === 2}
              right={
                <Switch
                  testID={`perm-${k}`}
                  value={settings.permissions[k]}
                  onValueChange={(v) => {
                    tap();
                    setPermission(k, v);
                  }}
                  trackColor={{ true: colors.brand, false: colors.surfaceTertiary }}
                  thumbColor="#fff"
                />
              }
            />
          ))}
        </Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm, marginLeft: spacing.xs }}>
          <Ionicons name="information-circle" size={13} color={colors.textFaint} />
          <Text style={{ color: colors.textFaint, fontFamily: font.regular, fontSize: fontSize.xs, flex: 1 }}>
            Live Android Health Connect sync activates in a native build. Preview uses the simulator above.
          </Text>
        </View>

        {/* About */}
        <View style={{ alignItems: "center", marginTop: spacing.xxl, gap: 4 }}>
          <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.base }}>
            NutriSync AI
          </Text>
          <Text style={{ color: colors.textFaint, fontFamily: font.mono, fontSize: fontSize.xs }}>
            v1.0.0 · 100% on-device
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function KeyField({
  label,
  placeholder,
  value,
  onChangeText,
  onSave,
  testID,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onSave: () => void;
  testID?: string;
}) {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const [show, setShow] = useState(false);
  return (
    <View>
      <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.sm, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surfaceTertiary,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          }}
        >
          <TextInput
            testID={testID}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textFaint}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              flex: 1,
              color: colors.text,
              fontFamily: font.mono,
              fontSize: fontSize.sm,
              paddingVertical: 12,
            }}
          />
          <Ionicons
            name={show ? "eye-off" : "eye"}
            size={16}
            color={colors.textFaint}
            onPress={() => setShow((s) => !s)}
          />
        </View>
        <Text
          testID={`${testID}-save`}
          onPress={onSave}
          style={{
            color: colors.onBrand,
            backgroundColor: colors.brand,
            fontFamily: font.semibold,
            fontSize: fontSize.sm,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: radius.md,
            overflow: "hidden",
          }}
        >
          Save
        </Text>
      </View>
    </View>
  );
}
