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
   * Render overlays inside this provider's element rather than in `document.body`.
   *
   * Off by default, and should stay off for an app with one theme: the body is
   * the right place for a popup, and `:root` already carries the variables it
   * needs. Turn it on when this provider is one theme inside a page that has
   * another — previewing a theme in a panel — where an overlay in the body
   * would come up in the surrounding page's colours instead (GRYT-242).
   */
  containOverlays?: boolean;
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
  tooltipDelay = 400,
  containOverlays = false
}: GrytProviderProps) {
  // A ref rather than state: Base UI's `container` accepts one, so the element
  // does not have to exist on the first render and nothing has to re-render
  // when it does.
  const containerRef = useRef<HTMLDivElement | null>(null);
  /**
   * No theme, no variables.
   *
   * This used to paint the full default palette onto the wrapper whenever the
   * prop was absent, which looked harmless and was not: the stylesheet already
   * declares those values on :root, so the copy added nothing, and it sat below
   * the root in the cascade — an app that themed itself the documented way, by
   * putting variables on the root element where overlays can reach them, found
   * every one of them overridden by a provider re-stating the defaults.
   *
   * It cost this site an afternoon. The header can put the docs in Nord now,
   * and the reason it could not before was one div.
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
