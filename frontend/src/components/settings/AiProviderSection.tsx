import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useToast } from "@/src/components/ToastProvider";
import { Card, SettingRow } from "@/src/components/ui";
import { PROVIDER_LABEL } from "@/src/services/ai";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { AIProvider } from "@/src/types";
import { tap } from "@/src/utils/haptics";

const PROVIDERS: { value: AIProvider; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "mock", sub: "Works out-of-the-box · no key", icon: "hardware-chip" },
  { value: "gemini-direct", sub: "Uses your own Gemini key", icon: "sparkles" },
  { value: "openai-direct", sub: "Uses your own OpenAI key", icon: "sparkles" },
  { value: "emergent-gpt", sub: "No setup · via Emergent Universal Key", icon: "cloud" },
  { value: "emergent-gemini", sub: "No setup · via Emergent Universal Key", icon: "cloud" },
];

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
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.outlineVariant + "60",
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

export function AiProviderSection() {
  const { colors, font, fontSize, spacing } = useTheme();
  const toast = useToast();

  const settings = useStore((s) => s.settings);
  const keys = useStore((s) => s.keys);
  const setProvider = useStore((s) => s.setProvider);
  const saveKey = useStore((s) => s.saveKey);

  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

  useEffect(() => {
    if (keys.gemini) setGeminiKey(keys.gemini);
    if (keys.openai) setOpenaiKey(keys.openai);
  }, [keys]);

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
    <>
      {/* AI Protocol Engine */}
      <View>
        <Text style={sectionLabel}>AI Protocol Engine</Text>
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
      </View>

      {/* On-Device API Keys */}
      <View>
        <Text style={sectionLabel}>On-Device API Keys</Text>
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
      </View>
    </>
  );
}
