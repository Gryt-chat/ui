import { grytFonts } from "@gryt/theme";
import type { GrytFontKey, GrytFonts } from "@gryt/theme";

/* Typefaces to choose from. A curated list rather than Google's catalogue, since fetching
 * it is itself a request to Google. `local` asks for nothing, so the list opens there. */

export interface FontChoice {
  /** What the picker shows. */
  label: string;
  /** The whole stack, fallbacks included. */
  stack: string;
  /** Needs fetching from Google. False for anything already on the machine. */
  remote: boolean;
  /** One line on what it is for. */
  note: string;
}

const SANS_TAIL = "ui-sans-serif, system-ui, sans-serif";
const SERIF_TAIL = "ui-serif, Georgia, serif";
const MONO_TAIL = "ui-monospace, Menlo, Consolas, monospace";

export const FONT_CHOICES: FontChoice[] = [
  {
    label: "Atkinson Hyperlegible",
    stack: `"Atkinson Hyperlegible Next", ${SANS_TAIL}`,
    remote: false,
    note: "What Gryt ships. Drawn so letterforms cannot be confused."
  },
  {
    label: "System",
    stack: SANS_TAIL,
    remote: false,
    note: "Whatever this machine uses. Nothing to load."
  },
  {
    label: "System serif",
    stack: SERIF_TAIL,
    remote: false,
    note: "The machine's serif. Nothing to load."
  },
  {
    label: "Atkinson Hyperlegible Mono",
    stack: `"Atkinson Hyperlegible Mono", ${MONO_TAIL}`,
    remote: false,
    note: "The monospace Gryt ships."
  },
  {
    label: "System mono",
    stack: MONO_TAIL,
    remote: false,
    note: "The machine's monospace. Nothing to load."
  },
  {
    label: "Inter",
    stack: `"Inter", ${SANS_TAIL}`,
    remote: true,
    note: "The default interface grotesque. Neutral to a fault."
  },
  {
    label: "Geist",
    stack: `"Geist", ${SANS_TAIL}`,
    remote: true,
    note: "Vercel's. What shadcn/ui is set in."
  },
  {
    label: "IBM Plex Sans",
    stack: `"IBM Plex Sans", ${SANS_TAIL}`,
    remote: true,
    note: "Technical and a little cold, with a real mono to match."
  },
  {
    label: "Archivo",
    stack: `"Archivo", ${SANS_TAIL}`,
    remote: true,
    note: "Grotesque with weight. Good for headings that carry."
  },
  {
    label: "Fraunces",
    stack: `"Fraunces", ${SERIF_TAIL}`,
    remote: true,
    note: "A serif with opinions. Headings rather than body."
  },
  {
    label: "Source Serif 4",
    stack: `"Source Serif 4", ${SERIF_TAIL}`,
    remote: true,
    note: "A serif you can read a paragraph in."
  },
  {
    label: "JetBrains Mono",
    stack: `"JetBrains Mono", ${MONO_TAIL}`,
    remote: true,
    note: "Monospace with a tall x-height. Made for code."
  },
  {
    label: "IBM Plex Mono",
    stack: `"IBM Plex Mono", ${MONO_TAIL}`,
    remote: true,
    note: "The mono beside IBM Plex Sans."
  }
];

/** Roles in the order somebody sets them, with what each one is actually for. */
export const FONT_ROLE_LABELS: Record<GrytFontKey, string> = {
  body: "Body",
  display: "Headings",
  mono: "Code and numbers"
};

export const FONT_ROLE_HINTS: Record<GrytFontKey, string> = {
  body: "Messages, labels, everything you read.",
  display: "Headings and titles. Defaults to the body face.",
  mono: "Code, hex values, timestamps, fingerprints."
};

/** The stack a role is on, whether or not the theme carries any fonts. */
export function fontFor(fonts: GrytFonts | null | undefined, role: GrytFontKey): string {
  return fonts?.[role] ?? grytFonts[role];
}

/** The listed choice a stack corresponds to, if it is one of them. */
export function choiceFor(stack: string): FontChoice | undefined {
  return FONT_CHOICES.find((choice) => choice.stack === stack);
}

/**
 * The family a stack asks for first, for a picker to show and a loader to
 * fetch. `"Inter", ui-sans-serif, …` is Inter.
 */
export function primaryFamily(stack: string): string {
  const first = stack.split(",")[0]?.trim() ?? "";
  return first.replace(/^["']|["']$/g, "");
}
