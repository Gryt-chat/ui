import { describe, expect, it } from "vitest";
import { sampleCurve, springSamples, springTightSamples } from "@gryt/theme";
import { easeSpring, easeSpringTight } from "./easing";

/**
 * The easings interpolate their samples inline instead of calling
 * `sampleCurve`, because a worklet cannot call a JS-thread function — doing so
 * throws "[Worklets] Tried to synchronously call a Remote Function" on the
 * first frame of every animation, which is how 0.3.0 shipped with unusable
 * motion.
 *
 * That duplication is the cost of running on the UI thread. These assert the
 * two implementations stay identical, so the copy cannot drift from the shared
 * definition the web renders from.
 */
describe("the inlined easing matches sampleCurve", () => {
  const pairs = [
    ["easeSpring", easeSpring, springSamples],
    ["easeSpringTight", easeSpringTight, springTightSamples]
  ] as const;

  for (const [name, easing, samples] of pairs) {
    it(`${name} agrees across the domain`, () => {
      for (let step = 0; step <= 200; step += 1) {
        const t = step / 200;
        expect(easing(t)).toBeCloseTo(sampleCurve(samples, t), 12);
      }
    });

    it(`${name} agrees outside the domain`, () => {
      for (const t of [-1, -0.001, 1.001, 2]) {
        expect(easing(t)).toBeCloseTo(sampleCurve(samples, t), 12);
      }
    });

    it(`${name} pins its endpoints`, () => {
      expect(easing(0)).toBe(0);
      expect(easing(1)).toBe(1);
    });
  }

  it("the two curves are not the same curve", () => {
    // Guards against both easings accidentally being built from one list.
    expect(easeSpring(0.25)).not.toBeCloseTo(easeSpringTight(0.25), 3);
  });

  it("only the loose curve overshoots", () => {
    let loosePeak = 0;
    let tightPeak = 0;
    for (let step = 0; step <= 200; step += 1) {
      const t = step / 200;
      loosePeak = Math.max(loosePeak, easeSpring(t));
      tightPeak = Math.max(tightPeak, easeSpringTight(t));
    }
    expect(loosePeak).toBeGreaterThan(1);
    expect(tightPeak).toBeLessThanOrEqual(1);
  });
});
