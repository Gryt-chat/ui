/**
 * Which cosmetics somebody has already had a look at.
 *
 * Cosmetics get added and nothing says so, so the editor puts a dot on the ones
 * that are new — on the drawing itself, and on its slot in the rail.
 *
 * The whole feature turns on the first-run case. A fresh install has no record,
 * and treating "not in the record" as "new" would light up all thirty-seven on
 * the first open: a badge on everything is a badge on nothing. So the first
 * read writes the whole registry into the record and reports nothing as new,
 * and the badge means exactly one thing — added since you last looked.
 *
 * localStorage, beside the wardrobe. Losing it costs a dot rather than an
 * avatar, and IndexedDB would be a lot of machinery for that consequence.
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
 * The cosmetics that have appeared since this person last opened the editor.
 *
 * `all` is every accessory name the running build knows. Pass the registry —
 * this deliberately does not import it, so the caller decides what "everything"
 * means and this stays a store rather than a second source of truth.
 *
 * Empty on a first run, by design. See the note at the top.
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
 * Record that somebody has tried one on, and return what is still new.
 *
 * Tried on, not hovered or scrolled past. Wearing a thing is the moment you
 * have actually seen it, and it is also the moment the dot has done its job.
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
