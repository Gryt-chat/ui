/**
 * The theme layer on its own, with no components and no DOM. Everything here has to stay
 * framework-free: `@gryt/ui`'s entry pulls in Base UI and a stylesheet (GRYT-351).
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
// The ramp builders, not just the colour conversions. React Native cannot use custom
// properties, so exporting these is what stops the OKLab maths being copied (GRYT-342).
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
export {
  GRYT_THEME_COLLECTIONS,
  grytCollectionNotes,
  grytPresets,
  grytPresetsByCollection,
  grytPresetsById
} from "./presets";
export type { GrytThemeCollection, GrytThemePreset } from "./presets";
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
