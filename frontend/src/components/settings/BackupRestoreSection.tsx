import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useToast } from "@/src/components/ToastProvider";
import { Card } from "@/src/components/ui";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { tap } from "@/src/utils/haptics";

export function BackupRestoreSection() {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  const toast = useToast();

  const exportBackup = useStore((s) => s.exportBackup);
  const importBackup = useStore((s) => s.importBackup);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreJson, setRestoreJson] = useState("");

  const handleExportJson = () => {
    tap();
    const json = exportBackup();
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nutrisync_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show("JSON Backup downloaded");
    } else {
      toast.show("Data export ready");
    }
  };

  const handleExportCsv = () => {
    tap();
    const telemetry = useStore.getState().telemetry;
    const headers = "date,deepSleepMin,hrvMs,restingHr,strain,steps,intake\n";
    const rows = telemetry
      .map(
        (t) =>
          `${t.date},${t.deepSleepMin},${t.hrvMs},${t.restingHr},${t.strain},${t.steps},${t.intake ? 1 : 0}`,
      )
      .join("\n");
    const csv = headers + rows;

    if (Platform.OS === "web" && typeof document !== "undefined") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nutrisync_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show("CSV Telemetry exported");
    } else {
      toast.show("CSV export ready");
    }
  };

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
      <Text style={sectionLabel}>Data Backup & Export</Text>
      <Card>
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable
              testID="export-json"
              onPress={handleExportJson}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.sm,
                paddingVertical: 11,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
              }}
            >
              <Ionicons name="download-outline" size={16} color={colors.brand} />
              <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm }}>
                Export JSON
              </Text>
            </Pressable>

            <Pressable
              testID="export-csv"
              onPress={handleExportCsv}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.sm,
                paddingVertical: 11,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
              }}
            >
              <Ionicons name="stats-chart-outline" size={16} color={colors.accent} />
              <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm }}>
                Export CSV
              </Text>
            </Pressable>
          </View>

          <Pressable
            testID="open-restore"
            onPress={() => {
              tap();
              setShowRestoreModal(true);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor: colors.surfaceContainer,
              borderRadius: radius.sm,
              paddingVertical: 10,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.outlineVariant + "40",
              marginTop: 4,
            }}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.sm }}>
              Restore from JSON Backup
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Restore Modal */}
      <Modal
        visible={showRestoreModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.containerMargin,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: radius.lg,
              padding: spacing.xl,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.outlineVariant + "50",
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: colors.text, fontFamily: font.heading, fontSize: fontSize.headlineMd, fontWeight: "700" }}>
                Restore Backup
              </Text>
              <Pressable hitSlop={8} onPress={() => setShowRestoreModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textFaint} />
              </Pressable>
            </View>

            <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.bodyMd }}>
              Paste your exported NutriSync AI JSON backup below to restore your cabinet stash, telemetry history, and adherence records.
            </Text>

            <TextInput
              testID="restore-json-input"
              multiline
              numberOfLines={6}
              value={restoreJson}
              onChangeText={setRestoreJson}
              placeholder="Paste JSON here..."
              placeholderTextColor={colors.textFaint}
              style={{
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.md,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outlineVariant + "60",
                color: colors.text,
                fontFamily: font.mono,
                fontSize: fontSize.sm,
                padding: spacing.md,
                height: 140,
                textAlignVertical: "top",
              }}
            />

            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <Pressable
                onPress={() => setShowRestoreModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: radius.sm,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.base }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                testID="submit-restore-btn"
                onPress={async () => {
                  tap();
                  const ok = await importBackup(restoreJson.trim());
                  if (ok) {
                    toast.show("Backup successfully restored!");
                    setShowRestoreModal(false);
                    setRestoreJson("");
                  } else {
                    toast.show("Invalid JSON backup format", "error");
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.brand,
                  borderRadius: radius.sm,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.onBrand, fontFamily: font.semibold, fontSize: fontSize.base }}>
                  Restore
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
