---
"@gryt/ui": minor
---

Ship the design tokens as `@gryt/ui/theme.css`, importable into a consuming app's Tailwind entry.

`dist/styles.css` cannot serve this purpose. It is compiled output, so by the time it reaches a consumer the `@theme` block has already been resolved into `:root` variables — useful at runtime, useless as theme configuration. An app that wants to write `bg-gryt-accent` in its own components had to restate the whole palette, and two copies of a palette drift.

`theme.css` is copied verbatim into `dist` rather than built, so the `@theme` block arrives intact:

```css
@import "tailwindcss";
@import "@gryt/ui/theme.css";
```

It carries the `--color-gryt-*` tokens and the raw `--gryt-*` names together — radius, spring durations, backdrop blur, drawer bleed — because the components reference those directly in arbitrary values (`rounded-(--gryt-radius-lg)`, `duration-(--gryt-dur-spring)`) and an app writing the same needs them too. One file, the whole token surface.

`styles.css` still carries every component style and utility it did. What it no longer carries is Tailwind's preflight. A component library has no business carrying a CSS reset — that is the consuming app's decision, made once for its whole document, and shipping one means any app importing us silently gets its own reset overwritten. The Gryt client is mid-migration and still resting on Radix Themes' reset, where this would not be a matter of taste but a broken layout. Apps that want preflight import it from their own entry, which is what the docs site does.
