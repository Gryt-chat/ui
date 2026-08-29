/* The checks the library asserts on its own palette, run against yours.
 *
 * packages/ui/src/theme/theme.test.ts fails the build if Gryt's own scales stop
 * carrying text. A theme built here gets no such build, so the same ratios are
 * measured live and reported next to the colour that caused them — the point
 * being to say so while somebody is picking the colour, rather than letting
 * them export something unreadable and find out in their own app.
 *
 * Thresholds are WCAG AA: 4.5 for text, and one advisory below that for a
 * border, which is not text and has no required ratio but does need to be
 * visible at all. AA rather than the 7:1 the library holds its own text step
 * to — several published palettes sit between the two, and calling Catppuccin
 * Latte broken because its text is 6.6:1 rather than 7 would be reporting a
 * preference as a failure.
 */

import { contrast } from "@gryt/theme";
import type { CSSProperties } from "react";
import type { Appearance, DraftPath, ThemeDraft } from "./draft";
import { hueSlot, huesFor, scaleFrom } from "./draft";

export type CheckLevel = "pass" | "tight" | "fail";

export interface ContrastCheck {
  id: string;
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  min: number;
  level: CheckLevel;
  /** Advisory checks never read as a failure; they read as "look at this". */
  advisory: boolean;
  /** Which editable colours are responsible, so the fields can flag. */
  paths: DraftPath[];
}

const HUES = [
  { family: "accent", label: "Accent" },
  { family: "secondary", label: "Secondary" },
  { family: "success", label: "Success" },
  { family: "danger", label: "Danger" },
  { family: "warning", label: "Warning" }
] as const;

function level(ratio: number, min: number): CheckLevel {
  if (ratio < min) return "fail";
  // Within a tenth of the line. Worth knowing, because a step that only just
  // clears it here will fail the moment somebody nudges the anchor.
  if (ratio < min * 1.1) return "tight";
  return "pass";
}

function check(
  id: string,
  label: string,
  foreground: string,
  background: string,
  min: number,
  paths: DraftPath[],
  advisory = false
): ContrastCheck {
  const ratio = contrast(foreground, background);
  return {
    id,
    label,
    foreground,
    background,
    ratio,
    min,
    level: level(ratio, min),
    advisory,
    paths
  };
}

export function contrastChecks(
  draft: ThemeDraft,
  theme: CSSProperties,
  appearance: Appearance
): ContrastCheck[] {
  const neutral = scaleFrom(theme, "neutral");
  const page = neutral[0];
  const surface = neutral[1];
  const text = neutral[11];
  const muted = neutral[10];
  const border = neutral[5];

  const a = appearance;
  // Which hue set this appearance is reading, so a warning points at the field
  // somebody can actually edit rather than at the one the other half uses.
  const h = hueSlot(draft, appearance);
  const hues = huesFor(draft, appearance);
  const checks: ContrastCheck[] = [
    check("text-page", "Text on the page", text, page, 4.5, [
      `${a}.text`,
      `${a}.bg`
    ]),
    check("text-surface", "Text on a surface", text, surface, 4.5, [
      `${a}.text`,
      `${a}.surface`
    ]),
    check("muted-page", "Muted text on the page", muted, page, 4.5, [
      `${a}.muted`,
      `${a}.bg`
    ]),
    check("muted-surface", "Muted text on a surface", muted, surface, 4.5, [
      `${a}.muted`,
      `${a}.surface`
    ])
  ];

  for (const { family, label } of HUES) {
    const steps = scaleFrom(theme, family);
    checks.push(
      check(
        `${family}-text`,
        `${label} text on the page`,
        steps[10],
        page,
        4.5,
        [`${h}.${family}`, `${a}.bg`]
      )
    );
  }

  // The filled-button case: the label sits on step 9, and step 9 is whatever
  // hue was picked. This is the check somebody breaks first, because a pale
  // accent looks good in a swatch and takes its dark ink with it.
  const fills = [
    { family: "accent", on: "onAccent", label: "Label on a filled button" },
    { family: "secondary", on: "onSecondary", label: "Label on a secondary button" },
    { family: "danger", on: "onDanger", label: "Label on a danger button" }
  ] as const;

  for (const { family, on, label } of fills) {
    checks.push(
      check(`${on}-fill`, label, hues[on], scaleFrom(theme, family)[8], 4.5, [
        `${h}.${on}`,
        `${h}.${family}`
      ])
    );
  }

  checks.push(
    check(
      "border-page",
      "Border against the page",
      border,
      page,
      1.15,
      [`${a}.border`, `${a}.bg`],
      true
    )
  );

  return checks;
}

/** Every field a failing check blames, for the warning markers on the editor. */
export function failingPaths(checks: ContrastCheck[]): Set<DraftPath> {
  const paths = new Set<DraftPath>();
  for (const item of checks) {
    if (item.advisory || item.level !== "fail") continue;
    for (const path of item.paths) paths.add(path);
  }
  return paths;
}

export function countFailures(checks: ContrastCheck[]): number {
  return checks.filter((item) => !item.advisory && item.level === "fail").length;
}
