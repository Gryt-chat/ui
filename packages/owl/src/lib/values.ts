/** A value the code guarantees, such as an index inside the loop's own bounds. Throws rather than carry on with undefined. */
export function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`owl: missing ${what}`);
  return value;
}

/** An asked-for background: false for none, a colour for that colour, otherwise the palette's. */
export function backgroundFor(asked: string | boolean | undefined, fallback: string): string | null {
  if (asked === false) return null;
  return typeof asked === "string" ? asked : fallback;
}
