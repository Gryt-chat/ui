---
"@gryt/ui": minor
---

`ThemeEditor`, the theme controls as a component.

They were a page on the docs site, which made the docs site the only place a
theme could be built. What somebody wants to know is whether a colour survives
a member list, a voice tile and a mention, and none of those are on a
documentation page — the client needs the same controls over the top of the
running app.

Controlled: `value`, `onChange`, `appearance`, `onAppearanceChange`. Two slots
for what differs between hosts — `actions` at the end of the header row, where
the docs site puts Copy link, and `footer` under the controls, where it puts
the export tabs.

Everything the page had is in it: presets, name, Generate, the appearance
toggle, the split-hue and automatic-label checkboxes, all seven neutrals per
half with their scale strips, all eleven hues, the five radius sliders, the
contrast report with its repair button, and import by pasting a link or JSON.

Three things stay with the host, because they are not the editor's:

- **The preview.** In the docs it is a panel of specimens; in the client it is
  the client.
- **The address bar.** The docs page writes the theme into the query string so
  what is in the bar is what you paste. A desktop app has no bar.
- **Export as code.** Rendering `createGrytTheme` needs a syntax highlighter,
  which is a docs dependency rather than a component library one.

`ThemeDraft`, `grytDraft`, `cloneDraft`, `themeStyle`, `encodeDraft`,
`importTheme`, `themeCode` and `themeJson` come out with it, so a host can hold
a theme and put one in a link.
