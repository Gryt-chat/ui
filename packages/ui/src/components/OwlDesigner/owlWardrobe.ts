/**
 * Every look somebody has worn, kept so going back to one is a click. A look is a
 * sixteen-character string, which is what makes a wardrobe cheap enough to have.
 */

const STORAGE_KEY = "gryt.owlWardrobe";

/**
 * Twenty. Not for space — twenty strings is 320 bytes — but because a wardrobe you scroll
 * is one you stop reading.
 */
const LIMIT = 20;

export interface WardrobeEntry {
  /** The encoded look. */
  worn: string;
  /** When it was last used, so the newest reads as "what I have on". */
  at: number;
}

export function readWardrobe(): WardrobeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is WardrobeEntry =>
        typeof e === "object" && e !== null &&
        typeof (e as WardrobeEntry).worn === "string" &&
        typeof (e as WardrobeEntry).at === "number",
    );
  } catch {
    // Unreadable storage costs the wardrobe and nothing else. The avatar itself
    // is on the server.
    return [];
  }
}

function write(entries: WardrobeEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Full or blocked. Not worth telling anybody about mid-save.
  }
}

/**
 * Records a look as worn, and returns the wardrobe as it now stands. Wearing something
 * again moves it to the front, so the list stays a set of looks and not a history.
 */
export function rememberLook(worn: string): WardrobeEntry[] {
  const rest = readWardrobe().filter((e) => e.worn !== worn);
  const next = [{ worn, at: Date.now() }, ...rest].slice(0, LIMIT);
  write(next);
  return next;
}

export function forgetLook(worn: string): WardrobeEntry[] {
  const next = readWardrobe().filter((e) => e.worn !== worn);
  write(next);
  return next;
}
