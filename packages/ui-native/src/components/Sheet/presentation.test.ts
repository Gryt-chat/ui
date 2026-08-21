import { describe, expect, it } from "vitest";

import { nextPresentation } from "./presentation";

describe("nextPresentation", () => {
  it("presents when it is asked to open", () => {
    expect(nextPresentation(true, false)).toEqual({ action: "present", presented: true });
  });

  it("dismisses a sheet that is on screen", () => {
    expect(nextPresentation(false, true)).toEqual({ action: "dismiss", presented: false });
  });

  /**
   * The mount case. A closed sheet runs its effect once, and dismissing a modal
   * the provider has never presented takes it out of the registry for good.
   */
  it("does nothing to a sheet that has never been presented", () => {
    expect(nextPresentation(false, false)).toEqual({ action: "none", presented: false });
  });

  /**
   * The flick-down case, which is the one this got wrong.
   *
   * The modal dismisses itself and then reports it, so by the time the effect
   * runs the sheet is already gone — and dismissing it again is the same
   * unregistering call as the mount case, arriving by the other door.
   */
  it("does nothing after the sheet dismissed itself", () => {
    const { presented } = nextPresentation(true, false);
    /* What `onDismiss` records before it tells the parent. */
    const afterFlick = false;
    expect(presented).toBe(true);
    expect(nextPresentation(false, afterFlick)).toEqual({ action: "none", presented: false });
  });

  it("opens again after that", () => {
    expect(nextPresentation(true, false)).toEqual({ action: "present", presented: true });
  });
});
