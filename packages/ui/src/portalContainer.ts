import { createContext, useContext } from "react";
import type { RefObject } from "react";

/**
 * Where overlays below this point should render.
 *
 * Base UI portals a popup to `document.body`, which is outside whatever element
 * GrytProvider put the theme variables on. For an app with one theme that is
 * exactly right — the overlay wants the app's theme and it gets it from
 * `:root`. It is wrong only when a second theme is being rendered inside a
 * page: the docs site previews a theme in a panel, and a Select or Tooltip
 * opened inside that panel comes up in the site's own colours (GRYT-242).
 *
 * Deliberately a context rather than a prop on each component. Select carries a
 * long comment about why its popup portals to the body — a popup left inside a
 * positioned dialog lands hundreds of pixels off — and a per-call `container`
 * prop is exactly the thing somebody reaches for to fix a layout problem, which
 * is how that bug got made the first time. A container that is set once, for a
 * subtree, by whoever established the theme, cannot be used that way by
 * accident.
 *
 * Base UI has no equivalent to reuse. Its own `PortalContext` is a boolean —
 * "am I inside a portal" — not a carrier for the container.
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
