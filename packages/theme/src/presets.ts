/* Themes to start from, in the collections the picker groups them by. Every ported value
 * is the published one, and the Gryt-authored collections were generated in OKLCH. */

/* Names belong to their projects. Dracula, Nord, Catppuccin, Solarized and shadcn/ui are
 * MIT-licensed; the rest are referenced by name only. */

import type { GrytRadiusKey, GrytTheme } from "./theme";
import { cloneGrytTheme, grytTheme } from "./theme";

/** The collections, in the order the picker shows them. */
export const GRYT_THEME_COLLECTIONS = [
  "Gryt",
  "Owl",
  "Midnight",
  "Winter",
  "Spring",
  "Summer",
  "Autumn",
  "Nature",
  "Pastel",
  "Brands"
] as const;

export type GrytThemeCollection = (typeof GRYT_THEME_COLLECTIONS)[number];

/** One line under each collection name, the way `note` sits under a theme. */
export const grytCollectionNotes: Record<GrytThemeCollection, string> = {
  Gryt: "What the library ships, and the ones that show its range.",
  Owl: "The six palettes the owl avatars are drawn from.",
  Midnight: "For dark rooms and OLED panels.",
  Winter: "Cold light, long nights.",
  Spring: "New growth and wet weather.",
  Summer: "Heat, water and late light.",
  Autumn: "The turn, from gold to grey.",
  Nature: "Places rather than seasons.",
  Pastel: "Low chroma throughout. Soft in both halves.",
  Brands: "Palettes people already use elsewhere, ported."
};

export interface GrytThemePreset {
  id: string;
  name: string;
  /** One line under the name: what makes this one different. */
  note: string;
  collection: GrytThemeCollection;
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
/** Softer than ROUND at every step. The pastel set uses it. */
const PUFFY: Radius = { sm: 12, md: 16, lg: 24, xl: 32, full: 999 };

export const grytPresets: GrytThemePreset[] = [
  {
    id: "gryt",
    name: "Gryt",
    note: "What the library ships, from the Gryt code-theme.",
    collection: "Gryt",
    source: "github.com/Gryt-chat/code-theme",
    theme: grytTheme
  },
  {
    /* Credits to Carlo, who made this in the generator and sent the link. Same colours;
       the change is `full` dropping 999 to 8, so the pills become rectangles. */
    id: "gryt-rounded",
    name: "Gryt Rounded",
    note: "The shipped palette, every corner at eight pixels. Made by Carlo.",
    collection: "Gryt",
    source: "Carlo",
    theme: { ...cloneGrytTheme(grytTheme), name: "Gryt Rounded", radius: EIGHT }
  },
  {
    id: "ember",
    name: "Ember",
    note: "Warm all the way down — the neutrals are brown, not blue.",
    collection: "Gryt",
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
    collection: "Gryt",
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

  /*
   * The owl palettes as themes, derived in OKLCH rather than lifted — a ramp built by
   * darkening sRGB drifts grey. `onAccent` is whichever ink has more contrast.
   */
  {
    id: "owl-rose",
    name: "Rose",
    note: "Dusty rose over plum. The warmest of the six.",
    collection: "Owl",
    source: "Gryt owl palettes",
    theme: {
      name: "Rose",
      hue: {
        accent: "#D87489",
        accentLight: "#EDAAAF",
        secondary: "#d7906f",
        secondaryLight: "#efb499",
        success: "#69b27a",
        danger: "#da534f",
        dangerLight: "#f07f77",
        warning: "#e6ac3d",
        onAccent: "#2b0614",
        onSecondary: "#2b0614",
        onDanger: "#2b0a08"
      },
      lightHue: null,
      dark: {
        bg: "#1f020b",
        surface: "#2b0c16",
        surfaceRaised: "#34151e",
        surfaceHover: "#45202b",
        border: "#4c2933",
        muted: "#a38b90",
        text: "#f4ede9"
      },
      light: {
        bg: "#fbf1ed",
        surface: "#fffcfb",
        surfaceRaised: "#fdf5f1",
        surfaceHover: "#f3e6e1",
        border: "#e4d6d0",
        muted: "#765b61",
        text: "#31151d"
      },
      radius: ROUND
    }
  },
  {
    id: "owl-amber",
    name: "Amber",
    note: "Amber on aubergine — a warm accent over cool-dark neutrals.",
    collection: "Owl",
    source: "Gryt owl palettes",
    theme: {
      name: "Amber",
      hue: {
        accent: "#E39336",
        accentLight: "#ECC07C",
        secondary: "#c0b760",
        secondaryLight: "#ddd793",
        success: "#69b27a",
        danger: "#da534f",
        dangerLight: "#f07f77",
        warning: "#e6ac3d",
        onAccent: "#1e101e",
        onSecondary: "#1e101e",
        onDanger: "#2b0a08"
      },
      lightHue: null,
      dark: {
        bg: "#140814",
        surface: "#20131f",
        surfaceRaised: "#281c27",
        surfaceHover: "#372836",
        border: "#3e303d",
        muted: "#988f97",
        text: "#f1eee8"
      },
      light: {
        bg: "#f7f3ec",
        surface: "#fffdfa",
        surfaceRaised: "#faf6f0",
        surfaceHover: "#efe9df",
        border: "#dfd8cd",
        muted: "#6a5f69",
        text: "#261b26"
      },
      radius: ROUND
    }
  },
  {
    id: "owl-wine",
    name: "Wine",
    note: "Deep red throughout. Neutrals carry the same hue as the accent.",
    collection: "Owl",
    source: "Gryt owl palettes",
    theme: {
      name: "Wine",
      hue: {
        accent: "#CE7072",
        accentLight: "#E29A98",
        secondary: "#c88d61",
        secondaryLight: "#e0b08d",
        success: "#69b27a",
        danger: "#da534f",
        dangerLight: "#f07f77",
        warning: "#e6ac3d",
        onAccent: "#250d16",
        onSecondary: "#250d16",
        onDanger: "#2b0a08"
      },
      lightHue: null,
      dark: {
        bg: "#1a050d",
        surface: "#261118",
        surfaceRaised: "#2e1920",
        surfaceHover: "#3e252e",
        border: "#452e35",
        muted: "#9d8d92",
        text: "#f4edea"
      },
      light: {
        bg: "#faf1ee",
        surface: "#fffdfb",
        surfaceRaised: "#fdf5f1",
        surfaceHover: "#f2e7e2",
        border: "#e3d6d0",
        muted: "#705d63",
        text: "#2c191f"
      },
      radius: ROUND
    }
  },
  {
    id: "owl-indigo",
    name: "Indigo",
    note: "Periwinkle on deep indigo. The closest to the Gryt mark.",
    collection: "Owl",
    source: "Gryt owl palettes",
    theme: {
      name: "Indigo",
      hue: {
        accent: "#786FF6",
        accentLight: "#9E97FA",
        secondary: "#ba70cb",
        secondaryLight: "#d397e1",
        success: "#69b27a",
        danger: "#da534f",
        dangerLight: "#f07f77",
        warning: "#e6ac3d",
        onAccent: "#121329",
        onSecondary: "#121329",
        onDanger: "#2b0a08"
      },
      lightHue: null,
      dark: {
        bg: "#0a0b1e",
        surface: "#151629",
        surfaceRaised: "#1d1e32",
        surfaceHover: "#2a2c42",
        border: "#323348",
        muted: "#8f919f",
        text: "#eeeef3"
      },
      light: {
        bg: "#f3f2f9",
        surface: "#fdfdff",
        surfaceRaised: "#f6f6fc",
        surfaceHover: "#e9e8f1",
        border: "#d9d8e2",
        muted: "#606272",
        text: "#1c1d2f"
      },
      radius: ROUND
    }
  },
  {
    id: "owl-forest",
    name: "Forest",
    note: "Sage over slate. The only one whose accent is the quiet colour.",
    collection: "Owl",
    source: "Gryt owl palettes",
    theme: {
      name: "Forest",
      hue: {
        accent: "#98B4A1",
        accentLight: "#C7D7CA",
        secondary: "#a2bfbe",
        secondaryLight: "#c5dddc",
        success: "#69b27a",
        danger: "#da534f",
        dangerLight: "#f07f77",
        warning: "#e6ac3d",
        onAccent: "#13161e",
        onSecondary: "#13161e",
        onDanger: "#2b0a08"
      },
      lightHue: null,
      dark: {
        bg: "#0a0d14",
        surface: "#15181f",
        surfaceRaised: "#1d2028",
        surfaceHover: "#2a2e36",
        border: "#32353d",
        muted: "#909297",
        text: "#edefed"
      },
      light: {
        bg: "#f2f4f2",
        surface: "#fdfefd",
        surfaceRaised: "#f5f7f6",
        surfaceHover: "#e7eae8",
        border: "#d7dad7",
        muted: "#616369",
        text: "#1d1f26"
      },
      radius: ROUND
    }
  },
  {
    id: "owl-ice",
    name: "Ice",
    note: "Steel blue on near-white. Built light first.",
    collection: "Owl",
    source: "Gryt owl palettes",
    theme: {
      name: "Ice",
      hue: {
        accent: "#7495B9",
        accentLight: "#BADDFC",
        secondary: "#9c99bc",
        secondaryLight: "#bcbad6",
        success: "#69b27a",
        danger: "#da534f",
        dangerLight: "#f07f77",
        warning: "#e6ac3d",
        onAccent: "#10171e",
        onSecondary: "#10171e",
        onDanger: "#2b0a08"
      },
      lightHue: null,
      dark: {
        bg: "#080e14",
        surface: "#13191f",
        surfaceRaised: "#1b2127",
        surfaceHover: "#272f36",
        border: "#2f363d",
        muted: "#8e9397",
        text: "#eeeeef"
      },
      light: {
        bg: "#f3f3f4",
        surface: "#fdfdfe",
        surfaceRaised: "#f6f7f8",
        surfaceHover: "#e9e9eb",
        border: "#d8d9da",
        muted: "#5f6469",
        text: "#1a2025"
      },
      radius: ROUND
    }
  },
  {
    /* Four photographs: snow-loaded spruces, white strips in a dark room, a white can on
       black rubber, grey sweatpants. The can is the accent, hence the split `lightHue`. */
    id: "winter-arc",
    name: "Winter Arc",
    note: "Cold monochrome. A near-white accent in the dark, snow-light greys.",
    /* The secondary and the danger, in both halves, were moved in GRYT-994: text on a
       filled colour is held to 7:1 here and these measured 6.07, 4.96, 4.68 and 5.27. */
    collection: "Winter",
    theme: {
      name: "Winter Arc",
      hue: {
        accent: "#dce6ec",
        accentLight: "#f0f6f9",
        secondary: "#88a1af",
        secondaryLight: "#a9bdc8",
        success: "#7fa88d",
        danger: "#e08386",
        dangerLight: "#f4a7a9",
        warning: "#b9a068",
        onAccent: "#0b0d0f",
        onSecondary: "#0b1114",
        onDanger: "#1b0c0d"
      },
      lightHue: {
        accent: "#2b3a44",
        accentLight: "#43596a",
        secondary: "#3b5564",
        secondaryLight: "#546f7d",
        success: "#4a7059",
        danger: "#8e353a",
        dangerLight: "#a3575b",
        warning: "#856c33",
        onAccent: "#eef3f6",
        onSecondary: "#eef3f6",
        onDanger: "#fdf2f2"
      },
      dark: {
        bg: "#0b0d0f",
        surface: "#111417",
        surfaceRaised: "#171b1f",
        surfaceHover: "#1f252a",
        border: "#2a3238",
        muted: "#8b979f",
        text: "#eef3f6"
      },
      light: {
        bg: "#eaeef1",
        surface: "#ffffff",
        surfaceRaised: "#f4f7f9",
        surfaceHover: "#dde4e9",
        border: "#c6d0d7",
        muted: "#55626b",
        text: "#0f1417"
      },
      /* Hard corners on purpose. The reference is window mullions, plate
         edges and rubber floor tiles, and Paper already has the soft set. */
      radius: CRISP
    }
  },
  {
    id: "signal",
    name: "Signal",
    note: "Black, white, and a yellow that cannot be missed.",
    collection: "Gryt",
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
    id: "oled",
    name: "OLED",
    note: "True black. On an OLED panel the background is pixels switched off.",
    collection: "Midnight",
    theme: {
      name: "OLED",
      hue: {
        accent: "#a497ff",
        accentLight: "#bfb9ff",
        secondary: "#2cd0eb",
        secondaryLight: "#7ae9fe",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#160c37",
        onSecondary: "#001a1f",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#000000",
        surface: "#08090c",
        surfaceRaised: "#0d0e13",
        surfaceHover: "#22242e",
        border: "#1b1d25",
        muted: "#8b8b96",
        text: "#ececf2"
      },
      light: {
        bg: "#ffffff",
        surface: "#ffffff",
        surfaceRaised: "#f5f5f7",
        surfaceHover: "#e6e6ea",
        border: "#d4d4da",
        muted: "#5a5a63",
        text: "#000000"
      },
      radius: SOFT
    }
  },
  {
    id: "obsidian",
    name: "Obsidian",
    note: "Blue-black glass. One cold accent and nothing warm anywhere.",
    collection: "Midnight",
    theme: {
      name: "Obsidian",
      hue: {
        accent: "#75caf2",
        accentLight: "#aae3ff",
        secondary: "#acaeff",
        secondaryLight: "#cbceff",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001925",
        onSecondary: "#131031",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#05070d",
        surface: "#0d1117",
        surfaceRaised: "#13171d",
        surfaceHover: "#22272e",
        border: "#1b2027",
        muted: "#888c92",
        text: "#e6e8ea"
      },
      light: {
        bg: "#eff3f9",
        surface: "#ffffff",
        surfaceRaised: "#f5f9fd",
        surfaceHover: "#e1e8f0",
        border: "#d3dae2",
        muted: "#61656a",
        text: "#1d2125"
      },
      radius: CRISP
    }
  },
  {
    id: "eclipse",
    name: "Eclipse",
    note: "Near-black with a corona. The amber is the only light in it.",
    collection: "Midnight",
    theme: {
      name: "Eclipse",
      hue: {
        accent: "#ffc336",
        accentLight: "#ffe1a6",
        secondary: "#fb836d",
        secondaryLight: "#feaf9e",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#1f1400",
        onSecondary: "#320100",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#090604",
        surface: "#120e0b",
        surfaceRaised: "#181411",
        surfaceHover: "#292420",
        border: "#221d1a",
        muted: "#8f8b88",
        text: "#e9e7e6"
      },
      light: {
        bg: "#f8f1ec",
        surface: "#fffffe",
        surfaceRaised: "#fcf7f4",
        surfaceHover: "#eee5dd",
        border: "#e1d8d0",
        muted: "#69635f",
        text: "#241f1c"
      },
      radius: SQUARE
    }
  },
  {
    id: "carbon",
    name: "Carbon",
    note: "No hue in the greys at all, and a red that does all the talking.",
    collection: "Midnight",
    theme: {
      name: "Carbon",
      hue: {
        accent: "#ff645f",
        accentLight: "#ff9890",
        secondary: "#c889d7",
        secondaryLight: "#e0a8ec",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#150001",
        onSecondary: "#23082a",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#090909",
        surface: "#121313",
        surfaceRaised: "#181919",
        surfaceHover: "#282929",
        border: "#222223",
        muted: "#8c8c8c",
        text: "#e8e8e8"
      },
      light: {
        bg: "#f2f3f4",
        surface: "#feffff",
        surfaceRaised: "#f8f8f9",
        surfaceHover: "#e5e7e9",
        border: "#d8d9db",
        muted: "#646566",
        text: "#202021"
      },
      radius: CRISP
    }
  },
  {
    id: "frost",
    name: "Frost",
    note: "Ice blue on a pale, soft dark. The light half is properly cold.",
    collection: "Winter",
    theme: {
      name: "Frost",
      hue: {
        accent: "#11d2ff",
        accentLight: "#9de6fe",
        secondary: "#86e4e1",
        secondaryLight: "#a6f6f3",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001a22",
        onSecondary: "#001b1a",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#041720",
        surface: "#0e212b",
        surfaceRaised: "#142832",
        surfaceHover: "#223a46",
        border: "#1c323e",
        muted: "#7f8f98",
        text: "#e2e9ed"
      },
      light: {
        bg: "#e6f6fe",
        surface: "#ffffff",
        surfaceRaised: "#f1faff",
        surfaceHover: "#caedff",
        border: "#bde0f1",
        muted: "#526874",
        text: "#10232c"
      },
      radius: SOFT
    }
  },
  {
    id: "aurora",
    name: "Aurora",
    note: "Polar night under green and violet.",
    collection: "Winter",
    theme: {
      name: "Aurora",
      hue: {
        accent: "#52d88c",
        accentLight: "#85f1ae",
        secondary: "#b38fff",
        secondaryLight: "#c9b4ff",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001d0b",
        onSecondary: "#1b0935",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#060915",
        surface: "#0f131f",
        surfaceRaised: "#141926",
        surfaceHover: "#232939",
        border: "#1d2331",
        muted: "#878c98",
        text: "#e6e8ed"
      },
      light: {
        bg: "#eff3fa",
        surface: "#feffff",
        surfaceRaised: "#f6f8fe",
        surfaceHover: "#e2e7f2",
        border: "#d4dae4",
        muted: "#61656b",
        text: "#1e2026"
      },
      radius: ROUND
    }
  },
  {
    id: "pine",
    name: "Pine",
    note: "Evergreen and snow, with a berry red for the danger states.",
    collection: "Winter",
    theme: {
      name: "Pine",
      hue: {
        accent: "#03c2a9",
        accentLight: "#5fdbc4",
        secondary: "#f66c6f",
        secondaryLight: "#ff9896",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001b16",
        onSecondary: "#170001",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#000602",
        surface: "#030f08",
        surfaceRaised: "#07150e",
        surfaceHover: "#14261c",
        border: "#0e1f16",
        muted: "#839088",
        text: "#e4e9e6"
      },
      light: {
        bg: "#edf5f3",
        surface: "#ffffff",
        surfaceRaised: "#f4faf9",
        surfaceHover: "#deeae7",
        border: "#d1dcda",
        muted: "#5f6665",
        text: "#1c2221"
      },
      radius: ROUND
    }
  },
  {
    id: "wool",
    name: "Wool",
    note: "Oatmeal and dusty rose. Winter indoors rather than outside.",
    collection: "Winter",
    theme: {
      name: "Wool",
      hue: {
        accent: "#e79a91",
        accentLight: "#fdb8b0",
        secondary: "#81b0db",
        secondaryLight: "#a1cbf0",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#290b09",
        onSecondary: "#031729",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#17110d",
        surface: "#211b17",
        surfaceRaised: "#28221d",
        surfaceHover: "#39322d",
        border: "#322b26",
        muted: "#908b87",
        text: "#eae7e6"
      },
      light: {
        bg: "#faf2e4",
        surface: "#fffffe",
        surfaceRaised: "#fef8ee",
        surfaceHover: "#f1e5d2",
        border: "#e4d8c5",
        muted: "#6b6457",
        text: "#251f16"
      },
      radius: PUFFY
    }
  },
  {
    id: "blossom",
    name: "Blossom",
    note: "Cherry against new green.",
    collection: "Spring",
    theme: {
      name: "Blossom",
      hue: {
        accent: "#ff82b1",
        accentLight: "#ffb3cc",
        secondary: "#92d98a",
        secondaryLight: "#b5f3ae",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#2f0116",
        onSecondary: "#001d00",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#13090e",
        surface: "#1d1318",
        surfaceRaised: "#23191f",
        surfaceHover: "#352830",
        border: "#2e2229",
        muted: "#93898e",
        text: "#ebe6e9"
      },
      light: {
        bg: "#fbeff4",
        surface: "#ffffff",
        surfaceRaised: "#fef6fa",
        surfaceHover: "#f2e2e9",
        border: "#e4d4dc",
        muted: "#6b6166",
        text: "#261e22"
      },
      radius: PUFFY
    }
  },
  {
    id: "meadow",
    name: "Meadow",
    note: "Grass and sky, both turned up.",
    collection: "Spring",
    theme: {
      name: "Meadow",
      hue: {
        accent: "#77d163",
        accentLight: "#9dea8c",
        secondary: "#5fc8fa",
        secondaryLight: "#a5dffe",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#011d00",
        onSecondary: "#001926",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#090f09",
        surface: "#131912",
        surfaceRaised: "#191f18",
        surfaceHover: "#293028",
        border: "#222921",
        muted: "#888e88",
        text: "#e6e9e6"
      },
      light: {
        bg: "#f0f5ed",
        surface: "#fefffe",
        surfaceRaised: "#f6faf4",
        surfaceHover: "#e2e9df",
        border: "#d5dcd2",
        muted: "#626660",
        text: "#1e221c"
      },
      radius: ROUND
    }
  },
  {
    id: "rain",
    name: "Rain",
    note: "Wet grey-green. The quiet one in this set.",
    collection: "Spring",
    theme: {
      name: "Rain",
      hue: {
        accent: "#0cd8dd",
        accentLight: "#6cf1f5",
        secondary: "#a7bf77",
        secondaryLight: "#c3d99b",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001b1c",
        onSecondary: "#111a00",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#032223",
        surface: "#0e2d2e",
        surfaceRaised: "#153435",
        surfaceHover: "#224648",
        border: "#1d3f40",
        muted: "#7b9192",
        text: "#e1eaea"
      },
      light: {
        bg: "#ddf9fb",
        surface: "#feffff",
        surfaceRaised: "#e9fdfe",
        surfaceHover: "#c7f0f2",
        border: "#bae2e5",
        muted: "#506a6c",
        text: "#0d2526"
      },
      radius: SOFT
    }
  },
  {
    id: "tulip",
    name: "Tulip",
    note: "A flat red and a yellow, on crisp corners.",
    collection: "Spring",
    theme: {
      name: "Tulip",
      hue: {
        accent: "#ff6075",
        accentLight: "#ff969e",
        secondary: "#ffc927",
        secondaryLight: "#ffe29b",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#100002",
        onSecondary: "#1e1400",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#140e0e",
        surface: "#1e1818",
        surfaceRaised: "#241e1e",
        surfaceHover: "#362e2e",
        border: "#2f2727",
        muted: "#908a8a",
        text: "#eae7e7"
      },
      light: {
        bg: "#f7f1f1",
        surface: "#ffffff",
        surfaceRaised: "#fbf7f7",
        surfaceHover: "#ede5e4",
        border: "#dfd7d7",
        muted: "#686363",
        text: "#231f1f"
      },
      radius: CRISP
    }
  },
  {
    id: "lagoon",
    name: "Lagoon",
    note: "Turquoise water over a sand-coloured light half.",
    collection: "Summer",
    theme: {
      name: "Lagoon",
      hue: {
        accent: "#27e4d5",
        accentLight: "#76fdef",
        secondary: "#ffc16a",
        secondaryLight: "#ffdfb6",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001b19",
        onSecondary: "#221200",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#051111",
        surface: "#0e1b1b",
        surfaceRaised: "#152222",
        surfaceHover: "#233333",
        border: "#1d2c2c",
        muted: "#848f8f",
        text: "#e4e9e9"
      },
      light: {
        bg: "#f8f2e4",
        surface: "#fffffe",
        surfaceRaised: "#fcf8ee",
        surfaceHover: "#efe6d2",
        border: "#e1d9c4",
        muted: "#6a6457",
        text: "#242015"
      },
      radius: ROUND
    }
  },
  {
    id: "sunset",
    name: "Sunset",
    note: "Orange and hot pink on an indigo night.",
    collection: "Summer",
    theme: {
      name: "Sunset",
      hue: {
        accent: "#ff8162",
        accentLight: "#ffaf9a",
        secondary: "#e375d6",
        secondaryLight: "#f998eb",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#300300",
        onSecondary: "#240321",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#0c0918",
        surface: "#161323",
        surfaceRaised: "#1c192a",
        surfaceHover: "#2d293d",
        border: "#262235",
        muted: "#8c8a99",
        text: "#e8e7ed"
      },
      light: {
        bg: "#fdefeb",
        surface: "#ffffff",
        surfaceRaised: "#fef6f4",
        surfaceHover: "#f6e2dc",
        border: "#e8d5cf",
        muted: "#6e625e",
        text: "#271e1b"
      },
      radius: ROUND
    }
  },
  {
    id: "citrus",
    name: "Citrus",
    note: "Lemon and lime. The brightest thing here.",
    collection: "Summer",
    theme: {
      name: "Citrus",
      hue: {
        accent: "#e7d905",
        accentLight: "#f5ea57",
        secondary: "#72da68",
        secondaryLight: "#9bf392",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#191700",
        onSecondary: "#001d00",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#0d0e07",
        surface: "#171811",
        surfaceRaised: "#1d1e17",
        surfaceHover: "#2e2f26",
        border: "#27281f",
        muted: "#8c8d86",
        text: "#e8e8e5"
      },
      light: {
        bg: "#f4f3ea",
        surface: "#fffffc",
        surfaceRaised: "#f9f9f2",
        surfaceHover: "#e8e8da",
        border: "#dbdacc",
        muted: "#66655c",
        text: "#21211a"
      },
      radius: CRISP
    }
  },
  {
    id: "dusk",
    name: "Dusk",
    note: "Deep indigo with a warm amber over it.",
    collection: "Summer",
    theme: {
      name: "Dusk",
      hue: {
        accent: "#feae43",
        accentLight: "#ffd4a3",
        secondary: "#b58eed",
        secondaryLight: "#cdadfe",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#231200",
        onSecondary: "#1d0932",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#060a16",
        surface: "#0f1420",
        surfaceRaised: "#151a27",
        surfaceHover: "#242a3a",
        border: "#1e2432",
        muted: "#878c98",
        text: "#e6e8ed"
      },
      light: {
        bg: "#f0f2fa",
        surface: "#feffff",
        surfaceRaised: "#f6f8fe",
        surfaceHover: "#e3e6f2",
        border: "#d5d9e4",
        muted: "#62646b",
        text: "#1e2026"
      },
      radius: SOFT
    }
  },
  {
    id: "harvest",
    name: "Harvest",
    note: "Wheat gold on warm brown.",
    collection: "Autumn",
    theme: {
      name: "Harvest",
      hue: {
        accent: "#e2b40a",
        accentLight: "#f9d261",
        secondary: "#ed905e",
        secondaryLight: "#ffb189",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#1e1500",
        onSecondary: "#2a0b00",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#170e04",
        surface: "#21180c",
        surfaceRaised: "#281e12",
        surfaceHover: "#3a2f20",
        border: "#32281a",
        muted: "#938b80",
        text: "#ebe7e3"
      },
      light: {
        bg: "#fbf1e4",
        surface: "#ffffff",
        surfaceRaised: "#fef7ee",
        surfaceHover: "#f2e5d1",
        border: "#e5d7c4",
        muted: "#6c6357",
        text: "#261f15"
      },
      radius: ROUND
    }
  },
  {
    id: "maple",
    name: "Maple",
    note: "Deep red-brown. The darkest of the warm ones.",
    collection: "Autumn",
    theme: {
      name: "Maple",
      hue: {
        accent: "#fe6847",
        accentLight: "#fe9a83",
        secondary: "#bbb250",
        secondaryLight: "#d4cd7b",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#170000",
        onSecondary: "#191700",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#130302",
        surface: "#1e0b08",
        surfaceRaised: "#25110e",
        surfaceHover: "#38201c",
        border: "#301a16",
        muted: "#9a8784",
        text: "#eee6e4"
      },
      light: {
        bg: "#ffefec",
        surface: "#fffefe",
        surfaceRaised: "#fef7f5",
        surfaceHover: "#fae0dc",
        border: "#ecd3cf",
        muted: "#70605e",
        text: "#291d1b"
      },
      radius: SOFT
    }
  },
  {
    id: "bramble",
    name: "Bramble",
    note: "Blackberry with an olive under it.",
    collection: "Autumn",
    theme: {
      name: "Bramble",
      hue: {
        accent: "#d874f2",
        accentLight: "#ea9dff",
        secondary: "#c1b94c",
        secondaryLight: "#dad47a",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#1e0425",
        onSecondary: "#191700",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#180d1d",
        surface: "#231728",
        surfaceRaised: "#291e2f",
        surfaceHover: "#3b2d43",
        border: "#34273a",
        muted: "#928897",
        text: "#eae6ed"
      },
      light: {
        bg: "#faeefd",
        surface: "#ffffff",
        surfaceRaised: "#fdf6ff",
        surfaceHover: "#f1e0f5",
        border: "#e4d3e8",
        muted: "#6b606e",
        text: "#251d27"
      },
      radius: CRISP
    }
  },
  {
    id: "fog",
    name: "Fog",
    note: "Grey-mauve, drained on purpose.",
    collection: "Autumn",
    theme: {
      name: "Fog",
      hue: {
        accent: "#b296ff",
        accentLight: "#cab9ff",
        secondary: "#83b5d9",
        secondaryLight: "#a4cff0",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#1a0a36",
        onSecondary: "#031827",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#040210",
        surface: "#0c091a",
        surfaceRaised: "#120f21",
        surfaceHover: "#211e34",
        border: "#1b172c",
        muted: "#8b8a9b",
        text: "#e7e7ee"
      },
      light: {
        bg: "#f2f1fe",
        surface: "#ffffff",
        surfaceRaised: "#f8f8fe",
        surfaceHover: "#e5e4fe",
        border: "#d7d6f3",
        muted: "#636275",
        text: "#201e2d"
      },
      radius: SOFT
    }
  },
  {
    id: "canopy",
    name: "Canopy",
    note: "undefined",
    collection: "Nature",
    theme: {
      name: "Canopy",
      hue: {
        accent: "#92bf4f",
        accentLight: "#b1d97b",
        secondary: "#e7a63c",
        secondaryLight: "#fdc470",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#0e1a00",
        onSecondary: "#221200",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#0b0d03",
        surface: "#14170a",
        surfaceRaised: "#1a1d10",
        surfaceHover: "#2a2e1e",
        border: "#242718",
        muted: "#8b8e82",
        text: "#e7e8e4"
      },
      light: {
        bg: "#f5f3e5",
        surface: "#fffffe",
        surfaceRaised: "#faf9ef",
        surfaceHover: "#ebe8d3",
        border: "#dddac6",
        muted: "#676558",
        text: "#222116"
      },
      radius: ROUND
    }
  },
  {
    id: "ocean",
    name: "Ocean",
    note: "Deep water. Teal accent, blue-black neutrals.",
    collection: "Nature",
    theme: {
      name: "Ocean",
      hue: {
        accent: "#0fcacc",
        accentLight: "#64e3e4",
        secondary: "#58d5a7",
        secondaryLight: "#89eec5",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001b1b",
        onSecondary: "#001c11",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#000f14",
        surface: "#03191e",
        surfaceRaised: "#092025",
        surfaceHover: "#163137",
        border: "#102a2f",
        muted: "#7e9094",
        text: "#e2e9eb"
      },
      light: {
        bg: "#e9f5f7",
        surface: "#ffffff",
        surfaceRaised: "#f2fafc",
        surfaceHover: "#d9ebed",
        border: "#ccdde0",
        muted: "#5c6769",
        text: "#192224"
      },
      radius: ROUND
    }
  },
  {
    id: "desert",
    name: "Desert",
    note: "Canyon rust on baked brown, with a bleached sand light half.",
    collection: "Nature",
    theme: {
      name: "Desert",
      hue: {
        accent: "#f87d3b",
        accentLight: "#fea77d",
        secondary: "#4dd1ef",
        secondaryLight: "#91e8ff",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#290900",
        onSecondary: "#001a20",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#150703",
        surface: "#20110a",
        surfaceRaised: "#261710",
        surfaceHover: "#39261e",
        border: "#312018",
        muted: "#978983",
        text: "#ede6e4"
      },
      light: {
        bg: "#fcf2dd",
        surface: "#ffffff",
        surfaceRaised: "#fff8ea",
        surfaceHover: "#f5e5c7",
        border: "#e7d8ba",
        muted: "#6d6350",
        text: "#271f0f"
      },
      radius: SOFT
    }
  },
  {
    id: "stone",
    name: "Stone",
    note: "Mineral grey-green, barely coloured, square corners.",
    collection: "Nature",
    theme: {
      name: "Stone",
      hue: {
        accent: "#05c897",
        accentLight: "#45e4b1",
        secondary: "#a2a6d7",
        secondaryLight: "#bec2ed",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#001c12",
        onSecondary: "#131427",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#021817",
        surface: "#0a2221",
        surfaceRaised: "#112928",
        surfaceHover: "#1e3b3a",
        border: "#193332",
        muted: "#7e908f",
        text: "#e2eae9"
      },
      light: {
        bg: "#dff9f6",
        surface: "#feffff",
        surfaceRaised: "#ebfdfb",
        surfaceHover: "#caf0ec",
        border: "#bde2de",
        muted: "#526a68",
        text: "#102523"
      },
      radius: SQUARE
    }
  },
  {
    id: "macaron",
    name: "Macaron",
    note: "Pink and mint on a soft dark. Nothing is fully saturated.",
    collection: "Pastel",
    theme: {
      name: "Macaron",
      hue: {
        accent: "#e9ade3",
        accentLight: "#ffcdf9",
        secondary: "#94e1bf",
        secondaryLight: "#b4f6d8",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#230b22",
        onSecondary: "#001c11",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#171118",
        surface: "#221c23",
        surfaceRaised: "#282229",
        surfaceHover: "#3a323b",
        border: "#332b34",
        muted: "#8f8a90",
        text: "#e9e7ea"
      },
      light: {
        bg: "#f8f0f8",
        surface: "#ffffff",
        surfaceRaised: "#fcf6fc",
        surfaceHover: "#eee3ee",
        border: "#e0d5e0",
        muted: "#696269",
        text: "#241e24"
      },
      radius: PUFFY
    }
  },
  {
    id: "sorbet",
    name: "Sorbet",
    note: "Peach and coral over cream.",
    collection: "Pastel",
    theme: {
      name: "Sorbet",
      hue: {
        accent: "#ffae88",
        accentLight: "#ffd6c3",
        secondary: "#f2a3c0",
        secondaryLight: "#fec8da",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#2b0b00",
        onSecondary: "#280917",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#1a110e",
        surface: "#251c18",
        surfaceRaised: "#2c221e",
        surfaceHover: "#3e322e",
        border: "#362c27",
        muted: "#928a87",
        text: "#ebe7e5"
      },
      light: {
        bg: "#fcf0e8",
        surface: "#ffffff",
        surfaceRaised: "#fef7f2",
        surfaceHover: "#f5e3d8",
        border: "#e7d6ca",
        muted: "#6d625b",
        text: "#271e19"
      },
      radius: PUFFY
    }
  },
  {
    id: "cotton",
    name: "Cotton",
    note: "Powder blue and lilac, the palest set in the library.",
    collection: "Pastel",
    theme: {
      name: "Cotton",
      hue: {
        accent: "#becbfe",
        accentLight: "#dce3fe",
        secondary: "#dfbbee",
        secondaryLight: "#f4daff",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#101428",
        onSecondary: "#1e0f23",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#12141d",
        surface: "#1c1f28",
        surfaceRaised: "#22252e",
        surfaceHover: "#323641",
        border: "#2c2f3a",
        muted: "#898c94",
        text: "#e6e8eb"
      },
      light: {
        bg: "#eff3fd",
        surface: "#ffffff",
        surfaceRaised: "#f6f8fe",
        surfaceHover: "#e1e7f5",
        border: "#d4d9e7",
        muted: "#61656d",
        text: "#1d2027"
      },
      radius: PUFFY
    }
  },
  {
    id: "sage",
    name: "Sage",
    note: "Muted green and oat, low chroma throughout.",
    collection: "Pastel",
    theme: {
      name: "Sage",
      hue: {
        accent: "#b9d5a3",
        accentLight: "#d5eec2",
        secondary: "#fac692",
        secondaryLight: "#ffdebe",
        success: "#60c473",
        danger: "#f5746d",
        dangerLight: "#ff9e96",
        warning: "#f9b73f",
        onAccent: "#0f1a06",
        onSecondary: "#241100",
        onDanger: "#260002"
      },
      lightHue: null,
      dark: {
        bg: "#13160f",
        surface: "#1d2019",
        surfaceRaised: "#232720",
        surfaceHover: "#34382f",
        border: "#2d3129",
        muted: "#8a8d87",
        text: "#e7e8e6"
      },
      light: {
        bg: "#f4f3e8",
        surface: "#fffffc",
        surfaceRaised: "#f9f9f1",
        surfaceHover: "#e9e8d8",
        border: "#dbdaca",
        muted: "#66655b",
        text: "#212119"
      },
      radius: SOFT
    }
  },
  {
    /* Dracula's eleven and Alucard's eleven, from the palette tables in
       dracula/dracula-theme. The steps between Background and Current Line are derived. */
    id: "dracula",
    name: "Dracula",
    note: "The purple-and-pink dark theme, with Alucard as its light half.",
    collection: "Brands",
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
    /* nord0-nord15, exactly as nordtheme.com publishes them: Polar Night dark, Snow
       Storm light, Frost the accents, Aurora the status colours. Nothing is derived. */
    id: "nord",
    name: "Nord",
    note: "Polar Night and Snow Storm, with Frost on top.",
    collection: "Brands",
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
    /* Mocha and Latte from catppuccin/palette's palette.json. The border step is derived
       from surface1 and surface2, which is where a border sits in their own ports. */
    id: "catppuccin",
    name: "Catppuccin",
    note: "Mocha for dark, Latte for light. Mauve does the accent work.",
    collection: "Brands",
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
    /* Primer's functional tokens, from @primer/primitives' compiled themes. The raised
       and hover steps are derived: Primer expresses those as translucent overlays. */
    id: "github",
    name: "GitHub",
    note: "Primer's own tokens, six-pixel corners included.",
    collection: "Brands",
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
    /* Read off anthropic.com's own stylesheet. Anthropic publishes no token file, so the
       status hues are Gryt's own — this preset is a likeness rather than a port. */
    id: "claude",
    name: "Claude",
    note: "Anthropic's clay orange on cream and near-black.",
    collection: "Brands",
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
    /* The zinc theme from shadcn-ui/ui's registry. One departure: shadcn's primary is
       monochrome, which cannot be a Gryt accent, so its destructive red is used. */
    id: "shadcn",
    name: "shadcn/ui",
    note: "Zinc neutrals and a ten-pixel radius. No pills anywhere.",
    collection: "Brands",
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
    /* Ethan Schoonover's sixteen, exactly. The accent hues are shared between the two
       halves, which is the point of Solarized; base03 to base02 is derived. */
    id: "solarized",
    name: "Solarized",
    note: "Both halves on one set of accents, as designed.",
    collection: "Brands",
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

/**
 * The presets grouped, in collection order. Here rather than in each app: the client, the
 * docs switcher and the generator all show the same list.
 */
export const grytPresetsByCollection: {
  collection: GrytThemeCollection;
  note: string;
  presets: GrytThemePreset[];
}[] = GRYT_THEME_COLLECTIONS.map((collection) => ({
  collection,
  note: grytCollectionNotes[collection],
  presets: grytPresets.filter((preset) => preset.collection === collection)
}));
