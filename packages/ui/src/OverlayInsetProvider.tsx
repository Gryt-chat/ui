"use client";

import type { ReactNode } from "react";
import { OverlayInsetContext } from "./overlayInset";

/** Sets the inset for popups below it without a whole `GrytProvider`, for an app that
    themes itself and only needs this (GRYT-1784). */
export function OverlayInsetProvider({ top, children }: { top: number; children: ReactNode }) {
  return <OverlayInsetContext.Provider value={top}>{children}</OverlayInsetContext.Provider>;
}
