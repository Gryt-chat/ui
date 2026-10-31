import { createContext, useContext, type ReactNode } from "react";

export interface OverlayInsets {
  left: number;
  right: number;
}

const OverlayInsetsContext = createContext<OverlayInsets>({ left: 0, right: 0 });

/**
 * Where sheets, bottom drawers and toasts may sit across the screen, for a window with
 * something they should keep off: a fold, or iPhone Duo's side strip.
 * Put it above `SheetProvider`, because a sheet reads it before it portals away.
 */
export function OverlayInsetsProvider({ value, children }: { value: OverlayInsets; children?: ReactNode }) {
  return <OverlayInsetsContext.Provider value={value}>{children}</OverlayInsetsContext.Provider>;
}

export function useOverlayInsets(): OverlayInsets {
  return useContext(OverlayInsetsContext);
}
