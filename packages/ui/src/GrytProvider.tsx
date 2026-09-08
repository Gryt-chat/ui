import { Tooltip } from "@base-ui/react/tooltip";
import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createGrytTheme } from "@gryt/theme";
import type { GrytThemeOptions } from "@gryt/theme";
import { PortalContainerContext } from "./portalContainer";

export interface GrytProviderProps {
  children: ReactNode;
  // Either the object from createGrytTheme, or the options to build one from.
  theme?: CSSProperties | GrytThemeOptions;
  className?: string;
  // Shared hover delay for every Tooltip below this provider, in milliseconds.
  tooltipDelay?: number;
  /**
   * Render overlays inside this provider's element rather than in `document.body`. Off by
   * default; turn it on when this provider is one theme inside another page (GRYT-242).
   */
  containOverlays?: boolean;
}

function isCssVariables(value: object): value is CSSProperties {
  return Object.keys(value).some((key) => key.startsWith("--"));
}

// What a provider has to do is put the theme variables where the components can read them,
// and mount Base UI's tooltip provider so hover timing is shared between triggers.
export function GrytProvider({
  children,
  className,
  theme,
  tooltipDelay = 400,
  containOverlays = false
}: GrytProviderProps) {
  // A ref rather than state: Base UI's `container` accepts one, so the element need not
  // exist on the first render and nothing has to re-render when it does.
  const containerRef = useRef<HTMLDivElement | null>(null);
  /**
   * No theme, no variables. The stylesheet declares them on `:root`, and a wrapper
   * re-stating the defaults sits below the root and overrides an app's own theming.
   */
  const style =
    theme === undefined
      ? undefined
      : isCssVariables(theme)
        ? theme
        : createGrytTheme(theme);

  return (
    <div className={className} style={style} ref={containerRef}>
      <PortalContainerContext.Provider
        value={containOverlays ? containerRef : undefined}
      >
        <Tooltip.Provider delay={tooltipDelay}>{children}</Tooltip.Provider>
      </PortalContainerContext.Provider>
    </div>
  );
}
