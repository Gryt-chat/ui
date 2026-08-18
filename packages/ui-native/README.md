# @gryt/ui-native

Gryt's design system on React Native. The same tokens as `@gryt/ui`, a different
renderer.

## Status

**Private, and not published.** Five components exist — Surface, Divider, Chip,
Avatar, Spinner — which is enough to prove the token pipeline and not enough to
build a screen with. Flip `private` off once there is a reason to install it.

Tracked in GRYT-342. The goal is 1:1 with `@gryt/ui`: every component, matching
behaviour, no mobile-only limits.

## The tokens are imported, not copied

```ts
import { createNativeTheme } from "@gryt/ui-native";
```

`createNativeTheme` builds its ramps by calling `neutralScale`, `hueScale` and
`alphaScale` from `@gryt/ui/theme`. There is one implementation of the OKLab
maths and both renderers use it, so a curve tuned on the web moves here too.

What it does **not** use is `createGrytTheme`, which returns `CSSProperties` — a
map of `--gryt-accent-9` custom properties. React Native has no custom
properties and no cascade, so components take a theme from context instead:

```tsx
<GrytThemeProvider followSystemAppearance>
  <Surface level="raised" bordered padding={4}>
    <Chip label="Live" tone="success" />
  </Surface>
</GrytThemeProvider>
```

Rendered outside a provider, components get the dark theme rather than nothing,
which matches `@gryt/ui` shipping its dark tokens on `:root`.

## Parity exceptions

Kept from the first component rather than the first argument. Full 1:1 is the
goal, so the honest list is worth more than a claim of parity that isn't one.

| Component | What differs | Why |
|---|---|---|
| `Spinner` | Uses the platform `ActivityIndicator` instead of the web's stroked, CSS-animated circle | It is what the OS draws for "working", it honours reduce-motion for free, and iOS and Android differ from each other deliberately. Reproducing the web drawing would look wrong on both. |
| *(all)* | No hover state | A phone has no pointer. The web's `scale-[1.03]` on hover has no equivalent and is not being emulated on press — press states are their own decision, coming with Button. |

## Not Node-importable

The build is unbundled `tsc` output with extensionless relative imports, which
is what Metro wants: it resolves `.native.ts` and `.web.ts` per file, and a
bundle would have no files left to pick between. That also means plain Node
cannot import `dist/index.js` — it would fail on `react-native` regardless, so
nothing is lost, but do not add a Node-side consumer expecting it to work.

The theme layer is testable without a native runtime, which is what
`createNativeTheme.test.ts` covers.
