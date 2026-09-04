import { createContext, useContext } from "react";
import type { RefObject } from "react";

/**
 * Where overlays below this point should render. Base UI portals a popup to
 * `document.body`, which is outside whatever element GrytProvider put the theme
 * variables on — right for an app with one theme, wrong when a second is
 * previewed in a panel (GRYT-242).
 *
 * **A context rather than a prop on each component.** A per-call `container` is
 * what somebody reaches for to fix a layout problem, which is how Select's
 * popup ended up inside a positioned dialog and hundreds of pixels off.
 */
export const PortalContainerContext = createContext<
  RefObject<HTMLElement | null> | undefined
>(undefined);

/**
 * The container overlays should portal into, or `undefined` for Base UI's
 * default of `document.body`.
 */
export function usePortalContainer(): RefObject<HTMLElement | null> | undefined {
  return useContext(PortalContainerContext);
}
