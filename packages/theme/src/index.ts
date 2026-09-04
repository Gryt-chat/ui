/**
 * The theme layer on its own, with no components and no DOM. **Everything here
 * has to stay framework-free** — `@gryt/ui`'s main entry bundles 95 components,
 * imports Base UI and pulls `styles/index.css` in as a side effect, none of
 * which React Native can take.
 *
 * That is what makes the RN library a second renderer for one design system
 * rather than a second design system. Everything here is also exported from the
 * main entry, so nothing changes for the web (GRYT-351).
 */

export {
  createGrytTheme,
  grytAlphaScales,
  grytAlphaScalesLight,
  grytLightTokens,
  grytScales,
  grytScalesLight,
  grytTokens
} from "./createGrytTheme";
export type { GrytThemeOptions, GrytTokens } from "./createGrytTheme";
export { contrast, hexToOklch, oklchToHex } from "./oklch";
// The ramp builders, not just the colour conversions. @gryt/ui composes these
// into CSS custom properties in createGrytTheme; React Native cannot use custom
// properties, so @gryt/ui-native composes the same functions into plain values
// instead. Exporting them is what stops the OKLab maths being copied into the
// second renderer. See GRYT-342.
export {
  alphaScale,
  hexToRgb,
  hueScale,
  hueScaleLight,
  neutralScale,
  neutralScaleLight,
  rgbToHex
} from "./oklch";

export type { Oklch } from "./oklch";
export { grytPresets, grytPresetsById } from "./presets";
export type { GrytThemePreset } from "./presets";
export {
  GRYT_HUE_KEYS,
  GRYT_NEUTRAL_KEYS,
  GRYT_FONT_KEYS,
  GRYT_MOTION_CURVES,
  GRYT_MOTION_SCALE_MAX,
  GRYT_FONT_STACK_MAX,
  GRYT_RADIUS_KEYS,
  GRYT_THEME_NAME_MAX,
  cloneGrytTheme,
  decodeGrytTheme,
  encodeGrytTheme,
  grytFonts,
  grytMotion,
  isBezier,
  isValidBezier,
  grytTheme,
  grytThemeHues,
  grytThemeToOptions,
  isFontStack,
  isHexColor,
  normalizeHexColor,
  normalizeThemeName
} from "./theme";
export type {
  DecodedGrytTheme,
  GrytAppearance,
  GrytHueKey,
  GrytHues,
  GrytNeutralKey,
  GrytNeutrals,
  GrytBezier,
  GrytFontKey,
  GrytMotion,
  GrytMotionCurve,
  GrytNamedCurve,
  GrytFonts,
  GrytRadiusKey,
  GrytTheme
} from "./theme";

export {
  grytDrawerBleed,
  grytDurations,
  grytScaleSteps,
  sampleCurve,
  springSamples,
  springTightSamples
} from "./motion";
