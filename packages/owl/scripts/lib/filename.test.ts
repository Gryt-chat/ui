import { describe, expect, it } from "vitest";

import { ACCESSORY_SLOTS } from "../../src/index";
import { EMPTY_WEIGHT, SLOT_PRESENCE } from "../../src/accessories";
import { isIgnored, placementFor, weightsFor, type Rarity } from "./filename";

const place = (file: string) => placementFor(file, ACCESSORY_SLOTS);

describe("where a drawing goes", () => {
  it("reads the slot off a word in the name", () => {
    expect(place("Winter_Hat.svg").slot).toBe("head");
    expect(place("Heart_Glasses.svg").slot).toBe("eyewear");
    expect(place("Sleepy_Eyes.svg").slot).toBe("expression");
    expect(place("Pearl_Necklace.svg").slot).toBe("neck");
    expect(place("Winter_Jacket.svg").slot).toBe("body");
  });

  it("does not care which word carries it", () => {
    expect(place("Winter_Hat.svg").slot).toBe(place("Hat_Winter.svg").slot);
  });

  it("names the accessory from the words", () => {
    expect(place("Pearl_Necklace.svg").name).toBe("pearl-necklace");
    expect(place("Hoodie.covers-head.svg").name).toBe("hoodie");
  });

  /*
   * The failure this exists to prevent. A word nobody has taught it is a file
   * that stops the run by name, because the alternative is a scarf worn as a
   * hat and nothing saying so.
   */
  it("refuses a word it does not know rather than guessing", () => {
    expect(place("Cravat_Fancy.svg").slot).toBe("neck");
    expect(() => place("Sporran.svg")).toThrow(/no word in "sporran" says which slot/);
  });

  it("says how to fix it", () => {
    expect(() => place("Sporran.svg")).toThrow(/Sporran\.head\.svg/);
  });

  it("refuses a name that says two different things", () => {
    expect(() => place("Glasses_Hat.svg")).toThrow(/says eyewear.*says head|says head.*says eyewear/);
  });

  it("takes an explicit slot tag over the words", () => {
    expect(place("Sporran.neck.svg").slot).toBe("neck");
    // And over a word that would have said otherwise.
    expect(place("Winter_Hat.neck.svg").slot).toBe("neck");
  });

  it("refuses a tag it does not understand", () => {
    expect(() => place("Winter_Hat.shiny.svg")).toThrow(/".shiny" is not a tag/);
  });
});

describe("what a drawing takes off the bird", () => {
  it("gives a garment the collar by default", () => {
    expect(place("Winter_Jacket.svg").excludes).toEqual(["neck"]);
  });

  it("adds a hood on top of that when asked", () => {
    expect(place("Hoodie.covers-head.svg").excludes.sort()).toEqual(["head", "neck"]);
  });

  it("leaves everything else alone", () => {
    expect(place("Winter_Hat.svg").excludes).toEqual([]);
  });

  it("refuses to cover something that is not a slot", () => {
    expect(() => place("Hoodie.covers-wings.svg")).toThrow(/"wings" is not a slot/);
  });
});

describe("layers", () => {
  it("takes the slot's default", () => {
    expect(place("Winter_Hat.svg").layer).toBe("overAll");
    expect(place("Round_Glasses.svg").layer).toBe("overEyes");
    expect(place("Sleepy_Eyes.svg").layer).toBe("overFace");
  });

  it("lets a drawing say otherwise", () => {
    expect(place("Round_Glasses.over-face.svg").layer).toBe("overFace");
  });
});

describe("files that are not accessories", () => {
  /*
   * Winter_Hat_Small.svg is why. It was exported over the top of Winter_Hat.svg
   * and is byte-identical to it, so with the folder scanned rather than listed
   * it would have quietly become a second, identical hat.
   */
  it("walks past a leading underscore", () => {
    expect(isIgnored("_Winter_Hat_Small.svg")).toBe(true);
    expect(isIgnored("Winter_Hat.svg")).toBe(false);
  });
});

describe("rarity", () => {
  it("is common unless the filename says otherwise", () => {
    expect(place("Winter_Hat.svg").rarity).toBe("common");
    expect(place("Winter_Hat.rare.svg").rarity).toBe("rare");
  });

  it("splits a slot without changing how often the slot is filled", () => {
    const slot = "head" as const;
    const items = (rarities: Rarity[]) =>
      rarities.map((rarity, i) => ({ name: `hat-${i}`, slot, rarity }));

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
        { name: "plain", slot: "head" as const, rarity: "common" as Rarity },
        { name: "fancy", slot: "head" as const, rarity: "scarce" as Rarity },
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
      rarity: "scarce" as Rarity,
    }));
    const w = weightsFor(many, SLOT_PRESENCE, EMPTY_WEIGHT.head);
    expect(Math.min(...w.values())).toBeGreaterThan(0);
  });
});
