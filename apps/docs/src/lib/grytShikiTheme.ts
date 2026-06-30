import type { ThemeRegistration } from "shiki/types";

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
