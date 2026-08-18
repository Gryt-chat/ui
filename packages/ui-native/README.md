# @gryt/ui-native

Gryt's design system on React Native. The same tokens as `@gryt/ui`, a different
renderer.

## Status

**Private, and not published.** Nine components exist: Surface, Divider, Chip,
Avatar, Spinner, Button, TextField, Badge, Progress and Skeleton. Enough to
assemble a simple form, not enough for a screen with a menu in it. Flip
`private` off once there is a reason to install it.

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
| *(all)* | No hover state | A phone has no pointer. The web's `scale-[1.03]` on hover has no equivalent and is deliberately not emulated on press, which would fire on every tap and make the whole UI feel loose. |
| `Button` | Press scale is kept, hover scale is dropped | The web scales to `0.96` on press and `1.03` on hover. Press maps directly onto `onPressIn`/`onPressOut`, so it is here, spring-animated and skipped when reduce-motion is on. |
| `Button` | `hasPopup` is a prop, not inferred | The web reads `aria-haspopup`, which Base UI sets on a trigger, and skips the scale so the trigger does not drag its own popup sideways while it is being measured. React Native has no such attribute, so a menu trigger has to say so. |
| `TextField` | Focus changes the border colour instead of drawing an outline | The web's `outline` sits outside the box and shifts nothing. React Native has no outline, and a second ring would move the layout on focus. |
| `Progress` | Indeterminate renders as an empty track | The web sweeps a partial bar with a CSS keyframe. Doing it here needs an `Animated` loop plus a reduce-motion check, which deserves its own pass rather than a footnote. |
| `Skeleton` | Does not pulse | A loop running for the length of a request costs battery, and it is the sort of motion reduce-motion users switch off first. A flat block still reads as loading. |

## Not Node-importable

The build is unbundled `tsc` output with extensionless relative imports, which
is what Metro wants: it resolves `.native.ts` and `.web.ts` per file, and a
bundle would have no files left to pick between. That also means plain Node
cannot import `dist/index.js` — it would fail on `react-native` regardless, so
nothing is lost, but do not add a Node-side consumer expecting it to work.

The theme layer is testable without a native runtime, which is what
`createNativeTheme.test.ts` covers.
