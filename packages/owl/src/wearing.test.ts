import { describe, expect, it } from "vitest";

import { ACCESSORIES, ACCESSORY_SLOTS, accessoriesIn } from "./accessories";
import {
  EMPTY_FIELD,
  WORN_LENGTH,
  decodeWorn,
  encodeWorn,
  wornToOptions,
  type WornLook,
} from "./wearing";

const look: WornLook = {
  palette: "violet",
  scheme: "day",
  ears: "tufts",
  wearing: {
    expression: "eyes-happy",
    eyewear: "glasses-round",
    head: "hat-winter",
    neck: null,
    body: null,
  },
};

describe("a look as a string", () => {
  it("is the same length whatever is worn", () => {
    const bare = encodeWorn({ wearing: {} });
    expect(encodeWorn(look)).toHaveLength(WORN_LENGTH);
    expect(bare).toHaveLength(WORN_LENGTH);
  });

  it("survives the round trip", () => {
    const back = decodeWorn(encodeWorn(look));
    expect(back).not.toBeNull();
    expect(back!.palette).toBe("violet");
    expect(back!.scheme).toBe("day");
    expect(back!.ears).toBe("tufts");
    expect(back!.wearing.expression).toBe("eyes-happy");
    expect(back!.wearing.head).toBe("hat-winter");
    expect(back!.wearing.neck).toBeNull();
  });

  it("keeps an empty slot as a decision rather than an absence", () => {
    const encoded = encodeWorn(look);
    const neckAt = ACCESSORY_SLOTS.indexOf("neck") * 2;
    expect(encoded.slice(neckAt, neckAt + 2)).toBe(EMPTY_FIELD);
  });

  it("reads back as options the generator takes", () => {
    const options = wornToOptions(decodeWorn(encodeWorn(look))!);
    expect(options.palette).toBe("violet");
    expect(options.wearing?.head).toBe("hat-winter");
  });
});

describe("a string from another build", () => {
  it("refuses one too short to carry the slots", () => {
    expect(decodeWorn("")).toBeNull();
    expect(decodeWorn("aa")).toBeNull();
    expect(decodeWorn("aa".repeat(ACCESSORY_SLOTS.length - 1))).toBeNull();
  });

  it("refuses half a field", () => {
    expect(decodeWorn(encodeWorn(look) + "a")).toBeNull();
  });

  it("refuses one that is not the alphabet", () => {
    expect(decodeWorn("!".repeat(WORN_LENGTH))).toBeNull();
  });

  /*
   * The trap this replaced. Refusing anything that was not exactly
   * WORN_LENGTH meant that adding a sixth slot would empty every wardrobe at
   * once, silently, from a change nobody would connect to it.
   */
  it("reads a longer string from a newer build and ignores the extra", () => {
    const back = decodeWorn(encodeWorn(look) + "zzzz");
    expect(back).not.toBeNull();
    expect(back!.wearing.expression).toBe("eyes-happy");
    expect(back!.palette).toBe("violet");
  });

  it("reads a shorter string from an older build and leaves the rest unset", () => {
    const slotsOnly = encodeWorn(look).slice(0, ACCESSORY_SLOTS.length * 2);
    const back = decodeWorn(slotsOnly);
    expect(back).not.toBeNull();
    expect(back!.wearing.head).toBe("hat-winter");
    expect(back!.palette).toBeUndefined();
    expect(back!.ears).toBeUndefined();
  });

  /*
   * Somebody on a newer client wearing a hat this build has never heard of. The
   * hat should not draw; the rest of them should. The alternative — refusing
   * the whole string — is an avatar vanishing because one accessory is new.
   */
  it("drops an accessory it does not know and keeps the rest", () => {
    const encoded = encodeWorn(look);
    const headAt = ACCESSORY_SLOTS.indexOf("head") * 2;
    const fromTheFuture = encoded.slice(0, headAt) + "zy" + encoded.slice(headAt + 2);

    const back = decodeWorn(fromTheFuture);
    expect(back).not.toBeNull();
    expect(back!.wearing.head).toBeNull();
    expect(back!.wearing.expression).toBe("eyes-happy");
    expect(back!.palette).toBe("violet");
  });

  it("ignores a palette it does not have rather than failing", () => {
    const encoded = encodeWorn(look);
    const paletteAt = ACCESSORY_SLOTS.length * 2;
    const odd = encoded.slice(0, paletteAt) + "zz" + encoded.slice(paletteAt + 2);

    const back = decodeWorn(odd);
    expect(back).not.toBeNull();
    expect(back!.palette).toBeUndefined();
    expect(back!.wearing.expression).toBe("eyes-happy");
  });

  it("takes it with surrounding whitespace and any casing", () => {
    const back = decodeWorn(`  ${encodeWorn(look).toUpperCase()}  `);
    expect(back!.wearing.expression).toBe("eyes-happy");
  });
});

describe("the keys themselves", () => {
  it("gives every accessory one", () => {
    for (const a of ACCESSORIES) expect(a.key).toMatch(/^[a-z]{2}$/);
  });

  it("never gives two accessories the same one", () => {
    const keys = ACCESSORIES.map((a) => a.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  /*
   * Not per slot. A key has to be unique across the registry so that a string
   * can be read without knowing which slot each field belongs to — which is
   * what makes a field order change survivable rather than silent.
   */
  it("is unique across slots, not only within one", () => {
    const perSlot = ACCESSORY_SLOTS.map((s) => accessoriesIn(s).map((a) => a.key));
    const all = perSlot.flat();
    expect(new Set(all).size).toBe(all.length);
  });

  it("never uses the empty field as a key", () => {
    for (const a of ACCESSORIES) expect(a.key).not.toBe(EMPTY_FIELD);
  });
});

describe("a colour per slot", () => {
  it("round-trips a tint", () => {
    const tinted: WornLook = { ...look, tint: { head: "amber", eyewear: "teal" } };
    const back = decodeWorn(encodeWorn(tinted));
    expect(back?.tint).toEqual({ head: "amber", eyewear: "teal" });
  });

  it("leaves the other slots following the owl", () => {
    const back = decodeWorn(encodeWorn({ ...look, tint: { head: "amber" } }));
    expect(back?.tint).toEqual({ head: "amber" });
    expect(back?.tint?.body).toBeUndefined();
  });

  it("says nothing at all when no slot is tinted", () => {
    // Not an empty object. `tint` absent and `tint: {}` would draw the same
    // owl, but a caller checking whether somebody has chosen colours should get
    // a straight answer.
    expect(decodeWorn(encodeWorn(look))?.tint).toBeUndefined();
  });

  it("reads a string written before tints existed", () => {
    // The one that matters. Every look saved before this field was added is
    // this shape, and if it stopped decoding — or decoded to something else —
    // every wardrobe would empty or every owl would change at once.
    const old = encodeWorn(look).slice(0, (ACCESSORY_SLOTS.length + 3) * 2);
    expect(old).toHaveLength(16);

    const back = decodeWorn(old);
    expect(back).not.toBeNull();
    expect(back?.wearing).toEqual(decodeWorn(encodeWorn(look))?.wearing);
    expect(back?.palette).toBe("violet");
    expect(back?.scheme).toBe("day");
    expect(back?.ears).toBe("tufts");
    expect(back?.tint).toBeUndefined();
  });

  it("ignores a palette it does not know", () => {
    // A tint written by a newer build. One unknown colour costs that colour,
    // not the look, and certainly not the avatar.
    const withUnknown = encodeWorn(look).slice(0, 16) + "zz" + EMPTY_FIELD.repeat(4);
    const back = decodeWorn(withUnknown);
    expect(back).not.toBeNull();
    expect(back?.tint).toBeUndefined();
    expect(back?.palette).toBe("violet");
  });

  it("is as long as WORN_LENGTH says", () => {
    expect(encodeWorn({ ...look, tint: { head: "amber" } })).toHaveLength(WORN_LENGTH);
  });

  it("hands the tint to the generator", () => {
    const options = wornToOptions({ ...look, tint: { head: "amber" } });
    expect(options.tint).toEqual({ head: "amber" });
    expect(wornToOptions(look).tint).toBeUndefined();
  });
});
