# @gryt/theme

Gryt's design tokens, colour scales and OKLCH maths. No renderer, no DOM.

MIT, like the rest of the UI packages, and unlike the AGPL-3.0 apps that use
them.

```sh
bun add @gryt/theme
```

## What is in here

- `grytTokens`, `grytLightTokens` — the named colours
- `grytScales`, `grytScalesLight`, `grytAlphaScales` — the twelve-step ramps
- `createGrytTheme` — build a theme from a dozen hex values
- `grytPresets` — the shipped themes
- `grytTheme`, `encodeGrytTheme`, `decodeGrytTheme` — a theme as a document, and
  the link it travels in
- `hexToOklch`, `oklchToHex`, `contrast` — the colour maths the ramps are
  built from

## Why it is its own package

`@gryt/ui-native` needs the tokens and nothing else. It used to get them from
`@gryt/ui/theme`, which meant depending on `@gryt/ui` — and `@gryt/ui` depends
on Base UI and Phosphor, both of which require `react-dom`. A React Native app
was therefore installing about 85 MB of web renderer to read some colours it
could have had for a few kilobytes (GRYT-374).

Splitting the layer out is only possible because it never touched a DOM in the
first place: `oklch.ts` imports nothing at all, the presets and the theme are
data, and the one React import is `import type { CSSProperties }`, which is
erased at compile time.

The tsconfig here drops the DOM lib on purpose, so reaching for `document` in a
colour helper is a compile error rather than a crash on somebody's phone.

## Who uses it

- `@gryt/ui` re-exports all of it from `@gryt/ui/theme`, so that import keeps
  working and web code does not have to change.
- `@gryt/ui-native` maps the ramps onto React Native styles.

One set of numbers, two renderers. That is the whole point — copying the layer
instead would let the two drift, which is the thing this arrangement exists to
prevent.
