import type { ThemeRegistration } from "shiki/types";

/* Two themes, one set of roles.
 *
 * Shiki writes its colours inline, so a block highlighted for dark and shown on
 * a light page is near-white keywords on near-white paper. Both are emitted for
 * every block — Shiki's dual-theme output puts --shiki-light and --shiki-dark
 * on each span — and the .light block on the root picks. Nothing re-highlights
 * when somebody toggles, because both sets are already in the markup.
 *
 * The light one is not the dark one inverted. The roles are the same and the
 * values are the ones that read on paper: the greens and ambers that carry a
 * dark background are the first to disappear on a white one, so they are the
 * ones that moved furthest.
 */

export const grytShikiTheme: ThemeRegistration = {
  name: "gryt-dark",
  type: "dark",
  fg: "#e0e0e6",
  bg: "#0d0f13",
  colors: {
    "editor.background": "#0d0f13",
    "editor.foreground": "#e0e0e6",
    "editorLineNumber.foreground": "#555555",
    "editorLineNumber.activeForeground": "#888888",
    "editorCursor.foreground": "#968FF8",
    "editor.selectionBackground": "#968FF833"
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#888888", fontStyle: "italic" }
    },
    {
      scope: ["string", "constant.other.symbol", "markup.inserted"],
      settings: { foreground: "#4ade80" }
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "support.constant",
        "variable.parameter"
      ],
      settings: { foreground: "#fbbf24" }
    },
    {
      scope: [
        "keyword",
        "storage.type",
        "storage.modifier",
        "entity.name.tag",
        "support.type.property-name"
      ],
      settings: { foreground: "#75a7ff" }
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "entity.name.type",
        "entity.other.inherited-class"
      ],
      settings: { foreground: "#4ade80" }
    },
    {
      scope: [
        "support.type",
        "support.class",
        "variable.other.object",
        "support.variable.property"
      ],
      settings: { foreground: "#56d4dd" }
    },
    {
      scope: [
        "variable",
        "source",
        "punctuation",
        "meta.brace",
        "meta.delimiter"
      ],
      settings: { foreground: "#e0e0e6" }
    },
    {
      scope: ["entity.name.section", "markup.heading"],
      settings: { foreground: "#b4afff", fontStyle: "bold" }
    },
    {
      scope: ["markup.bold"],
      settings: { foreground: "#e0e0e6", fontStyle: "bold" }
    },
    {
      scope: ["markup.italic"],
      settings: { foreground: "#e0e0e6", fontStyle: "italic" }
    },
    {
      scope: ["markup.deleted", "invalid", "invalid.illegal"],
      settings: { foreground: "#f87171" }
    }
  ]
};

export const grytShikiThemeLight: ThemeRegistration = {
  name: "gryt-light",
  type: "light",
  fg: "#1f2129",
  bg: "#f7f8fb",
  colors: {
    "editor.background": "#f7f8fb",
    "editor.foreground": "#1f2129",
    "editorLineNumber.foreground": "#9aa0ab",
    "editorLineNumber.activeForeground": "#5b5d65",
    "editorCursor.foreground": "#5b4bd6",
    "editor.selectionBackground": "#968ff833"
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#6b6d76", fontStyle: "italic" }
    },
    {
      scope: ["string", "constant.other.symbol", "markup.inserted"],
      settings: { foreground: "#0f7a3d" }
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "support.constant",
        "variable.parameter"
      ],
      settings: { foreground: "#9a5b00" }
    },
    {
      scope: [
        "keyword",
        "storage.type",
        "storage.modifier",
        "entity.name.tag",
        "support.type.property-name"
      ],
      settings: { foreground: "#1f5fd0" }
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "entity.name.type",
        "entity.other.inherited-class"
      ],
      settings: { foreground: "#0f7a3d" }
    },
    {
      scope: [
        "support.type",
        "support.class",
        "variable.other.object",
        "support.variable.property"
      ],
      settings: { foreground: "#0a6c78" }
    },
    {
      scope: [
        "variable",
        "source",
        "punctuation",
        "meta.brace",
        "meta.delimiter"
      ],
      settings: { foreground: "#1f2129" }
    },
    {
      scope: ["entity.name.section", "markup.heading"],
      settings: { foreground: "#5b4bd6", fontStyle: "bold" }
    },
    {
      scope: ["markup.bold"],
      settings: { foreground: "#1f2129", fontStyle: "bold" }
    },
    {
      scope: ["markup.italic"],
      settings: { foreground: "#1f2129", fontStyle: "italic" }
    },
    {
      scope: ["markup.deleted", "invalid", "invalid.illegal"],
      settings: { foreground: "#b3261e" }
    }
  ]
};
