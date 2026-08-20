import { describe, expect, it } from "vitest";
import {
  grytDurations,
  grytScaleSteps,
  sampleCurve,
  springSamples,
  springTightSamples
} from "./motion";

describe("sampleCurve", () => {
  it("pins both ends", () => {
    expect(sampleCurve(springSamples, 0)).toBe(0);
    expect(sampleCurve(springSamples, 1)).toBe(1);
    expect(sampleCurve(springTightSamples, 0)).toBe(0);
    expect(sampleCurve(springTightSamples, 1)).toBe(1);
  });

  it("clamps outside 0..1 rather than extrapolating", () => {
    expect(sampleCurve(springSamples, -1)).toBe(0);
    expect(sampleCurve(springSamples, 2)).toBe(1);
  });

  it("interpolates between samples", () => {
    // Exactly halfway between the first two points.
    const halfStep = 0.5 / (springSamples.length - 1);
    const expected = (springSamples[0]! + springSamples[1]!) / 2;
    expect(sampleCurve(springSamples, halfStep)).toBeCloseTo(expected, 10);
  });

  it("lands on a sample exactly when t lines up with one", () => {
    const step = 1 / (springSamples.length - 1);
    expect(sampleCurve(springSamples, step * 7)).toBeCloseTo(springSamples[7]!, 10);
  });
});

describe("the two curves differ in the way they are documented to", () => {
  it("the loose spring overshoots, and by about 12%", () => {
    const peak = Math.max(...springSamples);
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeCloseTo(1.12, 2);
  });

  it("the tight spring never passes its target", () => {
    // This is the whole reason it exists: a slider thumb on the loose curve
    // ended up 96px outside a 919px track.
    expect(Math.max(...springTightSamples)).toBeLessThanOrEqual(1);
  });

  it("both are monotonic at the start and settle at 1", () => {
    for (const samples of [springSamples, springTightSamples]) {
      expect(samples[0]).toBe(0);
      expect(samples[samples.length - 1]).toBe(1);
      expect(samples[1]).toBeGreaterThan(samples[0]!);
    }
  });
});

describe("tokens", () => {
  it("keeps the durations the stylesheet documents", () => {
    expect(grytDurations.spring).toBe(500);
    expect(grytDurations.springSoft).toBe(700);
  });

  it("presses in and hovers out", () => {
    for (const step of Object.values(grytScaleSteps)) {
      expect(step.press).toBeLessThan(1);
      expect(step.hover).toBeGreaterThan(1);
    }
  });
});
