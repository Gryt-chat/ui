import { createContext, useContext } from "react";

export interface OverlayInsets {
  left: number;
  right: number;
}

const OverlayInsetsContext = createContext<OverlayInsets>({ left: 0, right: 0 });

/**
 * Keeps sheets, bottom drawers and toasts off a fold or iPhone Duo's side strip.
 * Goes above `SheetProvider`, because a sheet reads it before it portals away.
 */
export const OverlayInsetsProvider = OverlayInsetsContext.Provider;

export function useOverlayInsets(): OverlayInsets {
  return useContext(OverlayInsetsContext);
}
