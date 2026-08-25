import { describe, expect, it } from "vitest";

import { pickWeighted, pickWeightedByName, unit } from "./rng";

/*
 * The property the accessory draw was changed for. Everything else in this file
 * is here to show that the change did not cost anything to get it.
 */
describe("adding a candidate", () => {
  const empty = ["", "", 700] as const;
  const three = [empty, ["a", "a", 100], ["b", "b", 100], ["c", "c", 100]] as const;
  const four = [...three, ["d", "d", 100]] as const;

  it("only takes owls, never trades two others against each other", () => {
    let took = 0;

    for (let i = 0; i < 20_000; i += 1) {
      const seed = `seed-${i}`;
      const before = pickWeightedByName(seed, "wear:head", three);
      const after = pickWeightedByName(seed, "wear:head", four);

      if (before === after) continue;

      // The only licensed change: this seed now gets the new one. Anything
      // else means a fourth drawing moved somebody who did not get it, which
      // is what the shared range used to do to a fifth of everybody.
      took += 1;
      expect(after).toBe("d");
    }

    // And it does take some, or the test is passing for the wrong reason.
    expect(took).toBeGreaterThan(1000);
  });

  it("does the same for the old draw only by accident", () => {
    const flat = three.map(([v, , w]) => [v, w] as const);
    const flatFour = four.map(([v, , w]) => [v, w] as const);

    let movedWithoutGettingIt = 0;
    for (let i = 0; i < 20_000; i += 1) {
      const seed = `seed-${i}`;
      const before = pickWeighted(seed, "wear:head", flat);
      const after = pickWeighted(seed, "wear:head", flatFour);
      if (before !== after && after !== "d") movedWithoutGettingIt += 1;
    }

    // Not an assertion about what is correct — a record of what the shared
    // range does, so the reason for the other function does not get lost.
    expect(movedWithoutGettingIt).toBeGreaterThan(2000);
  });
});

describe("the by-name draw", () => {
  it("respects the weights", () => {
    const entries = [
      ["none", "", 500] as const,
      ["common", "common", 300] as const,
      ["rare", "rare", 100] as const,
      ["scarce", "scarce", 100] as const,
    ];

    const counts = new Map<string, number>();
    const N = 40_000;
    for (let i = 0; i < N; i += 1) {
      const got = pickWeightedByName(`seed-${i}`, "wear:head", entries)!;
      counts.set(got, (counts.get(got) ?? 0) + 1);
    }

    for (const [value, , weight] of entries) {
      expect((counts.get(value) ?? 0) / N).toBeCloseTo(weight / 1000, 2);
    }
  });

  it("gives the same answer whatever order the candidates arrive in", () => {
    const entries = [
      ["none", "", 500] as const,
      ["a", "a", 200] as const,
      ["b", "b", 200] as const,
      ["c", "c", 100] as const,
    ];
    const reversed = [...entries].reverse();

    for (let i = 0; i < 5_000; i += 1) {
      const seed = `seed-${i}`;
      expect(pickWeightedByName(seed, "wear:head", reversed)).toBe(
        pickWeightedByName(seed, "wear:head", entries),
      );
    }
  });

  it("never picks something that cannot be worn", () => {
    const entries = [
      ["none", "", 100] as const,
      ["unwearable", "unwearable", 0] as const,
    ];
    for (let i = 0; i < 2_000; i += 1) {
      expect(pickWeightedByName(`seed-${i}`, "wear:head", entries)).toBe("none");
    }
  });

  it("has nothing to give when every candidate is unwearable", () => {
    expect(pickWeightedByName("x", "wear:head", [["a", "a", 0] as const])).toBeUndefined();
  });

  /*
   * The keys are rounded before they are compared, because `Math.log` is
   * allowed to land a bit apart on two JavaScript engines and the desktop app
   * and the phone have to draw one person the same way. Rounding makes an
   * exact tie possible where there would otherwise be none, so the name breaks
   * it — never the iteration order.
   *
   * Two candidates sharing an id would tie on every seed and the name could not
   * separate them. That cannot arise: an id here is an accessory name, and the
   * generator refuses two drawings that would take the same one.
   */
  it("gives the same answer at every rounding, not only the current one", () => {
    // A weight ratio that lands keys close together, run wide enough that any
    // order-dependence in the comparison would show up somewhere.
    const near = [
      ["a", "a", 100] as const,
      ["b", "b", 101] as const,
      ["c", "c", 99] as const,
    ];
    for (let i = 0; i < 20_000; i += 1) {
      const seed = `seed-${i}`;
      const forwards = pickWeightedByName(seed, "wear:head", near);
      for (const order of [[...near].reverse(), [near[1], near[2], near[0]]]) {
        expect(pickWeightedByName(seed, "wear:head", order)).toBe(forwards);
      }
    }
  });
});

describe("unit", () => {
  it("stays inside [0, 1)", () => {
    for (let i = 0; i < 10_000; i += 1) {
      const u = unit(`seed-${i}`, "channel");
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
  });

  it("never returns zero, which would make a log key infinite", () => {
    for (let i = 0; i < 50_000; i += 1) {
      expect(unit(`seed-${i}`, "wear:head::name")).toBeGreaterThan(0);
    }
  });
});
