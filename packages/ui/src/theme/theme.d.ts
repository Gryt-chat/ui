import type { GrytThemeOptions } from "./createGrytTheme";
export type GrytAppearance = "dark" | "light";
export declare const GRYT_HUE_KEYS: readonly ["accent", "accentLight", "secondary", "secondaryLight", "success", "danger", "dangerLight", "warning", "onAccent", "onSecondary", "onDanger"];
export declare const GRYT_NEUTRAL_KEYS: readonly ["bg", "surface", "surfaceRaised", "surfaceHover", "border", "muted", "text"];
export declare const GRYT_RADIUS_KEYS: readonly ["sm", "md", "lg", "xl", "full"];
export type GrytHueKey = (typeof GRYT_HUE_KEYS)[number];
export type GrytNeutralKey = (typeof GRYT_NEUTRAL_KEYS)[number];
export type GrytRadiusKey = (typeof GRYT_RADIUS_KEYS)[number];
export type GrytHues = Record<GrytHueKey, string>;
export type GrytNeutrals = Record<GrytNeutralKey, string>;
export interface GrytTheme {
    /**
     * What its author called it, if they called it anything.
     *
     * Metadata rather than a colour: nothing about how a theme looks depends on
     * it, and grytThemeToOptions drops it. It exists because a link full of hex
     * values says nothing about what it is, and the person who made it already
     * knew — so the receiving end should not have to ask.
     */
    name?: string;
    hue: GrytHues;
    /** Null when light borrows the hues above, which is the usual case. */
    lightHue: GrytHues | null;
    dark: GrytNeutrals;
    light: GrytNeutrals;
    radius: Record<GrytRadiusKey, number>;
}
/** Long enough for a name, short enough not to be a payload. */
export declare const GRYT_THEME_NAME_MAX = 60;
export declare function normalizeThemeName(value: string): string;
/** What the library ships, as a document. */
export declare const grytTheme: GrytTheme;
export declare function cloneGrytTheme(theme: GrytTheme): GrytTheme;
/** Which hues this appearance reads. */
export declare function grytThemeHues(theme: GrytTheme, appearance: GrytAppearance): GrytHues;
/**
 * One appearance of a theme, in the shape createGrytTheme takes.
 *
 * The name does not come along: createGrytTheme returns CSS variables, and a
 * name is not one.
 */
export declare function grytThemeToOptions(theme: GrytTheme, appearance: GrytAppearance): GrytThemeOptions;
export declare function isHexColor(value: string): boolean;
/** #abc to #aabbcc, lower case, so two of the same colour compare equal. */
export declare function normalizeHexColor(value: string): string;
/**
 * The theme as query parameters, carrying only what differs from Gryt's own.
 *
 * `appearance` is which half the sender was looking at, and it rides along
 * because a shared link that opens on the other one is showing something the
 * sender never saw.
 */
export declare function encodeGrytTheme(theme: GrytTheme, appearance?: GrytAppearance): URLSearchParams;
export interface DecodedGrytTheme {
    theme: GrytTheme;
    /** Which half the link was sent from. Dark unless it says otherwise. */
    appearance: GrytAppearance;
}
/**
 * Whatever somebody pasted.
 *
 * A whole URL, a bare query string, or the JSON form — one function, because
 * from the outside they are the same act. Null when there is no theme in it at
 * all; a value it cannot parse is left at Gryt's, so one mistyped colour does
 * not throw the rest away.
 */
export declare function decodeGrytTheme(input: string): DecodedGrytTheme | null;
//# sourceMappingURL=theme.d.ts.map