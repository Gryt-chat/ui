/**
 * A short, permanent name for every cosmetic. A key is assigned once and never moves, and
 * a deleted drawing keeps its entry, marked retired, so its key is never reused.
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
 * The ledger brought up to date with what is in artwork/ now. Only ever grows: names that
 * have gone are retired, and a name that comes back gets the key it had.
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
