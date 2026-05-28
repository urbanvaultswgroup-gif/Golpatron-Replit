import { useColorScheme } from "react-native";
import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

type BasePalette = typeof colors.light;
export type Colors = BasePalette & { radius: number };

export function useColors(): Colors {
  const scheme = useColorScheme();
  const { theme } = useTheme();

  const palette: BasePalette =
    scheme === "dark" && "dark" in colors
      ? (colors.dark as BasePalette)
      : colors.light;

  return {
    ...palette,
    radius: colors.radius,
    primary: theme.primary,
    primaryForeground: theme.primaryForeground,
    tint: theme.primary,
  };
}
