/* Themes to start from.
 *
 * Two kinds. The Gryt ones show the range — warm, near-monochrome,
 * high-contrast, and the palette the library ships. The ported ones are
 * well-known palettes, because "can it look like the thing I already use?" is
 * the question people arrive with, and a paragraph claiming yes is worth less
 * than a click.
 *
 * Every ported value is the published one, taken from the source named in the
 * comment above each preset rather than from memory. Where a palette defines
 * both a dark and a light variant — Alucard, Latte, Snow Storm, GitHub Light,
 * Solarized Light — both are here, which is why lightHue exists: Catppuccin's
 * mauve and GitHub's blue are genuinely different colours in each half, and
 * sharing one would make the preset wrong in the other.
 *
 * Two honest limits, and the page says both:
 *
 * - Gryt names seven neutral anchors. Most palettes name fewer, so the steps
 *   in between are derived — marked `derived` where that happens. Nothing
 *   derived is invented out of nowhere; it sits between two published values.
 * - A palette is a set of names with colours behind them, and mapping those
 *   names onto "page, surface, border, muted, text" is a judgement. Somebody
 *   else mapping the same palette would put a couple of them elsewhere.
 *
 * Radius is part of a preset too. GitHub's buttons are not pills and
 * Solarized's are square; a preset that got the colours right and left
 * everything fully rounded would not look like the thing it names.
 *
 * Names belong to their projects. Dracula, Nord, Catppuccin, Solarized and
 * shadcn/ui are MIT-licensed; the rest are referenced by name only.
 *
 * These ship with the library rather than with the docs site, because the docs
 * site is not the only thing that lists them: the client offers the same set,
 * and it should get a new one by taking a newer @gryt/ui rather than by
 * somebody copying twelve palettes across by hand.
 */

import type { GrytRadiusKey, GrytTheme } from "./theme";
import { cloneGrytTheme, grytTheme } from "./theme";

export interface GrytThemePreset {
  id: string;
  name: string;
  /** One line under the name: what makes this one different. */
  note: string;
  group: "Gryt" | "Ported";
  /** Where the values came from. Shown as the attribution line. */
  source?: string;
  theme: GrytTheme;
}

type Radius = Record<GrytRadiusKey, number>;

const ROUND: Radius = { sm: 8, md: 12, lg: 20, xl: 28, full: 999 };
const SOFT: Radius = { sm: 6, md: 8, lg: 14, xl: 18, full: 999 };
/** Buttons that are not pills. `full` is what controls use, so it does the work. */
const CRISP: Radius = { sm: 4, md: 6, lg: 10, xl: 14, full: 6 };
const SHADCN: Radius = { sm: 6, md: 8, lg: 10, xl: 14, full: 10 };
const SQUARE: Radius = { sm: 2, md: 4, lg: 6, xl: 8, full: 4 };
/** One value the whole way up, pills included. */
const EIGHT: Radius = { sm: 8, md: 8, lg: 8, xl: 8, full: 8 };

export const grytPresets: GrytThemePreset[] = [
  {
    id: "gryt",
    name: "Gryt",
    note: "What the library ships, from the Gryt code-theme.",
    group: "Gryt",
    source: "github.com/Gryt-chat/code-theme",
    theme: grytTheme
  },
  {
    /* Credits to Carlo, who made this in the generator and sent the link.
       Same colours as above — the only change is the radius, and the one that
       matters is `full`: it drops 999 to 8, so the controls that were pills
       (buttons, the search field, badges) become rectangles with the same
       corner as everything else. */
    id: "gryt-rounded",
    name: "Gryt Rounded",
    note: "The shipped palette, every corner at eight pixels. Made by Carlo.",
    group: "Gryt",
    source: "Carlo",
    theme: { ...cloneGrytTheme(grytTheme), name: "Gryt Rounded", radius: EIGHT }
  },
  {
    id: "ember",
    name: "Ember",
    note: "Warm all the way down — the neutrals are brown, not blue.",
    group: "Gryt",
    theme: {
      name: "Ember",
      hue: {
        accent: "#f0803c",
        accentLight: "#ff9f66",
        secondary: "#d9a441",
        secondaryLight: "#ecc06a",
        success: "#8bb056",
        danger: "#e35d55",
        dangerLight: "#ef8079",
        warning: "#e8b33e",
        onAccent: "#231004",
        onSecondary: "#241a04",
        onDanger: "#2b0a08"
      },
      lightHue: null,
      dark: {
        bg: "#17110e",
        surface: "#1f1815",
        surfaceRaised: "#251d19",
        surfaceHover: "#33261f",
        border: "#352822",
        muted: "#a48f81",
        text: "#f5ece5"
      },
      light: {
        bg: "#f6efe8",
        surface: "#fffdfb",
        surfaceRaised: "#faf3ec",
        surfaceHover: "#efe3d8",
        border: "#e0d2c4",
        muted: "#6b5b50",
        text: "#241a14"
      },
      radius: ROUND
    }
  },
  {
    id: "paper",
    name: "Paper",
    note: "Near-monochrome. One quiet slate accent and nothing else.",
    group: "Gryt",
    theme: {
      name: "Paper",
      hue: {
        accent: "#8390a8",
        accentLight: "#a3aec2",
        secondary: "#93a0a0",
        secondaryLight: "#b1bcbc",
        success: "#7f9b7f",
        danger: "#b56b6b",
        dangerLight: "#c98d8d",
        warning: "#b39a6a",
        onAccent: "#11151c",
        onSecondary: "#121717",
        onDanger: "#1d0e0e"
      },
      lightHue: null,
      dark: {
        bg: "#101011",
        surface: "#17171a",
        surfaceRaised: "#1d1d20",
        surfaceHover: "#282a2e",
        border: "#2a2a2e",
        muted: "#8e8e94",
        text: "#ededf0"
      },
      light: {
        bg: "#f0f0f2",
        surface: "#ffffff",
        surfaceRaised: "#f7f7f9",
        surfaceHover: "#e6e6ea",
        border: "#d6d6dc",
        muted: "#5b5b63",
        text: "#17171a"
      },
      radius: SOFT
    }
  },
  {
    id: "signal",
    name: "Signal",
    note: "Black, white, and a yellow that cannot be missed.",
    group: "Gryt",
    theme: {
      name: "Signal",
      hue: {
        accent: "#ffd400",
        accentLight: "#ffe454",
        secondary: "#00d0ff",
        secondaryLight: "#66e2ff",
        success: "#00e06a",
        danger: "#ff453a",
        dangerLight: "#ff7a72",
        warning: "#ffab00",
        onAccent: "#161200",
        onSecondary: "#001a20",
        onDanger: "#1a0300"
      },
      lightHue: null,
      dark: {
        bg: "#000000",
        surface: "#0c0c0c",
        surfaceRaised: "#151515",
        surfaceHover: "#242424",
        border: "#454545",
        muted: "#bcbcbc",
        text: "#ffffff"
      },
      light: {
        bg: "#f0f0f0",
        surface: "#ffffff",
        surfaceRaised: "#f8f8f8",
        surfaceHover: "#e3e3e3",
        border: "#6f6f6f",
        muted: "#3d3d3d",
        text: "#000000"
      },
      radius: SQUARE
    }
  },
  {
    /* Dracula's eleven, and Alucard's eleven for the light half, from the
       palette tables in dracula/dracula-theme. Background, Current Line,
       Foreground and Comment are exact; the two steps between Background and
       Current Line are derived, because Dracula does not name them. */
    id: "dracula",
    name: "Dracula",
    note: "The purple-and-pink dark theme, with Alucard as its light half.",
    group: "Ported",
    source: "draculatheme.com, MIT",
    theme: {
      name: "Dracula",
      hue: {
        accent: "#bd93f9",
        accentLight: "#d0b3fb",
        secondary: "#8be9fd",
        secondaryLight: "#aff0fe",
        success: "#50fa7b",
        danger: "#ff5555",
        dangerLight: "#ff7979",
        warning: "#ffb86c",
        onAccent: "#282a36",
        onSecondary: "#282a36",
        onDanger: "#282a36"
      },
      lightHue: {
        accent: "#644ac9",
        accentLight: "#7b64d6",
        secondary: "#036a96",
        secondaryLight: "#0b83b5",
        success: "#14710a",
        danger: "#cb3a2a",
        dangerLight: "#d95445",
        warning: "#a34d14",
        onAccent: "#fffbeb",
        onSecondary: "#fffbeb",
        onDanger: "#fffbeb"
      },
      dark: {
        bg: "#282a36",
        surface: "#31323f",
        surfaceRaised: "#383a49",
        surfaceHover: "#44475a",
        border: "#44475a",
        muted: "#6272a4",
        text: "#f8f8f2"
      },
      light: {
        bg: "#f5f1e1",
        surface: "#fffbeb",
        surfaceRaised: "#faf6e6",
        surfaceHover: "#ece7d4",
        border: "#dcd6bf",
        muted: "#6c664b",
        text: "#1f1f1f"
      },
      radius: SOFT
    }
  },
  {
    /* nord0-nord15, exactly as nordtheme.com publishes them. Polar Night is
       the dark neutrals, Snow Storm the light ones, Frost the accents and
       Aurora the status colours. Nothing here is derived. */
    id: "nord",
    name: "Nord",
    note: "Polar Night and Snow Storm, with Frost on top.",
    group: "Ported",
    source: "nordtheme.com, MIT",
    theme: {
      name: "Nord",
      hue: {
        accent: "#88c0d0",
        accentLight: "#8fbcbb",
        secondary: "#81a1c1",
        secondaryLight: "#a3b8d4",
        success: "#a3be8c",
        danger: "#bf616a",
        dangerLight: "#d08770",
        warning: "#ebcb8b",
        onAccent: "#2e3440",
        onSecondary: "#2e3440",
        onDanger: "#eceff4"
      },
      lightHue: {
        accent: "#5e81ac",
        accentLight: "#81a1c1",
        secondary: "#8fbcbb",
        secondaryLight: "#88c0d0",
        success: "#a3be8c",
        danger: "#bf616a",
        dangerLight: "#d08770",
        warning: "#ebcb8b",
        onAccent: "#eceff4",
        onSecondary: "#2e3440",
        onDanger: "#eceff4"
      },
      dark: {
        bg: "#2e3440",
        surface: "#3b4252",
        surfaceRaised: "#434c5e",
        surfaceHover: "#4c566a",
        border: "#4c566a",
        muted: "#d8dee9",
        text: "#eceff4"
      },
      light: {
        bg: "#e5e9f0",
        surface: "#eceff4",
        surfaceRaised: "#e9edf2",
        surfaceHover: "#d8dee9",
        border: "#c9d1de",
        muted: "#4c566a",
        text: "#2e3440"
      },
      radius: SOFT
    }
  },
  {
    /* Mocha and Latte from catppuccin/palette's palette.json. base, mantle,
       surface0/1/2, text and subtext0 are exact; the border step is derived
       from surface1 and surface2, which is where a border sits in their own
       ports. */
    id: "catppuccin",
    name: "Catppuccin",
    note: "Mocha for dark, Latte for light. Mauve does the accent work.",
    group: "Ported",
    source: "catppuccin/palette, MIT",
    theme: {
      name: "Catppuccin",
      hue: {
        accent: "#cba6f7",
        accentLight: "#dcc0fa",
        secondary: "#89b4fa",
        secondaryLight: "#a8c8fb",
        success: "#a6e3a1",
        danger: "#f38ba8",
        dangerLight: "#eba0ac",
        warning: "#f9e2af",
        onAccent: "#1e1e2e",
        onSecondary: "#1e1e2e",
        onDanger: "#1e1e2e"
      },
      lightHue: {
        accent: "#8839ef",
        accentLight: "#9a55f2",
        secondary: "#1e66f5",
        secondaryLight: "#4680f7",
        success: "#40a02b",
        danger: "#d20f39",
        dangerLight: "#e64553",
        warning: "#df8e1d",
        onAccent: "#eff1f5",
        onSecondary: "#eff1f5",
        onDanger: "#eff1f5"
      },
      dark: {
        bg: "#1e1e2e",
        surface: "#313244",
        surfaceRaised: "#45475a",
        surfaceHover: "#585b70",
        border: "#45475a",
        muted: "#a6adc8",
        text: "#cdd6f4"
      },
      light: {
        bg: "#e6e9ef",
        surface: "#eff1f5",
        surfaceRaised: "#eaedf3",
        surfaceHover: "#dce0e8",
        border: "#ccd0da",
        muted: "#6c6f85",
        text: "#4c4f69"
      },
      radius: ROUND
    }
  },
  {
    /* Primer's functional tokens, from @primer/primitives' compiled themes:
       bgColor-default, bgColor-muted, borderColor-default, fgColor-default,
       fgColor-muted, and the -emphasis fills for accent, danger, success,
       attention and done. The raised and hover steps are derived — Primer
       expresses those as translucent overlays rather than as solid colours. */
    id: "github",
    name: "GitHub",
    note: "Primer's own tokens, six-pixel corners included.",
    group: "Ported",
    source: "@primer/primitives",
    theme: {
      name: "GitHub",
      hue: {
        accent: "#1f6feb",
        accentLight: "#4493f8",
        secondary: "#8957e5",
        secondaryLight: "#a371f7",
        success: "#238636",
        danger: "#da3633",
        dangerLight: "#f85149",
        warning: "#9e6a03",
        onAccent: "#ffffff",
        onSecondary: "#ffffff",
        onDanger: "#ffffff"
      },
      lightHue: {
        accent: "#0969da",
        accentLight: "#218bff",
        secondary: "#8250df",
        secondaryLight: "#a475f9",
        success: "#1f883d",
        danger: "#cf222e",
        dangerLight: "#d1242f",
        warning: "#9a6700",
        onAccent: "#ffffff",
        onSecondary: "#ffffff",
        onDanger: "#ffffff"
      },
      dark: {
        bg: "#0d1117",
        surface: "#151b23",
        surfaceRaised: "#1c222b",
        surfaceHover: "#262c36",
        border: "#3d444d",
        muted: "#9198a1",
        text: "#f0f6fc"
      },
      light: {
        bg: "#f6f8fa",
        surface: "#ffffff",
        surfaceRaised: "#fbfcfd",
        surfaceHover: "#eef1f4",
        border: "#d1d9e0",
        muted: "#59636e",
        text: "#1f2328"
      },
      radius: CRISP
    }
  },
  {
    /* Read off anthropic.com's own stylesheet: the clay #d97757, the cream
       #f0eee6 and #faf9f5, the ink #141413, and the neutrals #3d3d3a,
       #87867f, #b0aea5, #c6c4ba, #e8e6dc. Anthropic publishes no token file,
       so the status hues have no published counterpart and are Gryt's own —
       this is the one preset that is a likeness rather than a port. */
    id: "claude",
    name: "Claude",
    note: "Anthropic's clay orange on cream and near-black.",
    group: "Ported",
    source: "anthropic.com — a likeness, not a published palette",
    theme: {
      name: "Claude",
      hue: {
        accent: "#d97757",
        accentLight: "#e59275",
        secondary: "#7d9ec4",
        secondaryLight: "#9db8d6",
        success: "#6ba368",
        danger: "#bf4d43",
        dangerLight: "#d4726a",
        warning: "#d9a441",
        onAccent: "#241009",
        onSecondary: "#0c1720",
        onDanger: "#faf9f5"
      },
      lightHue: null,
      dark: {
        bg: "#141413",
        surface: "#1f1e1d",
        surfaceRaised: "#262624",
        surfaceHover: "#3d3d3a",
        border: "#3d3d3a",
        muted: "#b0aea5",
        text: "#faf9f5"
      },
      light: {
        bg: "#f0eee6",
        surface: "#faf9f5",
        surfaceRaised: "#f5f3ec",
        surfaceHover: "#e8e6dc",
        border: "#d5d2c5",
        muted: "#87867f",
        text: "#141413"
      },
      radius: ROUND
    }
  },
  {
    /* The zinc theme from shadcn-ui/ui's registry, converted from its OKLCH
       values. One deliberate departure: shadcn's primary is monochrome —
       near-white in dark, near-black in light — which cannot be a Gryt accent,
       because the accent is also the colour every link and focus ring is drawn
       from. Its destructive red is the accent here, and the neutrals are the
       theme's own. */
    id: "shadcn",
    name: "shadcn/ui",
    note: "Zinc neutrals and a ten-pixel radius. No pills anywhere.",
    group: "Ported",
    source: "ui.shadcn.com, MIT — accent adapted",
    theme: {
      name: "shadcn/ui",
      hue: {
        accent: "#a1a1aa",
        accentLight: "#d4d4d8",
        secondary: "#71717a",
        secondaryLight: "#a1a1aa",
        success: "#4ade80",
        danger: "#e7000b",
        dangerLight: "#fb2c36",
        warning: "#fd9a00",
        onAccent: "#18181b",
        onSecondary: "#fafafa",
        onDanger: "#fafafa"
      },
      lightHue: {
        accent: "#3f3f46",
        accentLight: "#52525b",
        secondary: "#71717a",
        secondaryLight: "#a1a1aa",
        success: "#00a63e",
        danger: "#e7000b",
        dangerLight: "#fb2c36",
        warning: "#e17100",
        onAccent: "#fafafa",
        onSecondary: "#fafafa",
        onDanger: "#fafafa"
      },
      dark: {
        bg: "#18181b",
        surface: "#27272a",
        surfaceRaised: "#3f3f46",
        surfaceHover: "#3f3f46",
        border: "#3f3f46",
        muted: "#a1a1aa",
        text: "#fafafa"
      },
      light: {
        bg: "#f4f4f5",
        surface: "#ffffff",
        surfaceRaised: "#fafafa",
        surfaceHover: "#e4e4e7",
        border: "#e4e4e7",
        muted: "#71717a",
        text: "#18181b"
      },
      radius: SHADCN
    }
  },
  {
    /* Ethan Schoonover's sixteen, exactly. base03 and base02 are the dark
       page and surface, base2 and base3 the light ones, and the accent hues
       are shared between the two halves — which is the whole point of
       Solarized. The steps between base03 and base02 are derived. */
    id: "solarized",
    name: "Solarized",
    note: "Both halves on one set of accents, as designed.",
    group: "Ported",
    source: "ethanschoonover.com/solarized, MIT",
    theme: {
      name: "Solarized",
      hue: {
        accent: "#268bd2",
        accentLight: "#4ba3e3",
        secondary: "#2aa198",
        secondaryLight: "#43bbb1",
        success: "#859900",
        danger: "#dc322f",
        dangerLight: "#cb4b16",
        warning: "#b58900",
        onAccent: "#fdf6e3",
        onSecondary: "#002b36",
        onDanger: "#fdf6e3"
      },
      lightHue: null,
      dark: {
        bg: "#002b36",
        surface: "#073642",
        surfaceRaised: "#0b414f",
        surfaceHover: "#134b5a",
        border: "#0f4757",
        muted: "#93a1a1",
        text: "#eee8d5"
      },
      light: {
        bg: "#eee8d5",
        surface: "#fdf6e3",
        surfaceRaised: "#f7f0dc",
        surfaceHover: "#e4dcc4",
        border: "#d9d0b4",
        muted: "#586e75",
        text: "#073642"
      },
      radius: SQUARE
    }
  }
];

export const grytPresetsById = new Map(
  grytPresets.map((preset) => [preset.id, preset])
);
