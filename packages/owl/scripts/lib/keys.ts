/**
 * A short, permanent name for every cosmetic.
 *
 * What a person is wearing travels beside their nickname as a fixed-width
 * string, two letters per field, so it has to survive the drawings changing
 * underneath it. The obvious encoding — "third hat in the slot" — does not:
 * dropping hat_apple.svg into artwork/ re-sorts the folder and every hat after
 * it shifts by one, quietly re-dressing everybody who saved a look. That is the
 * same positional-identity bug the accessory draw had, except persisted, so it
 * turns up as somebody's saved outfit changing rather than as a rendering
 * oddity.
 *
 * So a key is assigned once and never moves. artwork/keys.json is the ledger:
 * every accessory that has ever existed, with the key it was given. New
 * drawings take the next unused key. A deleted drawing keeps its entry, marked
 * retired, so its key is never handed to something else and an old string
 * decodes to "that is gone" rather than to a hat somebody never chose.
 *
 * 26 x 26 is 676. There are 37 drawings.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";

/** Not a real key. Reserved for a slot somebody deliberately left empty. */
export const EMPTY_KEY = "--";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export interface KeyLedger {
  /** Accessory name to its permanent key, retired entries included. */
  keys: Record<string, string>;
  /** Names no longer in artwork/. Kept so their keys stay spent. */
  retired: string[];
}

/** `aa`, `ab`, ... `zz`. Index 0 is `aa`. */
export function keyAt(index: number): string {
  if (index < 0 || index >= ALPHABET.length * ALPHABET.length) {
    throw new Error(
      `key index ${index} is outside aa-zz. There is room for ${ALPHABET.length ** 2}.`,
    );
  }
  return ALPHABET[Math.floor(index / ALPHABET.length)] + ALPHABET[index % ALPHABET.length];
}

export function readLedger(path: string): KeyLedger {
  if (!existsSync(path)) return { keys: {}, retired: [] };
  const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<KeyLedger>;
  return { keys: raw.keys ?? {}, retired: raw.retired ?? [] };
}

/**
 * The ledger brought up to date with what is in artwork/ now.
 *
 * Only ever grows. Names that have gone are moved to `retired` rather than
 * dropped, and a name that comes back gets the key it had before — which is the
 * behaviour somebody renaming a file back would expect, and the reason the
 * ledger is keyed by name rather than by file.
 */
export function updateLedger(ledger: KeyLedger, names: readonly string[]): KeyLedger {
  const keys = { ...ledger.keys };
  const spent = new Set(Object.values(keys));

  // Sorted, so two people regenerating after adding the same two drawings get
  // the same assignment rather than one that depends on readdir order.
  for (const name of [...names].sort()) {
    if (keys[name]) continue;

    let index = 0;
    while (spent.has(keyAt(index))) index += 1;
    keys[name] = keyAt(index);
    spent.add(keys[name]);
  }

  const live = new Set(names);
  const retired = Object.keys(keys).filter((name) => !live.has(name)).sort();

  return { keys, retired };
}

export function writeLedger(path: string, ledger: KeyLedger) {
  const ordered = Object.fromEntries(
    Object.entries(ledger.keys).sort((a, b) => a[1].localeCompare(b[1])),
  );
  writeFileSync(path, JSON.stringify({ keys: ordered, retired: ledger.retired }, null, 2) + "\n");
}
