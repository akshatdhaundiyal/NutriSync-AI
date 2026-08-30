import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "@/src/theme/useTheme";

export function Card({
  children,
  style,
  testID,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  padded?: boolean;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: padded ? spacing.lg : 0,
          shadowColor: "#0b1c30",
          shadowOpacity: 0.05,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  style,
  testID,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const { colors, radius, spacing, font, fontSize } = useTheme();

  const bg =
    variant === "primary"
      ? colors.brand
      : variant === "danger"
        ? colors.dangerSoft
        : variant === "secondary"
          ? colors.surfaceTertiary
          : "transparent";
  const fg =
    variant === "primary"
      ? colors.onBrand
      : variant === "danger"
        ? colors.danger
        : colors.text;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          minHeight: 50,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: variant === "ghost" ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text
            style={{ color: fg, fontFamily: font.semibold, fontSize: fontSize.lg }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export interface SegOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Segmented({
  options,
  value,
  onChange,
  testID,
}: {
  options: SegOption[];
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}) {
  const { colors, radius, font, fontSize } = useTheme();
  return (
    <View
      testID={testID}
      style={{
        flexDirection: "row",
        backgroundColor: colors.surfaceTertiary,
        borderRadius: radius.md,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={`seg-${o.value}`}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 9,
              borderRadius: radius.sm,
              backgroundColor: active ? colors.surface : "transparent",
              borderWidth: active ? StyleSheet.hairlineWidth : 0,
              borderColor: colors.border,
            }}
          >
            {o.icon ? (
              <Ionicons
                name={o.icon}
                size={15}
                color={active ? colors.brand : colors.textMuted}
              />
            ) : null}
            <Text
              style={{
                color: active ? colors.text : colors.textMuted,
                fontFamily: active ? font.semibold : font.medium,
                fontSize: fontSize.sm,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  testID,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
}) {
  const { colors, radius, font, fontSize } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        height: 36,
        flexShrink: 0,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: active ? colors.brand : colors.surfaceTertiary,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: active ? colors.brand : colors.border,
      }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? colors.onBrand : colors.textMuted}
        />
      ) : null}
      <Text
        style={{
          color: active ? colors.onBrand : colors.textMuted,
          fontFamily: font.medium,
          fontSize: fontSize.sm,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({
  children,
  testID,
}: {
  children: React.ReactNode;
  testID?: string;
}) {
  const { spacing } = useTheme();
  return (
    <View style={{ height: 56, justifyContent: "center" }}>
      <ScrollView
        testID={testID}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          alignItems: "center",
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  const { colors, font, fontSize, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.md,
        marginTop: spacing.xl,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontFamily: font.heading,
          fontSize: fontSize.xl,
        }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

export function Pill({
  label,
  color,
  bg,
  icon,
}: {
  label: string;
  color: string;
  bg: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { radius, font, fontSize } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: bg,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      {icon ? <Ionicons name={icon} size={12} color={color} /> : null}
      <Text style={{ color, fontFamily: font.medium, fontSize: fontSize.xs }}>
        {label}
      </Text>
    </View>
  );
}

export function SettingRow({
  icon,
  iconColor,
  label,
  sublabel,
  right,
  onPress,
  testID,
  last,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
  last?: boolean;
}) {
  const { colors, font, fontSize, spacing } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        gap: spacing.md,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: (iconColor ?? colors.brand) + "22",
          }}
        >
          <Ionicons name={icon} size={18} color={iconColor ?? colors.brand} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: colors.text, fontFamily: font.medium, fontSize: fontSize.md }}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: font.regular,
              fontSize: fontSize.sm,
              marginTop: 2,
            }}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}
