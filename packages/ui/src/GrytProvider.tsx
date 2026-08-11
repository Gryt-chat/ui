import { Tooltip } from "@base-ui/react/tooltip";
import type { CSSProperties, ReactNode } from "react";
import { createGrytTheme } from "./theme/createGrytTheme";
import type { GrytThemeOptions } from "./theme/createGrytTheme";

export interface GrytProviderProps {
  children: ReactNode;
  // Either the object from createGrytTheme, or the options to build one from.
  theme?: CSSProperties | GrytThemeOptions;
  className?: string;
  // Shared hover delay for every Tooltip below this provider, in milliseconds.
  tooltipDelay?: number;
}

function isCssVariables(value: object): value is CSSProperties {
  return Object.keys(value).some((key) => key.startsWith("--"));
}

// There is no ThemeProvider and no CssBaseline any more. What a provider still
// has to do is put the theme variables somewhere the components can read them,
// and mount Base UI's tooltip provider so hover timing is shared between
// triggers rather than restarting at every one.
export function GrytProvider({
  children,
  className,
  theme,
  tooltipDelay = 400
}: GrytProviderProps) {
  const style =
    theme && isCssVariables(theme) ? theme : createGrytTheme(theme ?? {});

  return (
    <div className={className} style={style}>
      <Tooltip.Provider delay={tooltipDelay}>{children}</Tooltip.Provider>
    </div>
  );
}
