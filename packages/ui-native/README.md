# @gryt/ui-native

Gryt's design system on React Native. The same tokens as `@gryt/ui`, a different
renderer.

## Install

```sh
npm install @gryt/ui-native
```

```sh
bun add @gryt/ui-native
pnpm add @gryt/ui-native
yarn add @gryt/ui-native
```

Your app provides `react` and `react-native`. `@gryt/ui` comes with it, for the
colour maths described below, and nothing from its main entry is loaded.

## Status

Thirty-three components across the overlays, the form controls, and the layout
and feedback set.

Ten are still missing, against 42 in `@gryt/ui`: Autocomplete, Combobox,
Composer, ContextMenu, ConversationItem, Form, IconButton, MessageBubble,
NavigationMenu and PreviewCard. Most of them are Gryt-specific and want a screen
to design against rather than a web component to copy.

Tracked in GRYT-342. The goal is 1:1 with `@gryt/ui`: every component, matching
behaviour, no mobile-only limits. The exceptions below are the honest distance
from that.

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

## Avatars are generated, not fetched

`Avatar` takes a `seed` and draws that person's owl from `@gryt/owl` — the same
generator and the same seed the web uses, so somebody looks the same in both
apps.

```tsx
import { Avatar } from "@gryt/ui-native";
import { avatarSeed } from "@gryt/owl";

<Avatar seed={avatarSeed(member.nickname)} name={member.nickname} size="md" />;
```

`react-native-svg` is a peer dependency for it. React Native's `Image` cannot
decode SVG from a data URI, so the markup goes to `SvgXml` instead — the web
hands the same string to an `<img>`, and that is the one place the two renderers
genuinely differ. Without a seed the component is what it was: the `source`
image if there is one, initials if there is not.

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
| `Tooltip` | Opens on long press, closes on release, instead of appearing on hover after a delay | A phone has no hover. This is the same name on a different interaction, and it is the component where 1:1 is least achievable. An interface that needs tooltips to be usable will not survive the port. |
| *(positioned overlays)* | The popup does not follow a trigger that moves | Floating UI keeps watching the reference element. React Native measures on demand and reports nothing afterwards, so the position is taken once, when the popup opens. If a list scrolls underneath an open menu, the menu stays put. |
| `Popover` | `Arrow` renders nothing | Base UI positions an arrow against the popup's edge once Floating UI has settled. Here it means a rotated square, a border on two sides only, and knowing which side the popup landed on. Doable, not free, and not done. |
| `Menu` | `Positioner` is a passthrough | Base UI splits the positioned box from the styled box. There is no stacking context to escape here, so one view does both. |
| `Dialog` | `Portal` is a passthrough and `Backdrop` renders nothing | React Native's `Modal` already renders above everything and draws its own layer, so there is nothing for a portal to escape and nowhere for a separate backdrop to go. Both are kept so call sites match. |
| `Dialog` | Android's back button stands in for Escape | It is the only hardware dismiss a phone has. `AlertDialog` disables it along with the scrim, matching Base UI suppressing outside-press and Escape. |
| `Switch` | Drawn from tokens, not React Native's `Switch` | The platform control is green on iOS and Material on Android, and `thumbColor`/`trackColor` do not reach the whole shape. A design system that cannot colour its own switch is not one. |
| `Select` | A list, not the platform picker | iOS gives a wheel and Android a dialog. Neither takes the Gryt palette and they look nothing like each other. |
| `Checkbox` | The tick is a text glyph, not a Phosphor icon | An icon set would be this package's first icon dependency, for one glyph. `react-native-svg` is a peer now, for the owl avatars, so mounting SVG is no longer the obstacle — but `@phosphor-icons/react` is still a web package, and picking a set is a decision for whoever needs icons rather than for a checkbox. |
| `Tabs` | Each tab draws its own underline; `Indicator` renders nothing | Base UI slides one indicator between tabs, measured against the active one. Sliding it here means measuring every tab and animating between them, which is real work for a decoration. The underline appears rather than slides. |
| `Tabs` | The panel has no `tabpanel` role | React Native has `tab` and `tablist` and no `tabpanel`. The panel is reachable, it just does not announce itself as belonging to the tab. |
| `Collapsible` | Unmounts when closed instead of animating height | The web animates height, which needs the content measured first. Doable with `onLayout` and `Animated`, at the cost of a frame at the wrong size. |
| `Alert` | Severity is colour plus a live region, with no icon | Colour alone does not tell anyone this is an error, which is why the web pairs it with an icon. `assertive` for error and warning, `polite` otherwise, reaches a screen reader, which an icon does not. A visible icon still wants an icon set. |
| `NumberField` | No scrub gesture on the label | The web lets you press the label and drag sideways to change the value. On a phone that competes with scrolling, and the same interaction already exists as `Slider`. |
| `ScrollArea` | Nearly a passthrough over `ScrollView` | The web version exists to replace scrollbars browsers draw badly. A phone's indicator is drawn by the OS, fades on its own, and already matches every other app. |
| `Toolbar` | No roving focus | The web's manages arrow-key movement between controls and one tab stop for the group. There is no focus to rove. The role is kept, since that is what tells a screen reader the controls belong together. |
| `Accordion` | Two glyphs instead of a rotating chevron | Same reasoning as the checkbox tick: rotating one needs a transform and a measurement, and there is no icon set here yet. |
| `Skeleton` | Does not pulse | A loop running for the length of a request costs battery, and it is the sort of motion reduce-motion users switch off first. A flat block still reads as loading. |

## Additions

The other direction, and a shorter list. Something here that the web does not
have needs the same justification as something missing.

| Component | Why there is no web counterpart |
|---|---|
| `Sheet` | A sheet is what a phone does where the web opens a dialog or slides a drawer, and the two are not the same interaction: it is dragged, it settles at heights the user chooses, and dismissing it is a flick rather than a click on an X. Shipping the web's Dialog on a phone would be 1:1 and wrong; inventing a sheet on the web would be worse. |

## Not Node-importable

The build is unbundled `tsc` output, which is what Metro wants: it resolves
`.native.ts` and `.web.ts` per file, and a bundle would have no files left to
pick between. A post-build step appends the `.js` extensions Node's resolver
needs, so the module graph resolves rather than only working under a bundler.

Importing `dist/index.js` from plain Node still fails, on `react-native`, which
Node cannot load either. Nothing is lost by that, but do not add a Node-side
consumer expecting it to work.

The theme layer is testable without a native runtime, which is what
`createNativeTheme.test.ts` covers.
