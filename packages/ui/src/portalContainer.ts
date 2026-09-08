import { createContext, useContext } from "react";
import type { RefObject } from "react";

/**
 * Where overlays below this point should render. Base UI portals to `document.body`, which
 * is wrong when a second theme is previewed in a panel (GRYT-242). A context, not a prop.
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
