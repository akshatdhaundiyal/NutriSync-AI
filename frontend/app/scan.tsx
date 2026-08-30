import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QualityBadge } from "@/src/components/QualityBadge";
import { useToast } from "@/src/components/ToastProvider";
import { AppButton, Chip, Segmented } from "@/src/components/ui";
import { canonicalize, formQuality } from "@/src/data/compounds";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";
import { DoseUnit, UnitType } from "@/src/types";
import { success, tap } from "@/src/utils/haptics";

const UNIT_TYPES: UnitType[] = ["capsule", "softgel", "tablet", "scoop", "gummy"];
const DOSE_UNITS: { label: string; value: DoseUnit }[] = [
  { label: "mg", value: "mg" },
  { label: "mcg", value: "mcg" },
  { label: "g", value: "g" },
  { label: "IU", value: "IU" },
  { label: "serving", value: "serving" },
];

export default function ScanScreen() {
  const { colors, font, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();

  const scanLabel = useStore((s) => s.scanLabel);
  const addStashItem = useStore((s) => s.addStashItem);

  const [camPerm, requestCamPerm] = ImagePicker.useCameraPermissions();

  const [brand, setBrand] = useState("");
  const [pname, setPname] = useState("");
  const [chemicalForm, setChemicalForm] = useState("");
  const [dosePerUnit, setDosePerUnit] = useState("");
  const [doseUnit, setDoseUnit] = useState<DoseUnit>("mg");
  const [unit, setUnit] = useState<UnitType>("capsule");
  const [unitsPerContainer, setUnitsPerContainer] = useState("");
  const [stock, setStock] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanSource, setScanSource] = useState<string | null>(null);

  const quality = chemicalForm ? formQuality(chemicalForm) : null;

  const handleAsset = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.base64) {
      toast.show("Could not read image", "error");
      return;
    }
    setScanning(true);
    try {
      const ex = await scanLabel(asset.base64, asset.mimeType || "image/jpeg");
      setBrand(ex.brand);
      setPname(ex.name);
      setChemicalForm(ex.chemicalForm);
      setDosePerUnit(String(ex.dosePerUnit));
      setDoseUnit(ex.doseUnit);
      setUnit(ex.unit);
      setUnitsPerContainer(String(ex.unitsPerContainer));
      setStock(String(ex.unitsPerContainer));
      setScanSource(ex.source);
      success();
      toast.show(`Label read via ${ex.source}`);
    } finally {
      setScanning(false);
    }
  };

  const onScan = async () => {
    tap();
    if (!camPerm?.granted) {
      const res = await requestCamPerm();
      if (!res.granted) {
        if (!res.canAskAgain) {
          toast.show("Enable camera in Settings to scan", "error");
          Linking.openSettings();
        } else {
          toast.show("Camera access needed to scan a label", "error");
        }
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.4,
      allowsEditing: true,
    });
    await handleAsset(result);
  };

  const onPick = async () => {
    tap();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.4,
      allowsEditing: true,
    });
    await handleAsset(result);
  };

  const onSave = async () => {
    if (!brand.trim() || !pname.trim()) {
      toast.show("Add a brand and product name", "error");
      return;
    }
    const dose = Number(dosePerUnit) || 0;
    if (dose <= 0) {
      toast.show("Enter the dose per unit", "error");
      return;
    }
    tap();
    await addStashItem({
      id: `item-${Date.now()}`,
      brand: brand.trim(),
      name: pname.trim(),
      canonical: canonicalize(pname),
      chemicalForm: chemicalForm.trim() || "Standard",
      dosePerUnit: dose,
      doseUnit,
      unit,
      unitsPerContainer: Number(unitsPerContainer) || 60,
      stockUnits: Number(stock) || Number(unitsPerContainer) || 60,
      quality: formQuality(chemicalForm || "Standard"),
      createdAt: new Date().toISOString(),
      deletedAt: null,
    });
    success();
    toast.show(`${pname.trim()} added to stash`);
    router.back();
  };

  const inputStyle = {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: font.regular,
    fontSize: fontSize.base,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  } as const;

  const fieldLabel = {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    marginBottom: 6,
    marginTop: spacing.md,
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* header */}
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.xl }}>
          Add Supplement
        </Text>
        <Pressable
          testID="scan-close"
          hitSlop={10}
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceTertiary }}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl + insets.bottom }}
      >
        {/* scan actions */}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <ScanAction icon="camera" label="Scan Label" onPress={onScan} testID="scan-camera" />
          <ScanAction icon="images" label="From Photos" onPress={onPick} testID="scan-library" />
        </View>

        {scanning ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.md }}>
            <ActivityIndicator color={colors.brand} />
            <Text style={{ color: colors.textMuted, fontFamily: font.medium, fontSize: fontSize.sm }}>
              Gemini Vision is reading the label…
            </Text>
          </View>
        ) : null}

        {scanSource ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md }}>
            <Ionicons name="checkmark-circle" size={14} color={colors.brand} />
            <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.xs }}>
              Auto-filled from {scanSource}. Review the fields below.
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: colors.textFaint,
              fontFamily: font.regular,
              fontSize: fontSize.xs,
              marginTop: spacing.md,
            }}
          >
            Snap a bottle or blood-test label, or enter details manually below.
          </Text>
        )}

        {/* form */}
        <Text style={fieldLabel}>Brand</Text>
        <TextInput testID="input-brand" style={inputStyle} value={brand} onChangeText={setBrand} placeholder="Doctor's Best" placeholderTextColor={colors.textFaint} />

        <Text style={fieldLabel}>Product Name</Text>
        <TextInput testID="input-name" style={inputStyle} value={pname} onChangeText={setPname} placeholder="Magnesium Glycinate" placeholderTextColor={colors.textFaint} />

        <Text style={fieldLabel}>Chemical Form</Text>
        <TextInput testID="input-form" style={inputStyle} value={chemicalForm} onChangeText={setChemicalForm} placeholder="Glycinate" placeholderTextColor={colors.textFaint} autoCapitalize="words" />
        {quality ? (
          <View style={{ marginTop: spacing.sm }}>
            <QualityBadge quality={quality} form={chemicalForm} />
          </View>
        ) : null}

        <Text style={fieldLabel}>Dose per unit</Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <TextInput
            testID="input-dose"
            style={[inputStyle, { flex: 1 }]}
            value={dosePerUnit}
            onChangeText={setDosePerUnit}
            placeholder="100"
            placeholderTextColor={colors.textFaint}
            keyboardType="numeric"
          />
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <Segmented
            value={doseUnit}
            onChange={(v) => setDoseUnit(v as DoseUnit)}
            options={DOSE_UNITS}
          />
        </View>

        <Text style={fieldLabel}>Unit type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {UNIT_TYPES.map((u) => (
            <Chip key={u} label={u} active={unit === u} onPress={() => setUnit(u)} testID={`unit-${u}`} />
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={fieldLabel}>Units / container</Text>
            <TextInput testID="input-container" style={inputStyle} value={unitsPerContainer} onChangeText={setUnitsPerContainer} placeholder="120" placeholderTextColor={colors.textFaint} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={fieldLabel}>In stock</Text>
            <TextInput testID="input-stock" style={inputStyle} value={stock} onChangeText={setStock} placeholder="120" placeholderTextColor={colors.textFaint} keyboardType="numeric" />
          </View>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <AppButton testID="save-supplement" label="Add to Cabinet" icon="add-circle" onPress={onSave} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function ScanAction({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const { colors, font, fontSize, radius, spacing } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderStyle: "dashed",
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.brandSoft,
        }}
      >
        <Ionicons name={icon} size={22} color={colors.brand} />
      </View>
      <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.sm }}>
        {label}
      </Text>
    </Pressable>
  );
}
