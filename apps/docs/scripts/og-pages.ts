/* Which pages get an OG image, and what goes on each one.
 *
 * The hero line of every image is a real, copy-pasteable line from that page —
 * the import for a component, the install command for the root, the stylesheet
 * import for the theme page. Nothing here is written for the image; it is all
 * text the page itself already shows.
 */

import { componentDocs } from "../src/componentMeta";
import type { DrawingKind } from "./og-drawings";
import { C } from "./og-drawings";

/** One coloured run of the mono hero line. */
export interface HeroToken {
  text: string;
  color: string;
}

export interface OgPage {
  /** Route path, without a leading slash for nesting. "" is the root. */
  route: string;
  /** <title> and og:title. */
  title: string;
  /** og:description — kept under ~160 chars for the platforms that truncate. */
  description: string;
  /**
   * The hero line, tokenised so keywords, punctuation and the specifier keep
   * their own colours. Keywords sit back in ink-2; braces and the package
   * string hold full ink; only the name being documented takes the accent.
   */
  hero: HeroToken[];
  /** Short line under the rule. */
  caption: string;
  drawing: DrawingKind;
}

/** `import { Name } from "@gryt/ui"` — the shape every component page uses. */
function namedImport(name: string): HeroToken[] {
  return [
    { text: "import ", color: C.ink2 },
    { text: "{ ", color: C.ink },
    { text: name, color: C.accent },
    { text: " } ", color: C.ink },
    { text: "from ", color: C.ink2 },
    { text: '"@gryt/ui"', color: C.ink }
  ];
}

/** Which drawing stands in for each component. */
const drawingBySlug: Record<string, DrawingKind> = {
  button: "button",
  "icon-button": "icon-button",
  "text-field": "field",
  select: "field",
  checkbox: "checkbox",
  radio: "radio",
  switch: "switch",
  slider: "slider",
  avatar: "avatar",
  badge: "badge",
  chip: "chip",
  tooltip: "tooltip",
  divider: "divider",
  alert: "alert",
  progress: "progress",
  spinner: "spinner",
  skeleton: "skeleton",
  menu: "menu",
  tabs: "tabs",
  accordion: "accordion",
  surface: "panel",
  card: "card",
  dialog: "dialog",
  drawer: "drawer",
  "message-bubble": "bubble",
  composer: "composer",
  "conversation-item": "conversation-item",
  toggle: "toggle",
  "toggle-group": "toggle-group",
  meter: "meter",
  "context-menu": "context-menu",
  popover: "popover",
  toast: "toast",
  "scroll-area": "scroll-area"
};

/** First sentence, so a long description does not run past the canvas. */
function firstSentence(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const stop = trimmed.indexOf(". ");
  return stop === -1 ? trimmed : trimmed.slice(0, stop + 1);
}

const staticPages: OgPage[] = [
  {
    route: "",
    title: "Gryt UI — the component library behind Gryt",
    description:
      "The component library behind the Gryt client. Flat surfaces, fully rounded controls, keyboard behaviour from Base UI, and no CSS-in-JS runtime.",
    hero: [
      { text: "bun add ", color: C.ink2 },
      { text: "@gryt/ui", color: C.accent }
    ],
    caption: `${componentDocs.length} components, on Base UI and Tailwind.`,
    drawing: "cluster"
  },
  {
    route: "installation",
    title: "Installation — Gryt UI",
    description:
      "One package, one stylesheet import, one provider. There is no build plugin and no CSS-in-JS runtime to configure.",
    hero: namedImport("GrytProvider"),
    caption: "One package, one stylesheet import, one provider.",
    drawing: "install"
  },
  {
    route: "theme",
    title: "Theme — Gryt UI",
    description:
      "The palette comes from Gryt code-theme, so the components match the editor theme and the client that ships them.",
    hero: [
      { text: "import ", color: C.ink2 },
      { text: '"@gryt/ui/theme.css"', color: C.accent }
    ],
    caption: "Read straight from grytTokens, so it cannot drift.",
    drawing: "palette"
  }
];

export const ogPages: OgPage[] = [
  ...staticPages,
  ...componentDocs.map(
    (doc): OgPage => ({
      route: `components/${doc.slug}`,
      title: `${doc.name} — Gryt UI`,
      description: doc.description,
      hero: namedImport(doc.importName),
      caption: firstSentence(doc.description),
      drawing: drawingBySlug[doc.slug] ?? "panel"
    })
  )
];
