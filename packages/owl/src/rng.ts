/**
 * Turning a seed into choices. Every draw is `hash(seed + channel)` rather than a running
 * stream, so adding a `scarf` channel does not change every existing user's beak.
 */

/** FNV-1a with an avalanche tail. Small, stable, and plenty for picking shapes. */
export function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** A number in [0, 1) for this seed on this channel. */
export function unit(seed: string, channel: string): number {
  let a = (hash32(seed + "::" + channel) + 0x6d2b79f5) >>> 0;
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}

/** One entry from `list`, uniformly. */
export function pick<T>(seed: string, channel: string, list: readonly T[]): T {
  const i = Math.floor(unit(seed, channel) * list.length);
  return list[Math.min(i, list.length - 1)] as T;
}

/**
 * One entry from `entries`, by weight, each drawn on its own channel — the
 * exponential-clock trick, so adding a candidate cannot move the ones already there.
 */
export function pickWeightedByName<T>(
  seed: string,
  channel: string,
  entries: readonly (readonly [T, string, number])[],
): T | undefined {
  // Twelve digits: far below where two implementations of `log` could differ,
  // far above where two genuinely different keys could collide.
  const QUANTUM = 1e12;

  let best: T | undefined;
  let bestKey = -Infinity;
  let bestId = "";

  for (const [value, id, weight] of entries) {
    // A weight of zero is a thing that has been drawn and cannot be worn. It
    // divides to -Infinity here, which loses to everything, including itself.
    if (weight <= 0) continue;

    const u = unit(seed, channel + "::" + id);
    const key = Math.round((Math.log(u) / weight) * QUANTUM) / QUANTUM;

    // The name breaks a tie rather than the iteration order, which is the whole
    // point: order must not be able to decide anything.
    if (key > bestKey || (key === bestKey && id < bestId)) {
      best = value;
      bestKey = key;
      bestId = id;
    }
  }

  return best;
}

/**
 * One entry from `entries`, by weight. A uniform draw over ten glasses styles plus "none"
 * puts spectacles on nine owls in ten, and the joke stops being a joke.
 */
export function pickWeighted<T>(
  seed: string,
  channel: string,
  entries: readonly (readonly [T, number])[],
): T {
  let total = 0;
  for (const [, weight] of entries) total += weight;

  let roll = unit(seed, channel) * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return entries[entries.length - 1]![0];
}
