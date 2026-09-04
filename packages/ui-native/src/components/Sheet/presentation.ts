/**
 * Whether a sheet should be presented, dismissed, or left alone.
 *
 * A three-line decision in its own file, for the reason `sliderValue.ts` and
 * `placePopup.ts` are: it is the part a screenshot cannot check, and it has now
 * been wrong twice.
 *
 * **`dismiss()` must only be called on a modal that is actually presented.**
 * `@gorhom/bottom-sheet`'s provider keeps a registry of presented sheets, and
 * dismissing one that is not in it takes it out — after which `present()` is a
 * no-op and the sheet never opens again. It looks exactly like the `open` prop
 * being ignored.
 *
 * Two ways to end up asking. A sheet that has never been on screen runs its
 * effect once on mount with `open` false. And a flick down dismisses the modal
 * itself and *then* tells React, so the effect that follows would dismiss it a
 * second time.
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
