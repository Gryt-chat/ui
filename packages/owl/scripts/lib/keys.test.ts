import { describe, expect, it } from "vitest";

import { keyAt, updateLedger, EMPTY_KEY, type KeyLedger } from "./keys";

const empty: KeyLedger = { keys: {}, retired: [] };

describe("the alphabet", () => {
  it("starts at aa and counts", () => {
    expect(keyAt(0)).toBe("aa");
    expect(keyAt(1)).toBe("ab");
    expect(keyAt(25)).toBe("az");
    expect(keyAt(26)).toBe("ba");
    expect(keyAt(675)).toBe("zz");
  });

  it("refuses to run past zz rather than wrapping onto a key in use", () => {
    expect(() => keyAt(676)).toThrow(/outside aa-zz/);
  });

  it("never mints the empty field as a key", () => {
    for (let i = 0; i < 676; i += 1) expect(keyAt(i)).not.toBe(EMPTY_KEY);
  });
});

/*
 * The whole reason this is a ledger and not an index. A saved look is a string
 * of keys; if adding a drawing renumbered the ones after it, everybody who had
 * saved an outfit would quietly be wearing something else.
 */
describe("adding a drawing", () => {
  it("does not move any key already given out", () => {
    const first = updateLedger(empty, ["hat-bear", "hat-cap", "hat-winter"]);

    // Alphabetically before all of them, which is exactly the case that would
    // shift everything under a positional scheme.
    const second = updateLedger(first, ["hat-apple", "hat-bear", "hat-cap", "hat-winter"]);

    for (const name of ["hat-bear", "hat-cap", "hat-winter"]) {
      expect(second.keys[name]).toBe(first.keys[name]);
    }
    expect(second.keys["hat-apple"]).toBe("ad");
  });

  it("gives the same keys whatever order the folder is read in", () => {
    const a = updateLedger(empty, ["c", "a", "b"]);
    const b = updateLedger(empty, ["b", "c", "a"]);
    expect(a.keys).toEqual(b.keys);
  });
});

describe("removing a drawing", () => {
  it("keeps its key spent, so nothing inherits it", () => {
    const before = updateLedger(empty, ["hat-bear", "hat-cap"]);
    const bearKey = before.keys["hat-bear"];

    const after = updateLedger(before, ["hat-cap"]);
    expect(after.retired).toContain("hat-bear");
    expect(after.keys["hat-bear"]).toBe(bearKey);

    const later = updateLedger(after, ["hat-cap", "hat-new"]);
    expect(later.keys["hat-new"]).not.toBe(bearKey);
  });

  it("gives a drawing its old key back if it returns", () => {
    const before = updateLedger(empty, ["hat-bear", "hat-cap"]);
    const gone = updateLedger(before, ["hat-cap"]);
    const back = updateLedger(gone, ["hat-bear", "hat-cap"]);

    expect(back.keys["hat-bear"]).toBe(before.keys["hat-bear"]);
    expect(back.retired).not.toContain("hat-bear");
  });
});

describe("the ledger only grows", () => {
  it("fills a gap left by a retired key only when that name comes back", () => {
    // aa, ab, ac given out; ab retired.
    const start = updateLedger(empty, ["a", "b", "c"]);
    const afterRemoval = updateLedger(start, ["a", "c"]);
    const afterAdd = updateLedger(afterRemoval, ["a", "c", "d"]);

    expect(afterAdd.keys["d"]).toBe("ad");
    expect(afterAdd.keys["b"]).toBe("ab");
  });
});
