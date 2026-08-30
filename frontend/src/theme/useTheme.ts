import { useColorScheme } from "react-native";

import { useStore } from "@/src/store/useStore";
import {
  darkColors,
  lightColors,
  spacing,
  radius,
  font,
  fontSize,
  ThemeColors,
  ThemeName,
} from "@/src/theme/tokens";

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  font: typeof font;
  fontSize: typeof fontSize;
}

export function useTheme(): Theme {
  const mode = useStore((s) => s.settings.themeMode);
  const system = useColorScheme();
  const name: ThemeName =
    mode === "system" ? (system === "light" ? "light" : "dark") : mode;
  const colors = name === "dark" ? darkColors : lightColors;
  return { name, colors, spacing, radius, font, fontSize };
}
