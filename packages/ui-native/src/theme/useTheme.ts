import { useContext } from "react";

import { ThemeContext } from "./themeContext";
import type { NativeTheme } from "./createNativeTheme";

/**
 * The web reads tokens off the cascade, so a component never asks for a theme —
 * it inherits one. React Native has no cascade, so components ask, and this is
 * what they ask.
 */
export function useTheme(): NativeTheme {
  return useContext(ThemeContext);
}
