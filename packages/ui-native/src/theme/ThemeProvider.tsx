import { useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import {
  createNativeTheme,
  type GrytAppearance,
  type NativeThemeOptions,
} from "./createNativeTheme";
import { ThemeContext } from "./themeContext";

export interface GrytThemeProviderProps {
  appearance?: GrytAppearance;
  color?: NativeThemeOptions["color"];
  radius?: NativeThemeOptions["radius"];
  /**
   * Follow the OS setting when `appearance` is not given.
   *
   * The web equivalent is a `prefers-color-scheme` media query, which the
   * client already honours.
   */
  followSystemAppearance?: boolean;
  children?: ReactNode;
}

export function GrytThemeProvider({
  appearance,
  color,
  radius,
  followSystemAppearance = false,
  children,
}: GrytThemeProviderProps) {
  const systemScheme = useColorScheme();

  // Named props rather than a spread options object, so the dependencies are
  // the actual inputs. Spreading meant either a stale theme or rebuilding every
  // ramp on every render, and building a theme is real colour maths.
  const theme = useMemo(() => {
    const resolved =
      appearance ??
      (followSystemAppearance && systemScheme === "light" ? "light" : undefined);
    return createNativeTheme({ appearance: resolved, color, radius });
  }, [appearance, color, radius, followSystemAppearance, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
