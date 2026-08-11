/* Flat depictions of each component, built from a handful of primitives.
 *
 * These are drawings, not renders. Rendering the real components would mean a
 * headless browser in the image pipeline and in CI; the components are simple
 * enough — pills, tracks, hairline panels — that a depiction on the same tokens
 * carries the shape honestly at 1200x630.
 *
 * Every colour here is a Gryt code-theme value, matching design.md. If a
 * component's real shape changes, the drawing here has to change with it.
 */

export const C = {
  paper: "#111318",
  paper2: "#1a1d24",
  paper3: "#1e2028",
  ink: "#e0e0e6",
  ink2: "#888888",
  rule: "#2b303d",
  accent: "#968ff8",
  accentInk: "#141126"
} as const;

export type DrawingKind =
  | "button" | "icon-button" | "field" | "checkbox" | "radio" | "switch"
  | "slider" | "avatar" | "badge" | "chip" | "tooltip" | "divider" | "alert"
  | "progress" | "spinner" | "skeleton" | "menu" | "tabs" | "accordion"
  | "panel" | "card" | "dialog" | "drawer" | "bubble" | "composer"
  | "conversation-item" | "cluster" | "install" | "palette";

// Satori accepts a React-like tree of plain objects.
type Style = Record<string, string | number>;
export interface Node {
  type: string;
  props: { style?: Style; children?: Node[] | string };
}

const el = (style: Style, children?: Node[] | string): Node => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children }
});

const row = (style: Style, children: Node[]): Node =>
  el({ flexDirection: "row", alignItems: "center", ...style }, children);

const col = (style: Style, children: Node[]): Node =>
  el({ flexDirection: "column", ...style }, children);

const text = (style: Style, value: string): Node =>
  el({ fontFamily: "Inter", color: C.ink2, ...style }, value);

/** A filled pill, the shape every action in the library uses. */
const pill = (label: string, filled: boolean, w?: number): Node =>
  el(
    {
      height: 46,
      paddingLeft: 22,
      paddingRight: 22,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter",
      fontSize: 17,
      ...(w ? { width: w } : {}),
      ...(filled
        ? { backgroundColor: C.accent, color: C.accentInk }
        : { border: `1.5px solid ${C.rule}`, color: C.ink })
    },
    label
  );

/** A hairline surface — the base of every panel-shaped component. */
const surface = (style: Style, children: Node[]): Node =>
  col(
    {
      backgroundColor: C.paper2,
      border: `1.5px solid ${C.rule}`,
      borderRadius: 16,
      padding: 16,
      ...style
    },
    children
  );

const bar = (w: number, h = 10, color = C.rule): Node =>
  el({ width: w, height: h, borderRadius: 999, backgroundColor: color });

const circle = (d: number, color: string, border?: string): Node =>
  el({
    width: d,
    height: d,
    borderRadius: 999,
    backgroundColor: color,
    ...(border ? { border } : {})
  });

const switchTrack = (on: boolean): Node =>
  el(
    {
      width: 110,
      height: 62,
      borderRadius: 999,
      alignItems: "center",
      padding: 6,
      justifyContent: on ? "flex-end" : "flex-start",
      backgroundColor: on ? C.accent : C.paper3,
      border: `1.5px solid ${on ? C.accent : C.rule}`
    },
    [circle(46, on ? C.accentInk : C.ink2)]
  );

const field = (label: string): Node =>
  col({ gap: 8 }, [
    text({ fontSize: 14 }, label),
    el(
      {
        width: 250,
        height: 50,
        borderRadius: 12,
        backgroundColor: C.paper3,
        border: `1.5px solid ${C.rule}`,
        alignItems: "center",
        paddingLeft: 16
      },
      [bar(96, 9, C.ink2)]
    )
  ]);

export function drawing(kind: DrawingKind): Node {
  switch (kind) {
    case "button":
      return row({ gap: 16 }, [pill("Primary", true), pill("Neutral", false)]);

    case "icon-button":
      return row({ gap: 16 }, [
        circle(52, C.accent),
        circle(52, "transparent", `1.5px solid ${C.rule}`)
      ]);

    case "field":
      return field("Server name");

    case "checkbox":
      return row({ gap: 16 }, [
        el(
          {
            width: 40, height: 40, borderRadius: 10,
            backgroundColor: C.accent, alignItems: "center", justifyContent: "center",
            fontFamily: "Inter", fontSize: 24, color: C.accentInk
          },
          "✓"
        ),
        el({ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${C.rule}` }),
        text({ fontSize: 17 }, "Push to talk")
      ]);

    case "radio":
      return row({ gap: 16 }, [
        el(
          { width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.accent}`,
            alignItems: "center", justifyContent: "center" },
          [circle(20, C.accent)]
        ),
        el({ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.rule}` }),
        text({ fontSize: 17 }, "Voice activity")
      ]);

    case "switch":
      return row({ gap: 18 }, [switchTrack(true), switchTrack(false)]);

    case "slider":
      return col({ gap: 14, width: 300 }, [
        row({ alignItems: "center" }, [
          bar(180, 8, C.accent),
          el({ marginLeft: -10 }, [circle(30, C.ink)]),
          bar(100, 8, C.rule)
        ])
      ]);

    case "avatar":
      return row({ gap: -14 }, [
        el(
          { width: 62, height: 62, borderRadius: 999, backgroundColor: C.accent,
            alignItems: "center", justifyContent: "center",
            fontFamily: "Inter", fontSize: 24, color: C.accentInk },
          "S"
        ),
        el(
          { width: 62, height: 62, borderRadius: 999, backgroundColor: C.paper3,
            border: `2px solid ${C.paper}`, alignItems: "center", justifyContent: "center",
            fontFamily: "Inter", fontSize: 24, color: C.ink },
          "K"
        )
      ]);

    case "badge":
      return row({ gap: 18, alignItems: "flex-start" }, [
        row({}, [
          circle(54, C.paper3, `1.5px solid ${C.rule}`),
          el(
            { marginLeft: -18, marginTop: -8, height: 28, minWidth: 28,
              paddingLeft: 9, paddingRight: 9, borderRadius: 999,
              backgroundColor: C.accent, color: C.accentInk,
              alignItems: "center", justifyContent: "center",
              fontFamily: "Inter", fontSize: 15 },
            "3"
          )
        ])
      ]);

    case "chip":
      return row({ gap: 12 }, [
        el(
          { height: 38, paddingLeft: 16, paddingRight: 16, borderRadius: 999,
            backgroundColor: C.accent, color: C.accentInk, alignItems: "center",
            fontFamily: "Inter", fontSize: 15 },
          "Online"
        ),
        el(
          { height: 38, paddingLeft: 16, paddingRight: 16, borderRadius: 999,
            border: `1.5px solid ${C.rule}`, color: C.ink, alignItems: "center",
            fontFamily: "Inter", fontSize: 15 },
          "Away"
        )
      ]);

    case "tooltip":
      return col({ gap: 10, alignItems: "center" }, [
        el(
          { paddingLeft: 14, paddingRight: 14, height: 38, borderRadius: 10,
            backgroundColor: C.paper3, border: `1.5px solid ${C.rule}`,
            alignItems: "center", fontFamily: "Inter", fontSize: 15, color: C.ink },
          "Mute microphone"
        ),
        circle(46, "transparent", `1.5px solid ${C.rule}`)
      ]);

    case "divider":
      return col({ gap: 16, width: 300 }, [
        bar(300, 9, C.rule),
        el({ width: 300, height: 1.5, backgroundColor: C.rule }),
        bar(210, 9, C.rule)
      ]);

    case "alert":
      return row(
        { width: 330, gap: 14, backgroundColor: C.paper2, borderRadius: 14,
          padding: 16, alignItems: "center",
          border: `1.5px solid ${C.rule}`, borderLeft: `4px solid ${C.accent}` },
        [circle(12, C.accent), col({ gap: 8 }, [bar(150, 9, C.ink2), bar(220, 9, C.rule)])]
      );

    case "progress":
      return col({ gap: 14, width: 300 }, [
        row({}, [bar(190, 12, C.accent), bar(110, 12, C.paper3)])
      ]);

    case "spinner":
      return row({ gap: 18, alignItems: "center" }, [
        el({
          width: 54, height: 54, borderRadius: 999,
          border: `5px solid ${C.paper3}`, borderTop: `5px solid ${C.accent}`
        }),
        text({ fontSize: 17 }, "Connecting…")
      ]);

    case "skeleton":
      return col({ gap: 12 }, [
        row({ gap: 14, alignItems: "center" }, [
          circle(46, C.paper3),
          col({ gap: 10 }, [bar(160, 12, C.paper3), bar(110, 12, C.paper3)])
        ]),
        bar(290, 12, C.paper3)
      ]);

    case "menu":
      return surface({ width: 260, gap: 4, padding: 10 }, [
        el({ height: 40, borderRadius: 10, backgroundColor: C.paper3, alignItems: "center", paddingLeft: 12 }, [bar(120, 9, C.ink2)]),
        el({ height: 40, borderRadius: 10, alignItems: "center", paddingLeft: 12 }, [bar(90, 9, C.rule)]),
        el({ height: 40, borderRadius: 10, alignItems: "center", paddingLeft: 12 }, [bar(140, 9, C.rule)])
      ]);

    case "tabs":
      return col({ gap: 14, width: 320 }, [
        row({ gap: 10, backgroundColor: C.paper2, borderRadius: 999, padding: 6 }, [
          el({ height: 38, paddingLeft: 18, paddingRight: 18, borderRadius: 999,
              backgroundColor: C.accent, color: C.accentInk, alignItems: "center",
              fontFamily: "Inter", fontSize: 15 }, "Voice"),
          el({ height: 38, paddingLeft: 18, paddingRight: 18, borderRadius: 999,
              color: C.ink2, alignItems: "center", fontFamily: "Inter", fontSize: 15 }, "Text")
        ]),
        bar(240, 9, C.rule)
      ]);

    case "accordion":
      return surface({ width: 300, gap: 12 }, [
        row({ justifyContent: "space-between", alignItems: "center" }, [
          bar(140, 10, C.ink2),
          text({ fontSize: 16, color: C.accent }, "⌄")
        ]),
        el({ height: 1.5, backgroundColor: C.rule }),
        col({ gap: 9 }, [bar(250, 9, C.rule), bar(190, 9, C.rule)])
      ]);

    case "panel":
      return surface({ width: 300, gap: 12 }, [
        bar(150, 10, C.ink2),
        bar(250, 9, C.rule),
        bar(200, 9, C.rule)
      ]);

    case "card":
      return surface({ width: 300, gap: 14, padding: 0 }, [
        el({ height: 72, backgroundColor: C.paper3, borderTopLeftRadius: 15, borderTopRightRadius: 15 }),
        col({ gap: 10, paddingLeft: 16, paddingRight: 16 }, [
          bar(140, 10, C.ink2),
          bar(230, 9, C.rule)
        ]),
        row({ paddingLeft: 16, paddingBottom: 16 }, [pill("Open", true)])
      ]);

    case "dialog":
      return surface({ width: 320, gap: 14 }, [
        bar(170, 11, C.ink2),
        bar(270, 9, C.rule),
        row({ gap: 10, justifyContent: "flex-end", marginTop: 4 }, [
          pill("Cancel", false), pill("Leave", true)
        ])
      ]);

    case "drawer":
      return row({ width: 330, height: 190, backgroundColor: C.paper2,
                   border: `1.5px solid ${C.rule}`, borderRadius: 16, padding: 0 }, [
        col({ width: 120, gap: 10, padding: 14, backgroundColor: C.paper3,
              borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }, [
          bar(80, 9, C.accent), bar(64, 9, C.rule), bar(72, 9, C.rule)
        ]),
        col({ gap: 10, padding: 14 }, [bar(150, 9, C.rule), bar(120, 9, C.rule)])
      ]);

    case "bubble":
      return col({ gap: 12, width: 330 }, [
        el({ maxWidth: 250, backgroundColor: C.paper3, border: `1.5px solid ${C.rule}`,
             borderRadius: 18, padding: 14, fontFamily: "Inter", fontSize: 16, color: C.ink },
           "Anyone up for a round?"),
        el({ maxWidth: 200, backgroundColor: C.accent, borderRadius: 18, padding: 14,
             marginLeft: 110, fontFamily: "Inter", fontSize: 16, color: C.accentInk },
           "Give me five")
      ]);

    case "composer":
      return row({ width: 340, gap: 12, backgroundColor: C.paper2, borderRadius: 18,
                   border: `1.5px solid ${C.rule}`, padding: 12, alignItems: "center" }, [
        el({ flex: 1, height: 40, alignItems: "center", paddingLeft: 8 }, [bar(150, 9, C.ink2)]),
        circle(44, C.accent)
      ]);

    case "conversation-item":
      return col({ gap: 8, width: 330 }, [
        row({ gap: 14, alignItems: "center", backgroundColor: C.paper2,
              borderRadius: 16, padding: 12 }, [
          circle(46, C.paper3, `1.5px solid ${C.rule}`),
          col({ gap: 9, flex: 1 }, [bar(120, 10, C.ink), bar(170, 9, C.rule)]),
          el({ height: 26, minWidth: 26, paddingLeft: 8, paddingRight: 8, borderRadius: 999,
               backgroundColor: C.accent, color: C.accentInk, alignItems: "center",
               justifyContent: "center", fontFamily: "Inter", fontSize: 14 }, "2")
        ]),
        row({ gap: 14, alignItems: "center", padding: 12 }, [
          circle(46, C.paper3, `1.5px solid ${C.rule}`),
          col({ gap: 9, flex: 1 }, [bar(100, 10, C.ink2), bar(140, 9, C.rule)])
        ])
      ]);

    /* Root: several at once, because breadth is the point. */
    case "cluster":
      return col({ gap: 18, alignItems: "flex-start" }, [
        row({ gap: 14, alignItems: "center" }, [pill("Join server", true), switchTrack(true)]),
        row({ gap: 14, alignItems: "center" }, [
          circle(46, C.paper3, `1.5px solid ${C.rule}`),
          el({ height: 38, paddingLeft: 16, paddingRight: 16, borderRadius: 999,
               border: `1.5px solid ${C.rule}`, color: C.ink, alignItems: "center",
               fontFamily: "Inter", fontSize: 15 }, "Online"),
          bar(90, 12, C.accent)
        ])
      ]);

    /* The provider boundary, with components sitting inside it. The caption
       already says "one package, one stylesheet, one provider" in prose, so
       listing those three again here would just print the same words twice. */
    case "install":
      return col(
        {
          width: 300,
          gap: 14,
          padding: 16,
          borderRadius: 16,
          backgroundColor: C.paper2,
          border: `1.5px solid ${C.rule}`
        },
        [
          text({ fontFamily: "Mono", fontSize: 15, color: C.accent }, "<GrytProvider>"),
          row({ gap: 12, alignItems: "center", paddingLeft: 14 }, [
            pill("Join", true),
            switchTrack(false)
          ]),
          text({ fontFamily: "Mono", fontSize: 15, color: C.accent }, "</GrytProvider>")
        ]
      );

    case "palette":
      return row({ gap: 12 }, [
        col({ gap: 8, alignItems: "center" }, [
          el({ width: 56, height: 56, borderRadius: 12, backgroundColor: C.paper, border: `1.5px solid ${C.rule}` })
        ]),
        col({ gap: 8, alignItems: "center" }, [
          el({ width: 56, height: 56, borderRadius: 12, backgroundColor: C.paper2, border: `1.5px solid ${C.rule}` })
        ]),
        col({ gap: 8, alignItems: "center" }, [
          el({ width: 56, height: 56, borderRadius: 12, backgroundColor: C.ink })
        ]),
        col({ gap: 8, alignItems: "center" }, [
          el({ width: 56, height: 56, borderRadius: 12, backgroundColor: C.accent })
        ])
      ]);
  }
}
