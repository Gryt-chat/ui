import { useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import {
  createNativeTheme,
  type FontFaces,
  type GrytAppearance,
  type NativeThemeOptions,
} from "./createNativeTheme";
import { ThemeContext } from "./themeContext";

export interface GrytThemeProviderProps {
  appearance?: GrytAppearance;
  color?: NativeThemeOptions["color"];
  radius?: NativeThemeOptions["radius"];
  /**
   * The faces this app has registered, by the names React Native knows them as. The library
   * ships no font files; leave it out and everything falls back to the platform default.
   */
  fonts?: FontFaces;
  /**
   * Follow the OS setting when `appearance` is not given. The web equivalent is a
   * `prefers-color-scheme` media query, which the client already honours.
   */
  followSystemAppearance?: boolean;
  children?: ReactNode;
}

export function GrytThemeProvider({
  appearance,
  color,
  radius,
  fonts,
  followSystemAppearance = false,
  children,
}: GrytThemeProviderProps) {
  const systemScheme = useColorScheme();

  // Named props rather than a spread options object, so the dependencies are the actual
  // inputs. Spreading meant a stale theme or rebuilding every ramp on every render.
  const theme = useMemo(() => {
    const resolved =
      appearance ??
      (followSystemAppearance && systemScheme === "light" ? "light" : undefined);
    return createNativeTheme({ appearance: resolved, color, radius, fonts });
  }, [appearance, color, radius, fonts, followSystemAppearance, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
