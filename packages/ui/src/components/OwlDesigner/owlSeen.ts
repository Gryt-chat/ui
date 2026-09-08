/**
 * Which cosmetics somebody has already had a look at. The first read writes the whole
 * registry and reports nothing new, or a fresh install badges all thirty-seven.
 */

const STORAGE_KEY = "gryt.owlSeen";

function read(): Set<string> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed.filter((n): n is string => typeof n === "string"));
  } catch {
    // Unreadable storage costs the dots and nothing else.
    return null;
  }
}

function write(names: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...names]));
  } catch {
    /* see above */
  }
}

/**
 * The cosmetics that have appeared since this person last opened the editor. Pass the
 * registry rather than importing it, so this stays a store. Empty on a first run.
 */
export function readNewCosmetics(all: readonly string[]): Set<string> {
  const seen = read();
  if (!seen) {
    write(new Set(all));
    return new Set();
  }

  const fresh = new Set<string>();
  for (const name of all) if (!seen.has(name)) fresh.add(name);
  return fresh;
}

/**
 * Record that somebody has tried one on, and return what is still new. Tried on, not
 * hovered: wearing a thing is the moment the dot has done its job.
 */
export function markCosmeticSeen(name: string, all: readonly string[]): Set<string> {
  const seen = read() ?? new Set<string>(all);
  seen.add(name);
  write(seen);

  const fresh = new Set<string>();
  for (const candidate of all) if (!seen.has(candidate)) fresh.add(candidate);
  return fresh;
}

/**
 * Record every one of them, for "I have looked, stop telling me".
 *
 * Returns an empty set so a caller can use it as the new state directly.
 */
export function markAllCosmeticsSeen(all: readonly string[]): Set<string> {
  write(new Set(all));
  return new Set();
}
