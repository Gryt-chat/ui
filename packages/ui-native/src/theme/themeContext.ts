import { createContext } from "react";

import { darkTheme, type NativeTheme } from "./createNativeTheme";

/**
 * Defaults to dark with no provider mounted, matching `@gryt/ui`, which ships its dark
 * tokens on `:root`. The failure mode stays "wrong palette" rather than "no colours".
 */
export const ThemeContext = createContext<NativeTheme>(darkTheme);
