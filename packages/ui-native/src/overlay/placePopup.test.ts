import { describe, expect, it } from "vitest";

import { placePopup } from "./placePopup";

const screen = { width: 390, height: 844 };
const popup = { width: 200, height: 120 };

describe("placePopup", () => {
  it("sits below the anchor and centres on it by default", () => {
    const p = placePopup({ x: 100, y: 200, width: 80, height: 40 }, popup, screen);
    expect(p.side).toBe("bottom");
    expect(p.top).toBe(248);
    expect(p.left).toBe(40);
  });

  it("flips above when there is no room below and more room above", () => {
    const p = placePopup({ x: 100, y: 760, width: 80, height: 40 }, popup, screen);
    expect(p.side).toBe("top");
    expect(p.top).toBeLessThan(760);
  });

  it("does not flip into somewhere equally cramped", () => {
    // Anchor near the top: below is tight, above is tighter. Staying put is right.
    const p = placePopup({ x: 100, y: 20, width: 80, height: 40 }, popup, screen);
    expect(p.side).toBe("bottom");
  });

  it("clamps a popup wider than the screen allows", () => {
    const wide = { width: 380, height: 100 };
    const p = placePopup({ x: 360, y: 100, width: 20, height: 20 }, wide, screen);
    expect(p.left).toBeGreaterThanOrEqual(0);
    expect(p.left + wide.width).toBeLessThanOrEqual(screen.width);
  });

  it("aligns to the anchor's edges on request", () => {
    const anchor = { x: 100, y: 200, width: 240, height: 40 };
    expect(placePopup(anchor, popup, screen, { align: "start" }).left).toBe(100);
    // end puts the popup's right edge on the anchor's: 100 + 240 - 200.
    expect(placePopup(anchor, popup, screen, { align: "end" }).left).toBe(140);
  });

  it("clamping wins over alignment", () => {
    // A popup wider than its anchor, aligned end, wants to start at -20. It is
    // more important that it stays on screen than that it lines up.
    const anchor = { x: 100, y: 200, width: 80, height: 40 };
    expect(placePopup(anchor, popup, screen, { align: "end" }).left).toBe(8);
  });

  it("reports the room available so a popup can cap its own height", () => {
    const p = placePopup({ x: 10, y: 700, width: 80, height: 40 }, popup, screen);
    expect(p.maxHeight).toBeGreaterThan(0);
    expect(p.maxHeight).toBeLessThan(screen.height);
  });
});
