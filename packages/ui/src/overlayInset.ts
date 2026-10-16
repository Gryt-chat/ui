import { createContext, useContext } from "react";
import { popupCollisionPadding } from "./components/utils/styles";

/**
 * Pixels at the top of the window that popups must stay out of, such as a desktop
 * title bar drawn by the app (GRYT-1784). Set through `GrytProvider`'s `overlayInsetTop`.
 */
export const OverlayInsetContext = createContext(0);

type Padding = number | { top: number; right: number; bottom: number; left: number };

/** Collision padding for a positioner: `base` on every side, plus the inset on top. */
export function usePopupCollisionPadding(base: number = popupCollisionPadding): Padding {
  const top = useContext(OverlayInsetContext);
  return top > 0 ? { top: base + top, right: base, bottom: base, left: base } : base;
}

