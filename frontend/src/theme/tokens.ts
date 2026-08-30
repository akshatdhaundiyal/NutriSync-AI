// Design tokens for NutriSync AI — dual theme (Biohacker Dark / Clinical Light).
// StyleSheet-based. Raw hex/rgba + numeric tokens (no NativeWind).

export type ThemeName = "dark" | "light";

export interface ThemeColors {
  canvas: string;
  surface: string;
  surfaceAlt: string;
  surfaceTertiary: string;
  text: string;
  textMuted: string;
  textFaint: string;
  brand: string; // emerald
  brandSoft: string;
  onBrand: string;
  accent: string; // cyan
  accentSoft: string;
  border: string;
  borderStrong: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  ringTrack: string;
  overlay: string;
  glowShadow: string;
}

export const darkColors: ThemeColors = {
  canvas: "#020617",
  surface: "#0f172a",
  surfaceAlt: "#131f38",
  surfaceTertiary: "#1e293b",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  textFaint: "#64748b",
  brand: "#34d399",
  brandSoft: "rgba(52,211,153,0.14)",
  onBrand: "#020617",
  accent: "#22d3ee",
  accentSoft: "rgba(34,211,238,0.14)",
  border: "#1e293b",
  borderStrong: "#334155",
  success: "#34d399",
  successSoft: "rgba(52,211,153,0.14)",
  warning: "#fbbf24",
  warningSoft: "rgba(251,191,36,0.14)",
  danger: "#f87171",
  dangerSoft: "rgba(248,113,113,0.14)",
  info: "#60a5fa",
  ringTrack: "#1e293b",
  overlay: "rgba(2,6,23,0.72)",
  glowShadow: "#34d399",
};

export const lightColors: ThemeColors = {
  canvas: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#ffffff",
  surfaceTertiary: "#f1f5f9",
  text: "#0f172a",
  textMuted: "#475569",
  textFaint: "#94a3b8",
  brand: "#059669",
  brandSoft: "rgba(5,150,105,0.10)",
  onBrand: "#ffffff",
  accent: "#0891b2",
  accentSoft: "rgba(8,145,178,0.10)",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  success: "#059669",
  successSoft: "rgba(5,150,105,0.10)",
  warning: "#d97706",
  warningSoft: "rgba(217,119,6,0.10)",
  danger: "#dc2626",
  dangerSoft: "rgba(220,38,38,0.10)",
  info: "#2563eb",
  ringTrack: "#e2e8f0",
  overlay: "rgba(15,23,42,0.45)",
  glowShadow: "#059669",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const font = {
  regular: "Geist-Regular",
  medium: "Geist-Medium",
  semibold: "Geist-SemiBold",
  mono: "GeistMono-Regular",
  monoMed: "GeistMono-Medium",
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 52,
} as const;
