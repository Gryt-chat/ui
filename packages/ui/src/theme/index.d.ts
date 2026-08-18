/**
 * The theme layer on its own, with no components and no DOM.
 *
 * `@gryt/ui`'s main entry bundles all 95 components, imports Base UI, and pulls
 * `styles/index.css` in as a side effect on its first line. React Native can
 * take none of that, and it does not need to: everything here is framework-free
 * — `oklch.ts` has no imports at all, `presets.ts` and `theme.ts` are data, and
 * `createGrytTheme.ts`'s only React import is `import type { CSSProperties }`,
 * which is erased at compile time.
 *
 * That is what makes an RN component library a second renderer for the same
 * design system rather than a second design system. It only holds if the tokens
 * can be imported without the components, which is what this entry is for.
 *
 * Everything exported here is also exported from the main entry, so nothing
 * changes for the web client. See GRYT-351.
 */
export { createGrytTheme, grytAlphaScales, grytAlphaScalesLight, grytLightTokens, grytScales, grytScalesLight, grytTokens } from "./createGrytTheme";
export type { GrytThemeOptions, GrytTokens } from "./createGrytTheme";
export { contrast, hexToOklch, oklchToHex } from "./oklch";
export { alphaScale, hexToRgb, hueScale, hueScaleLight, neutralScale, neutralScaleLight, rgbToHex } from "./oklch";
export type { Oklch } from "./oklch";
export { grytPresets, grytPresetsById } from "./presets";
export type { GrytThemePreset } from "./presets";
export { GRYT_HUE_KEYS, GRYT_NEUTRAL_KEYS, GRYT_RADIUS_KEYS, GRYT_THEME_NAME_MAX, cloneGrytTheme, decodeGrytTheme, encodeGrytTheme, grytTheme, grytThemeHues, grytThemeToOptions, isHexColor, normalizeHexColor, normalizeThemeName } from "./theme";
export type { DecodedGrytTheme, GrytAppearance, GrytHueKey, GrytHues, GrytNeutralKey, GrytNeutrals, GrytRadiusKey, GrytTheme } from "./theme";
//# sourceMappingURL=index.d.ts.map