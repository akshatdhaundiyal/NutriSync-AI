// Design tokens for NutriSync AI — dual theme (Biohacker Dark / Clinical Light).
// StyleSheet-based. Raw hex/rgba + numeric tokens (no NativeWind).

export type ThemeName = "dark" | "light";

export interface ThemeColors {
  canvas: string;
  surface: string;
  surfaceAlt: string;
  surfaceTertiary: string;
  surfaceHigh: string;
  surfaceLow: string;
  text: string;
  textMuted: string;
  textFaint: string;
  brand: string; // primary
  brandSoft: string;
  onBrand: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  accent: string; // secondary
  accentSoft: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  border: string;
  borderStrong: string;
  outlineVariant: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  errorContainer: string;
  onErrorContainer: string;
  info: string;
  ringTrack: string;
  overlay: string;
  glowShadow: string;
}

export const darkColors: ThemeColors = {
  canvas: "#0b1420",
  surface: "#131f30",
  surfaceAlt: "#16233a",
  surfaceTertiary: "#1c2b40",
  surfaceHigh: "#22344c",
  surfaceLow: "#101b2b",
  text: "#eaf1ff",
  textMuted: "#a9bccf",
  textFaint: "#6f8296",
  brand: "#4edea3",
  brandSoft: "rgba(78,222,163,0.14)",
  onBrand: "#00281a",
  primaryContainer: "#10b981",
  onPrimaryContainer: "#00311f",
  accent: "#c0c1ff",
  accentSoft: "rgba(70,72,212,0.30)",
  secondaryFixed: "#2b2ba6",
  onSecondaryFixed: "#e1e0ff",
  tertiary: "#ffb2b7",
  onTertiary: "#5f0018",
  tertiaryContainer: "#8c0031",
  border: "#243349",
  borderStrong: "#33455f",
  outlineVariant: "#33455f",
  success: "#4edea3",
  successSoft: "rgba(78,222,163,0.14)",
  warning: "#fbbf24",
  warningSoft: "rgba(251,191,36,0.16)",
  danger: "#ffb4ab",
  dangerSoft: "rgba(147,0,10,0.38)",
  errorContainer: "#8c1d18",
  onErrorContainer: "#ffdad6",
  info: "#c0c1ff",
  ringTrack: "rgba(78,222,163,0.18)",
  overlay: "rgba(2,6,23,0.72)",
  glowShadow: "#10b981",
};

export const lightColors: ThemeColors = {
  canvas: "#f8f9ff",
  surface: "#ffffff",
  surfaceAlt: "#eff4ff",
  surfaceTertiary: "#e5eeff",
  surfaceHigh: "#dce9ff",
  surfaceLow: "#eff4ff",
  text: "#0b1c30",
  textMuted: "#3c4a42",
  textFaint: "#6c7a71",
  brand: "#006c49",
  brandSoft: "rgba(0,108,73,0.10)",
  onBrand: "#ffffff",
  primaryContainer: "#10b981",
  onPrimaryContainer: "#00311f",
  accent: "#4648d4",
  accentSoft: "#e1e0ff",
  secondaryFixed: "#e1e0ff",
  onSecondaryFixed: "#07006c",
  tertiary: "#bc0b3b",
  onTertiary: "#ffffff",
  tertiaryContainer: "#ff7886",
  border: "#dbe4f0",
  borderStrong: "#c3d2e6",
  outlineVariant: "#bbcabf",
  success: "#006c49",
  successSoft: "rgba(0,108,73,0.10)",
  warning: "#b45309",
  warningSoft: "rgba(245,158,11,0.16)",
  danger: "#ba1a1a",
  dangerSoft: "#ffdad6",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  info: "#4648d4",
  ringTrack: "rgba(0,108,73,0.16)",
  overlay: "rgba(11,28,48,0.45)",
  glowShadow: "#10b981",
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
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semibold: "Inter-SemiBold",
  heading: "HankenGrotesk-SemiBold",
  display: "HankenGrotesk-Bold",
  mono: "HankenGrotesk-Bold",
  monoMed: "HankenGrotesk-Bold",
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
