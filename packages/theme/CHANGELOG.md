# @gryt/theme

## 0.9.0

### Minor Changes

- cef19b9: A theme carries how Gryt moves.

  `GrytTheme.motion` is a speed and a curve. Optional and null means the
  library's own, so every theme written before this renders and moves exactly as
  it did.

  **Speed is one multiplier over every tier**, not a slider each. The tiers are
  already in proportion — a drawer takes longer than a button because it travels
  further — and five sliders would be re-deciding that with no way to tell it had
  gone wrong except by opening a drawer. `0` means nothing animates, which is a
  real setting rather than a degenerate one.

  **Curve** is `spring`, `smooth`, `linear`, or a cubic bezier you drag on a
  graph. The named ones keep the library's two curves apart: the overshooting
  spring for things that grow in place, the critically damped one for things
  that travel inside their bounds. A bezier cannot be both, so drawing one
  collapses them — the panel says so, because a curve that overshoots is fine on
  a button and throws a drawer outside its own container.

  The graph draws whichever curve is actually in effect. A spring is not a cubic
  bezier, so a named curve renders as its samples with no handles rather than as
  a prominent line that is not the curve you have.

  `prefers-reduced-motion` beats the theme, and needs `!important` to do it: a
  theme's durations arrive as inline style on the root element, and an inline
  declaration beats a media query. Without that, opening a link somebody sent
  would start a machine moving for a person who had turned movement off.

  Also corrects a comment in `theme.css` that said changing a duration moves
  where the overshoot lands. It does not — `linear()` samples are positions
  against normalised time — and `motion.ts` said the opposite two files away.
  Measured in Chrome: the same `--ease-spring` at 200ms and 2000ms puts the
  element at the same six positions at the same six fractions, identical to two
  decimals, peaking at the same 10.6% past target. That false warning is why a
  theme could not offer a speed control before: it said the safe thing was
  dangerous.

- fb817a9: A theme carries its typefaces.

  Three roles — `body`, `display` for headings, `mono` for code, hex values and
  timestamps. Three because that is what the interface actually distinguishes;
  finer is a knob nobody turns, and coarser loses the one that matters, which is
  that a proportional face cannot do the third job.

  `GrytTheme.fonts` is optional and null means the library's own, so every theme
  written before this and every link already shared renders exactly as it did.
  `createGrytTheme` emits `--gryt-font-body|display|mono` only for what a theme
  sets, and the stylesheet's `--font-sans`, the new `--font-display` and
  `--font-mono` fall through them. A theme that names no fonts emits no
  variables and changes nothing.

  Whole CSS stacks rather than family names, because the fallback is the point:
  a theme names a face the reader may not have, and what it falls back to
  decides whether that reads as a different choice or a broken one.

  `isFontStack` refuses anything that could close a CSS declaration and start
  another — braces, semicolons, comment markers, `url(`, `@import`. A font stack
  has no legitimate use for any of them, and this is the first field in a theme
  that is free text rather than a hex value. A role that fails the check falls
  back to the library's instead of taking the value, so one bad parameter in a
  link costs that parameter rather than the theme.

  `ThemeEditor` grows a Type group: a curated list of thirteen faces, a
  free-text box for everything else, and a specimen line set in whichever face
  is chosen. Faces that need fetching are marked, and `remoteFontsAllowed`
  lets a host say they will not be — the client keeps that behind a setting, so
  the picker can say a choice will not take effect rather than leaving somebody
  to wonder why nothing changed.

  The list is curated rather than Google's catalogue on purpose. The catalogue
  is about sixteen hundred families and fetching it is itself a request to
  Google, which would leave the picker empty for exactly the people who left
  that setting off.

## 0.8.0

### Minor Changes

- c8f4978: Winter Arc, a cold monochrome preset.

  Black, white and grey, from four photographs: snow-loaded spruces through a gym
  window, a dark room lit by white strips, a white can on black rubber, grey
  sweatpants.

  Paper is already near-monochrome, so this earns its place by being cold rather
  than neutral. Paper's greys are hueless; every grey here carries the blue that
  overcast snow light has, and side by side that is the whole theme.

  The accent is the white can on the black floor — near-white, so a filled button
  is the brightest thing on the screen. That makes it the only Gryt preset with a
  split `lightHue`: an accent that pale is the point in the dark half and
  invisible in the light one, so light gets the colour of a wet window frame and
  keeps the same job.

  CRISP corners rather than SOFT. Window mullions, plate edges, floor tiles.

  Every pair is AA or better, measured rather than eyeballed — the tightest is
  light muted on background at 5.38, and the accent pairs sit at 15.4 dark and
  10.5 light. It round-trips through `encodeGrytTheme`/`decodeGrytTheme` as a
  664-character link.

## 0.7.0

### Minor Changes

- f9b3c21: Six new themes, derived from the owl palettes: Rose, Amber, Wine, Indigo,
  Forest and Ice.

  They were drawn as artwork rather than as themes, so these are derived rather
  than lifted — a drawing names four or five colours and a theme needs eleven
  hues and seven neutrals in each of two appearances.

  Derived in OKLCH, and the reason shows in the result: a ramp built by darkening
  sRGB drifts grey, so the surfaces stop belonging to the theme about three steps
  down. Holding hue and chroma while moving lightness keeps Rose's greys pink and
  Forest's greys green.

  Secondaries are analogous rather than complementary, matching Ember. A true
  complement put Indigo's secondary on orange and Ice's on tan — colours that read
  as borrowed from another theme.

  `onAccent` is chosen per theme rather than assumed: whichever ink has more
  contrast on that accent ships. Forest's sage takes dark ink at 8.1:1, Indigo's
  periwinkle takes light at 4.7:1.

  Checked in both appearances — text 14.8:1 or better on its own background,
  muted 5.7:1 or better on its surface.

## 0.6.0

### Minor Changes

- 2f7a532: A "Gryt Rounded" preset — the shipped palette with every corner at eight pixels.

  Credits to Carlo, who built it in the generator on ui.gryt.chat and sent the
  link. The colours are Gryt's own, unchanged; the whole theme is the radius. Four
  of the five steps come down a little, and `full` comes down a lot — 999 to 8 —
  so the controls drawn as pills (buttons, the search field, badges) become
  rectangles with the same corner as the panels around them.

  It joins the built-in list, which means the client's theme library offers it
  too: that list is read from here rather than copied, so a newer `@gryt/ui` is
  all the client needs to pick it up.

## 0.5.0

### Minor Changes

- 2909e19: A Drawer slides and nothing about it fades, and a Sheet takes longer to arrive.

  **The Drawer's scrim no longer fades in and out.** The panel already only
  translated — that is the whole distinction between a drawer and a dialog — but
  the scrim was still fading up alongside it, which put a second, slower animation
  on top of the one that matters. It is up when the drawer is up.

  The drag term stays, and it is a different thing: pushing the panel off lightens
  the scrim in proportion, so a half-gone drawer does not sit under a
  full-strength one. That is the web's own rule in its own words.

  This is not a return to the bug GRYT-395 fixed. There the scrim was a flat
  colour that vanished with the Modal _before_ the panel had moved, so a drawer
  animating out sat under a full-strength scrim for 700ms and then blinked off.
  The Modal now unmounts once the panel has finished travelling, so the scrim is
  up for exactly as long as the panel is on screen — which is the fix, rather than
  fading it.

  **`grytDurations.springSlow` — 900ms — and `Sheet` uses it.** A drawer crosses
  its own width; a sheet at 82% comes up from off the bottom edge and covers
  nearly all of the screen. The same duration over a longer distance is a faster
  animation, and at `springSoft` the sheet arrived quickly enough to read as a
  snap rather than a slide.

  `--gryt-dur-spring-slow` is declared alongside it, and the motion token test
  derives its names rather than listing them, so it covered the new one without
  being told.

## 0.4.0

### Minor Changes

- c1d7384: An indeterminate Progress actually shows something.

  Both platforms rendered an empty track. The web passed `value={null}` to Base UI,
  which marks the indicator indeterminate and leaves its width unset, and nothing
  styled that — no keyframes anywhere in the package and no rule for
  `data-indeterminate`. React Native had written the same gap down as a parity
  exception, which made a shared hole look like a one-sided one.

  Now a bar 40% of the track sweeps across it on a loop, from the same
  description on both: fully off the left edge to fully off the right, so the loop
  seam is invisible. `grytDurations.sweep` and `--gryt-dur-sweep` are the one
  duration, kept equal by the test that already covers the others.

  Reduce-motion gets a full-width dimmed bar rather than a frozen partial one,
  which would read as a job that stalled 40% in.

## 0.3.0

### Minor Changes

- 50a13f5: The drawer overhang is a shared token, and React Native uses it.

  `--gryt-drawer-bleed: 4rem` has been in `theme.css` since the web Drawer was
  written, with the reasoning next to it: the spring overshoots and settles from
  both directions, so a panel sized exactly to its resting place shows a seam of
  backdrop down its edge on the undershoot. The panel is built that much larger
  and hangs the difference off-screen.

  React Native had none of it — there is no CSS variable to read there — so its
  Drawer flashed its own edge every time it opened. `grytDrawerBleed` is that
  distance in points, and `bleedTokens.test.ts` keeps it equal to what the
  stylesheet says.

  `Sheet` uses the same overhang below its bottom edge, for the same reason, now
  that it animates on the overshooting curve.

- fe584b0: Native controls take a label, press like the web does, and are big enough to hit.

  `Checkbox`, `Radio` and `Switch` accept a `label`, and tapping it works the
  control — what a `<label>` does on the web, which React Native has no equivalent
  of. All three gain the web's press scale at the web's own value, plus 12pt of
  hit slop, which takes a 20pt box to the 44pt Apple and WCAG both ask for without
  moving a drawn pixel.

  `grytScaleSteps` grows the five components it was missing, and a test in
  `@gryt/ui` reads the components' own Tailwind classes and asserts they still
  agree. The values are not interchangeable — a checkbox presses to 0.92 and a
  button to 0.96 — so two hand-copied lists was the wrong number of lists.

  Styling parity fixes found while doing it: an unchecked `Checkbox` was
  transparent where the web is a filled surface with an outline, `Radio`'s border
  was 1.5 against the web's 1, and `Switch`'s track had no border at all. The
  checkbox tick and the radio dot now scale from 0 on the spring rather than
  appearing — scaling from 0 is what makes the overshoot visible, which is the
  reasoning already written down in the web components.

## 0.2.0

### Minor Changes

- 64cbe56: Share the motion system, and put React Native on the same curve as the web.

  `@gryt/theme` gains the spring curves, durations and press scales that previously existed only as `linear()` sample lists inside `theme.css`. They are arithmetic with no renderer attached, so a second platform can use them instead of hand-copying 54 floats.

  `@gryt/ui-native` gains `easeSpring`, `easeSpringTight`, `springy()`, `travel()`, `fade()` and `usePressScale()`, built by interpolating those same samples. **Not** `withSpring`: the web curve is a spring solved analytically and sampled precisely because a physics engine approximating one was not wanted, and Reanimated's `withSpring` is a physics engine. `withTiming` over the shared samples is identical rather than close.

  `Button` is converted, replacing hand-tuned `speed: 40, bounciness: 6` with the real curve. A test asserts the tokens still equal what `theme.css` emits, so the two cannot drift.

  `react-native-reanimated` is now a peer dependency of `@gryt/ui-native`.
