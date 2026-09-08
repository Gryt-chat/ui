/**
 * Whether a sheet should be presented, dismissed, or left alone. `dismiss()` must only be
 * called on a modal that is presented, or it is unregistered and never opens again.
 */
export type SheetAction = "present" | "dismiss" | "none";

export interface SheetPresentation {
  action: SheetAction;
  /** What `presented` becomes. The caller stores it. */
  presented: boolean;
}

export function nextPresentation(open: boolean, presented: boolean): SheetPresentation {
  if (open) return { action: "present", presented: true };
  if (presented) return { action: "dismiss", presented: false };
  return { action: "none", presented: false };
}
