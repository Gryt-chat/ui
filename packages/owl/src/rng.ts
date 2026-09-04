/**
 * Turning a seed into choices.
 *
 * Every draw is `hash(seed + channel)` rather than a running stream, so adding
 * a part to the owl does not shift every part after it. That property is the
 * whole reason this is not a plain PRNG: a stream would mean the day someone
 * adds a `scarf` channel, every existing user's beak changes too.
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
 * One entry from `entries`, by weight, drawing each on its own channel so the
 * result does not depend on what else was in the running.
 *
 * `pickWeighted` lays every candidate out along one range and rolls once, so
 * the range is shared: add a drawing to a slot and every boundary after it
 * moves, and people who do not even end up wearing the new thing are handed
 * something different. Measured on the seventeen accessories before this
 * existed, adding one hat changed 28.6% of owls while only 8.7% wore the hat.
 *
 * Instead each candidate gets an independent draw and the best one wins — the
 * exponential-clock trick: with `u` uniform on [0,1), the largest
 * `u ** (1 / weight)` picks exactly in proportion to weight. A candidate's key
 * depends only on the seed, the channel and its own name and weight, so adding
 * one can only take owls from the others, never trade two untouched candidates
 * against each other.
 *
 * Compared in log space, because `u ** (1 / weight)` underflows to zero for the
 * weights here. `log` is the one part of this a JavaScript engine is allowed to
 * round differently — the same expression may land a bit apart on V8 and on
 * Hermes, which is a real problem for a package whose whole promise is that the
 * desktop app and the phone draw one person the same way. So the keys are
 * rounded well inside any plausible disagreement before they are compared, and
 * an exact tie falls back to the name.
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
 * One entry from `entries`, by weight.
 *
 * Accessories need this. A uniform draw over ten glasses styles plus "none"
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
