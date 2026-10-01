import freshness from "./freshness.json";

export type FreshnessLabel = "New" | "Updated";

interface FreshnessEntry {
  date: string;
  label: FreshnessLabel;
}

const entries = freshness as Record<string, FreshnessEntry>;

/** New and updated tags expire six calendar months after their recorded date. */
export function freshnessBadge(
  route: string,
  now: Date = new Date()
): FreshnessLabel | null {
  const entry = entries[route];
  if (!entry) return null;
  const changed = new Date(`${entry.date}T00:00:00Z`);
  if (Number.isNaN(changed.getTime()) || now < changed) return null;
  const expires = new Date(changed);
  expires.setUTCMonth(expires.getUTCMonth() + 6);
  return now < expires ? entry.label : null;
}
