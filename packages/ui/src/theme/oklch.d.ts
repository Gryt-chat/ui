/**
 * sRGB and OKLCH, and the scale generator that runs on both sides of the build.
 *
 * This exists at runtime rather than only in a script because overriding a
 * colour has to regenerate that colour's whole scale. A theme that set
 * --gryt-accent and left --gryt-accent-9 alone would change almost nothing:
 * the components read the scale.
 *
 * No dependency. The conversions are the published OKLab matrices, and the
 * whole file is about eighty lines of arithmetic — a colour library would be
 * more weight than the maths it replaces.
 */
export interface Oklch {
    l: number;
    c: number;
    h: number;
}
export declare function hexToRgb(hex: string): [number, number, number];
export declare function rgbToHex([r, g, b]: [number, number, number]): string;
export declare function hexToOklch(hex: string): Oklch;
export declare function oklchToHex({ l, c, h }: Oklch): string;
/**
 * Twelve steps for a hue, from its solid step and the lighter one beside it.
 *
 * Steps 1 to 8 are the hue sunk into the dark end of the ramp — backgrounds,
 * then borders. 9 and 10 are the anchors themselves. 11 and 12 are text, and
 * they are placed relative to 10 rather than at a fixed lightness: the -light
 * tokens differ family to family, so a fixed value puts the text step above the
 * fill in one scale and below it in another.
 */
export declare function hueScale(solid: string, solidHover: string): string[];
/**
 * Twelve neutral steps, from the six an app names directly.
 *
 * Those six are kept exactly — a theme that says its background is #0b0b0f
 * means it, and interpolating through it would move it by a shade.
 */
export declare function neutralScale(anchors: {
    bg: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    muted: string;
    text: string;
}): string[];
/**
 * The same steps as translucent overlays.
 *
 * Solved rather than guessed: the smallest alpha whose overlay colour is still
 * inside the gamut, which is what makes a tinted hover composite to the same
 * value over an avatar as it does over the app background.
 */
export declare function alphaScale(scale: string[], background: string): string[];
/** Twelve light neutral steps. Anchors are kept exactly, as in the dark set. */
export declare function neutralScaleLight(anchors: {
    bg: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    muted: string;
    text: string;
}): string[];
/**
 * Twelve light steps for a hue.
 *
 * Step 9 stays the brand colour, so a filled button is the same colour in both
 * appearances and Gryt looks like Gryt either way. 10 goes *darker* for hover,
 * which is the light-mode direction — the dark set goes lighter. 11 and 12 are
 * text, dark enough to read on white.
 */
export declare function hueScaleLight(solid: string): string[];
/** WCAG contrast ratio. 4.5 is AA for body text, 3 for large text and UI. */
export declare function contrast(a: string, b: string): number;
//# sourceMappingURL=oklch.d.ts.map