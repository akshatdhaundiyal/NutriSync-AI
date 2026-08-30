// Design tokens for NutriSync AI — Google Stitch Material-3 / Modern-Humanist.
// StyleSheet-based. Raw hex/rgba + numeric tokens.

export type ThemeName = "dark" | "light";

export interface ThemeColors {
  canvas: string;
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
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
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  accent: string; // secondary
  accentSoft: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  border: string;
  borderStrong: string;
  outline: string;
  outlineVariant: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
  info: string;
  ringTrack: string;
  overlay: string;
  glowShadow: string;
  glassBackground: string;
  glassBorder: string;
}

export const darkColors: ThemeColors = {
  canvas: "#0b1420",
  surface: "#131f30",
  surfaceContainerLowest: "#0b1420",
  surfaceContainerLow: "#101b2b",
  surfaceContainer: "#131f30",
  surfaceContainerHigh: "#16233a",
  surfaceContainerHighest: "#1c2b40",
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
  primaryFixed: "#6ffbbe",
  primaryFixedDim: "#4edea3",
  onPrimaryFixed: "#002113",
  accent: "#c0c1ff",
  accentSoft: "rgba(70,72,212,0.30)",
  secondaryFixed: "#2b2ba6",
  secondaryFixedDim: "#c0c1ff",
  onSecondaryFixed: "#e1e0ff",
  secondaryContainer: "#6063ee",
  onSecondaryContainer: "#fffbff",
  tertiary: "#ffb2b7",
  onTertiary: "#5f0018",
  tertiaryContainer: "#8c0031",
  onTertiaryContainer: "#ffdadb",
  tertiaryFixed: "#ffdadb",
  border: "#243349",
  borderStrong: "#33455f",
  outline: "#6c7a71",
  outlineVariant: "#33455f",
  success: "#4edea3",
  successSoft: "rgba(78,222,163,0.14)",
  warning: "#fbbf24",
  warningSoft: "rgba(251,191,36,0.16)",
  danger: "#ffb4ab",
  dangerSoft: "rgba(147,0,10,0.38)",
  error: "#ffb4ab",
  errorContainer: "#8c1d18",
  onErrorContainer: "#ffdad6",
  info: "#c0c1ff",
  ringTrack: "rgba(78,222,163,0.18)",
  overlay: "rgba(2,6,23,0.72)",
  glowShadow: "#10b981",
  glassBackground: "rgba(19, 31, 48, 0.75)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
};

export const lightColors: ThemeColors = {
  canvas: "#f8f9ff",
  surface: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#eff4ff",
  surfaceContainer: "#e5eeff",
  surfaceContainerHigh: "#dce9ff",
  surfaceContainerHighest: "#d3e4fe",
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
  onPrimaryContainer: "#00422b",
  primaryFixed: "#6ffbbe",
  primaryFixedDim: "#4edea3",
  onPrimaryFixed: "#002113",
  accent: "#4648d4",
  accentSoft: "#e1e0ff",
  secondaryFixed: "#e1e0ff",
  secondaryFixedDim: "#c0c1ff",
  onSecondaryFixed: "#07006c",
  secondaryContainer: "#6063ee",
  onSecondaryContainer: "#fffbff",
  tertiary: "#bc0b3b",
  onTertiary: "#ffffff",
  tertiaryContainer: "#ff7886",
  onTertiaryContainer: "#780021",
  tertiaryFixed: "#ffdadb",
  border: "#dbe4f0",
  borderStrong: "#c3d2e6",
  outline: "#6c7a71",
  outlineVariant: "#bbcabf",
  success: "#006c49",
  successSoft: "rgba(0,108,73,0.10)",
  warning: "#b45309",
  warningSoft: "rgba(245,158,11,0.16)",
  danger: "#ba1a1a",
  dangerSoft: "#ffdad6",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  info: "#4648d4",
  ringTrack: "rgba(0,108,73,0.16)",
  overlay: "rgba(11,28,48,0.45)",
  glowShadow: "#10b981",
  glassBackground: "rgba(255, 255, 255, 0.75)",
  glassBorder: "rgba(255, 255, 255, 0.60)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  innerGap: 12,
  lg: 16,
  stackGap: 16,
  containerMargin: 20,
  xl: 24,
  cardPadding: 24,
  xxl: 32,
  sectionMargin: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  DEFAULT: 16,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 9999,
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
  labelSm: 12,
  labelMd: 14,
  bodyMd: 16,
  bodyLg: 18,
  md: 16,
  lg: 18,
  headlineMd: 20,
  headlineLgMobile: 26,
  xl: 22,
  xxl: 26,
  headlineLg: 32,
  xxxl: 32,
  displayMetric: 48,
  huge: 48,
} as const;
