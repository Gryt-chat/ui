import { describe, expect, it } from "vitest";

import { ACCESSORY_SLOTS } from "../../src/index";
import { EMPTY_WEIGHT, SLOT_PRESENCE } from "../../src/accessories";
import { isIgnored, placementFor, weightsFor, type Rarity } from "./filename";

const place = (file: string) => placementFor(file, ACCESSORY_SLOTS);

describe("where a drawing goes", () => {
  it("reads the slot off the type field", () => {
    expect(place("hat_winter.svg").slot).toBe("head");
    expect(place("glasses_heart.svg").slot).toBe("eyewear");
    expect(place("eyes_sleepy.svg").slot).toBe("expression");
    expect(place("necklace_pearl.svg").slot).toBe("neck");
    expect(place("jacket_winter.svg").slot).toBe("body");
  });

  /*
   * The type field only. A family called "bow" under glasses is a shape of
   * frame, and reading every field would have made that fight with the "bow"
   * that means a hair bow.
   */
  it("reads only the type, not any word in the name", () => {
    expect(place("glasses_bow.svg").slot).toBe("eyewear");
    expect(place("hat_glasses-case.svg").slot).toBe("head");
  });

  it("names the accessory from all of its fields", () => {
    expect(place("necklace_pearl.svg").name).toBe("necklace-pearl");
    expect(place("glasses_round_gold.svg").name).toBe("glasses-round-gold");
    expect(place("hoodie.covers-head.svg").name).toBe("hoodie");
  });

  it("takes a type on its own as its own family", () => {
    const scarf = place("scarf.svg");
    expect(scarf.name).toBe("scarf");
    expect(scarf.family).toBe("scarf");
    expect(scarf.variant).toBe("");
  });

  it("groups variants of one thing into a family", () => {
    const gold = place("glasses_round_gold.svg");
    const black = place("glasses_round_black.svg");
    expect(gold.family).toBe(black.family);
    expect(gold.variant).toBe("gold");
    expect(gold.name).not.toBe(black.name);
  });

  it("keeps two families of one type apart", () => {
    expect(place("glasses_round.svg").family).not.toBe(place("glasses_heart.svg").family);
  });

  it("refuses a fourth field rather than guessing which is which", () => {
    expect(() => place("glasses_round_gold_shiny.svg")).toThrow(/has 4 fields/);
  });

  /*
   * The failure this exists to prevent. A word nobody has taught it is a file
   * that stops the run by name, because the alternative is a scarf worn as a
   * hat and nothing saying so.
   */
  it("refuses a type it does not know rather than guessing", () => {
    expect(place("cravat_fancy.svg").slot).toBe("neck");
    expect(() => place("sporran_dress.svg")).toThrow(/"sporran" is not a type this knows/);
  });

  it("says how to fix it", () => {
    expect(() => place("sporran_dress.svg")).toThrow(/sporran_dress\.head\.svg/);
  });

  it("takes an explicit slot tag over the type", () => {
    expect(place("sporran_dress.neck.svg").slot).toBe("neck");
    expect(place("hat_winter.neck.svg").slot).toBe("neck");
  });

  it("refuses a tag it does not understand", () => {
    expect(() => place("hat_winter.shiny.svg")).toThrow(/".shiny" is not a tag/);
  });
});

describe("what a drawing takes off the bird", () => {
  it("gives a garment the collar by default", () => {
    expect(place("jacket_winter.svg").excludes).toEqual(["neck"]);
  });

  it("adds a hood on top of that when asked", () => {
    expect(place("hoodie.covers-head.svg").excludes.sort()).toEqual(["head", "neck"]);
  });

  it("leaves everything else alone", () => {
    expect(place("hat_winter.svg").excludes).toEqual([]);
  });

  it("refuses to cover something that is not a slot", () => {
    expect(() => place("hoodie.covers-wings.svg")).toThrow(/"wings" is not a slot/);
  });
});

describe("layers", () => {
  it("takes the slot's default", () => {
    expect(place("hat_winter.svg").layer).toBe("overAll");
    expect(place("glasses_round.svg").layer).toBe("overEyes");
    expect(place("eyes_sleepy.svg").layer).toBe("overFace");
  });

  it("lets a drawing say otherwise", () => {
    expect(place("glasses_round.over-face.svg").layer).toBe("overFace");
  });
});

describe("files that are not accessories", () => {
  /*
   * _hat_winter_small.svg is why. It was exported over the top of hat_winter.svg
   * and is byte-identical to it, so with the folder scanned rather than listed
   * it would have quietly become a second, identical hat.
   */
  it("walks past a leading underscore", () => {
    expect(isIgnored("_hat_winter_small.svg")).toBe(true);
    expect(isIgnored("hat_winter.svg")).toBe(false);
  });
});

describe("rarity", () => {
  it("is common unless the filename says otherwise", () => {
    expect(place("hat_winter.svg").rarity).toBe("common");
    expect(place("hat_winter.rare.svg").rarity).toBe("rare");
  });

  it("splits a slot without changing how often the slot is filled", () => {
    const slot = "head" as const;
    const items = (rarities: Rarity[]) =>
      rarities.map((rarity, i) => ({
        name: `hat-${i}`,
        slot,
        family: `hat-${i}`,
        rarity,
      }));

    const fill = (rarities: Rarity[]) => {
      const w = weightsFor(items(rarities), SLOT_PRESENCE, EMPTY_WEIGHT[slot]);
      const total = [...w.values()].reduce((a, b) => a + b, 0);
      return total / (total + EMPTY_WEIGHT[slot]);
    };

    // Three hats or thirty, common or scarce: head stays as likely to be worn.
    for (const set of [
      ["common", "common", "common"],
      ["common", "rare", "scarce"],
      Array.from({ length: 30 }, () => "common" as Rarity),
    ] as Rarity[][]) {
      // Not exact: weights are whole numbers, so a slot lands within about
      // half a percent of the rate asked for rather than on it.
      expect(Math.abs(fill(set) - SLOT_PRESENCE[slot])).toBeLessThan(0.01);
    }
  });

  it("makes a rare drawing lose to a common one in the same slot", () => {
    const w = weightsFor(
      [
        { name: "plain", slot: "head" as const, family: "plain", rarity: "common" as Rarity },
        { name: "fancy", slot: "head" as const, family: "fancy", rarity: "scarce" as Rarity },
      ],
      SLOT_PRESENCE,
      EMPTY_WEIGHT.head,
    );
    expect(w.get("fancy")!).toBeLessThan(w.get("plain")!);
  });

  it("never leaves a drawing at zero, which would make it unwearable", () => {
    const many = Array.from({ length: 200 }, (_, i) => ({
      name: `hat-${i}`,
      slot: "head" as const,
      family: `hat-${i}`,
      rarity: "scarce" as Rarity,
    }));
    const w = weightsFor(many, SLOT_PRESENCE, EMPTY_WEIGHT.head);
    expect(Math.min(...w.values())).toBeGreaterThan(0);
  });
});
