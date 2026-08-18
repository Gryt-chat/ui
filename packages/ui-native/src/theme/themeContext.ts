import { createContext } from "react";

import { darkTheme, type NativeTheme } from "./createNativeTheme";

/**
 * Defaults to dark with no provider mounted, matching `@gryt/ui`, which ships
 * its dark tokens on `:root`. A component rendered outside a provider is
 * therefore themed rather than blank — the failure mode stays "wrong palette"
 * instead of "no colours at all".
 */
export const ThemeContext = createContext<NativeTheme>(darkTheme);
