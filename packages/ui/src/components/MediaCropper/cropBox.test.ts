import { describe, expect, it } from "vitest";

import { initialBox, isAnimated, moveBox, resizeBox, scaleBox } from "./cropBox";

describe("crop box", () => {
  it("starts as the largest centred box of the shape", () => {
    expect(initialBox(1200, 800, 1)).toEqual({ x: 200, y: 0, w: 800 });
    expect(initialBox(800, 1200, 1)).toEqual({ x: 0, y: 200, w: 800 });
  });
  it("never leaves the media when moved, resized or scaled", () => {
    expect(moveBox({ x: 200, y: 0, w: 800 }, 500, 500, 1200, 800, 1)).toEqual({ x: 400, y: 0, w: 800 });
    expect(resizeBox({ x: 200, y: 0, w: 800 }, "se", -100, -100, 1200, 800, 1, 80)).toEqual({ x: 200, y: 0, w: 700 });
    expect(resizeBox({ x: 400, y: 100, w: 400 }, "nw", -1000, -1000, 1200, 800, 1, 80)).toEqual({ x: 300, y: 0, w: 500 });
    expect(resizeBox({ x: 0, y: 0, w: 200 }, "se", -500, -500, 1200, 800, 1, 80).w).toBe(80);
    expect(scaleBox({ x: 0, y: 0, w: 800 }, 1000, 1200, 800, 1, 80)).toEqual({ x: 0, y: 0, w: 800 });
  });
  it("treats GIFs and videos as animated", () => {
    expect(isAnimated(new File([], "a.gif", { type: "image/gif" }))).toBe(true);
    expect(isAnimated(new File([], "a.mp4", { type: "video/mp4" }))).toBe(true);
    expect(isAnimated(new File([], "a.png", { type: "image/png" }))).toBe(false);
  });
});
