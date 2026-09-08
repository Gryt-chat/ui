import { describe, expect, it } from "vitest";

import { reachOf, seedFor } from "./drawerPull";

/**
 * The property worth having, rather than the arithmetic. The release is the interesting
 * part: the larger of two numbers still shrinks if the falling one starts above the rising.
 */

describe("reachOf", () => {
  it("is the pull while only the finger is moving", () => {
    expect(reachOf(0, 0.42)).toBe(0.42);
  });

  it("is the spring when nobody is dragging", () => {
    expect(reachOf(0.8, 0)).toBe(0.8);
  });

  it("holds at the open end while a stale drag is still counted", () => {
    expect(reachOf(1, 0.5)).toBe(1);
  });
});

describe("the release", () => {
  /**
   * What made this necessary. Without the seed the spring runs from 0 while the pull falls
   * from where the finger was, and for a few frames the panel goes backwards.
   */
  it("goes backwards if the spring starts from nothing", () => {
    const fromZero = [0, 0.1, 0.35, 0.62, 0.85, 1];
    const pull = [0.6, 0.6, 0.45, 0.3, 0.15, 0];

    const seen = fromZero.map((p, i) => reachOf(p, pull[i]));
    const dips = seen.some((now, i) => i > 0 && now < seen[i - 1]);
    expect(dips).toBe(true);
  });

  it("does not, once the spring starts where the finger left off", () => {
    const seed = seedFor(0, 0.6);
    expect(seed).toBe(0.6);

    /* The same spring, from the seed rather than from zero. The pull falls on its own clock
       and never matters again, so the caller can clear it the moment it commits. */
    const spring = [seed, 0.68, 0.79, 0.9, 0.97, 1];
    const pull = [0.6, 0.45, 0.3, 0.15, 0.05, 0];

    let previous = 0;
    for (let i = 0; i < spring.length; i++) {
      const now = reachOf(spring[i], pull[i]);
      expect(now).toBeGreaterThanOrEqual(previous);
      previous = now;
    }
    expect(previous).toBe(1);
  });

  it("clearing the pull immediately is safe once seeded", () => {
    const seed = seedFor(0, 0.6);
    /* The caller's simplest possible commit: set open, drop pull to 0 on the
       same frame. Nothing should move backwards. */
    expect(reachOf(seed, 0)).toBe(0.6);
  });

  it("falls smoothly when a drag is abandoned rather than committed", () => {
    const pull = [0.4, 0.31, 0.19, 0.08, 0];
    expect(pull.map((p) => reachOf(0, p))).toEqual(pull);
  });
});
