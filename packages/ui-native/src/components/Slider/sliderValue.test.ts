import { describe, expect, it } from "vitest";
import { valueAt, type SliderScale } from "./sliderValue";

const scale: SliderScale = { width: 200, min: 0, max: 100, step: 1 };

describe("valueAt", () => {
  it("maps the ends and the middle", () => {
    expect(valueAt(0, scale)).toBe(0);
    expect(valueAt(100, scale)).toBe(50);
    expect(valueAt(200, scale)).toBe(100);
  });

  it("clamps rather than running past the track", () => {
    expect(valueAt(-40, scale)).toBe(0);
    expect(valueAt(9999, scale)).toBe(100);
  });

  it("snaps to step", () => {
    expect(valueAt(101, { ...scale, step: 25 })).toBe(50);
    expect(valueAt(150, { ...scale, step: 25 })).toBe(75);
  });

  it("returns min before layout, rather than dividing by zero", () => {
    expect(valueAt(50, { ...scale, width: 0 })).toBe(0);
    expect(Number.isNaN(valueAt(50, { ...scale, width: 0 }))).toBe(false);
  });

  it("respects a min that is not zero", () => {
    const shifted: SliderScale = { width: 200, min: -50, max: 50, step: 1 };
    expect(valueAt(0, shifted)).toBe(-50);
    expect(valueAt(100, shifted)).toBe(0);
    expect(valueAt(200, shifted)).toBe(50);
  });
});

describe("dragging (GRYT-378)", () => {
  /**
   * PanResponder's `gesture.dx` is measured from where the gesture started, not
   * from the previous event. The thumb must therefore be positioned at
   * `origin + dx` — anchored once — and never at `currentPosition + dx`, which
   * adds the whole travel again on every move.
   *
   * The reported symptom was the thumb accelerating away from the finger while
   * tapping stayed correct.
   */
  it("tracks the finger instead of accelerating away from it", () => {
    const origin = 0;
    // Finger at 50, then 60, then 70 — so dx is 50, 60, 70.
    const values = [50, 60, 70].map((dx) => valueAt(origin + dx, scale));

    expect(values).toEqual([25, 30, 35]);
  });

  it("the old formula compounded, which is what this guards against", () => {
    // Reproduces the shipped bug: offset the live value's position by the
    // cumulative dx each time.
    let value = 0;
    const buggy = [50, 60, 70].map((dx) => {
      const position = ((value - scale.min) / (scale.max - scale.min)) * scale.width;
      value = valueAt(position + dx, scale);
      return value;
    });

    expect(buggy).toEqual([25, 55, 90]);
    expect(buggy).not.toEqual([25, 30, 35]);
  });

  it("a drag starting mid-track offsets from where the finger landed", () => {
    const origin = 100; // grabbed at the middle
    expect(valueAt(origin + 0, scale)).toBe(50);
    expect(valueAt(origin + 20, scale)).toBe(60);
    expect(valueAt(origin - 20, scale)).toBe(40);
  });
});
