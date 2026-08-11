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

Nothing changes for existing consumers: `styles.css` still contains everything it did.
