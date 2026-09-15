/** Plain data behind the card, kept apart from the view so it can be tested without a renderer. */

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** The payload colour for the dot, or the fallback when it is missing or not `#rrggbb`. */
export function dotColor(color: string | undefined, fallback: string): string {
  return color && HEX_COLOR.test(color) ? color : fallback;
}

/** Only http(s) becomes a link. Anything else draws as plain text. */
export function openableUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return /^https?:\/\/\S+$/i.test(url.trim()) ? url.trim() : undefined;
}

export function defaultTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return date.toLocaleString();
  }
}

/** "footer · time", either half alone, or null when there is neither. */
export function footerText(footer: string | undefined, time: string): string | null {
  const parts = [footer?.trim(), time].filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(" · ") : null;
}
