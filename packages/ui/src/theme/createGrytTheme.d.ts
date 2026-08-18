import type { CSSProperties } from "react";
export declare const grytTokens: {
    readonly color: {
        readonly bg: "#111318";
        readonly surface: "#1a1d24";
        readonly surfaceRaised: "#1e2028";
        readonly surfaceHover: "#334155";
        readonly border: "#2b303d";
        readonly text: "#e0e0e6";
        readonly muted: "#888888";
        readonly accent: "#968ff8";
        readonly accentLight: "#b4afff";
        readonly secondary: "#7dd3fc";
        readonly secondaryLight: "#bae6fd";
        readonly success: "#4ade80";
        readonly danger: "#f87171";
        readonly dangerLight: "#fca5a5";
        readonly warning: "#fbbf24";
        readonly onAccent: "#0c0a20";
        readonly onSecondary: "#02121a";
        readonly onDanger: "#1f0405";
    };
    readonly radius: {
        readonly sm: 8;
        readonly md: 12;
        readonly lg: 20;
        readonly xl: 28;
        readonly full: 999;
    };
};
export type GrytTokens = typeof grytTokens;
export interface GrytThemeOptions {
    color?: Partial<Record<keyof GrytTokens["color"], string>>;
    radius?: Partial<Record<keyof GrytTokens["radius"], number>>;
    /**
     * Which set of ramps to build. Dark is the default because it is what the
     * library ships on :root; an app toggling appearance calls this twice and
     * puts each result behind its own selector.
     */
    appearance?: "dark" | "light";
}
/**
 * The scales, computed rather than written down.
 *
 * There is one generator, and this is it — theme.css is emitted from these same
 * functions by scripts/generate-theme.ts, and a test asserts the stylesheet
 * still matches. Two hand-maintained copies of a twelve-step ramp would drift
 * the first time somebody nudged a colour.
 */
/**
 * The light anchors.
 *
 * Picked for this palette rather than computed from the dark ones. The page is
 * a light grey and panels are white, which is the arrangement the client
 * already used and the one people expect of a light UI.
 */
export declare const grytLightTokens: {
    readonly bg: "#f1f2f7";
    readonly surface: "#ffffff";
    readonly surfaceRaised: "#f7f8fb";
    readonly border: "#dadde6";
    readonly muted: "#5b5d65";
    readonly text: "#1f2129";
};
export declare const grytScales: {
    readonly neutral: string[];
    readonly accent: string[];
    readonly secondary: string[];
    readonly success: string[];
    readonly danger: string[];
    readonly warning: string[];
};
/** The same six families, light. */
export declare const grytScalesLight: {
    readonly neutral: string[];
    readonly accent: string[];
    readonly secondary: string[];
    readonly success: string[];
    readonly danger: string[];
    readonly warning: string[];
};
/**
 * The light hover fill.
 *
 * Not one of the six anchors, because it is not a colour anybody picks: it is
 * step 4, the step that means "component background, hovered", and writing it
 * down as a literal would be a second definition of a value the ramp already
 * has. It exists at all because `.light` never set surface-hover, so a neutral
 * Button in a light app hovered to the dark slate the @theme block declares —
 * a slate block on a white panel.
 */
export declare const grytLightSurfaceHover: string;
export declare const grytAlphaScales: {
    readonly neutral: string[];
    readonly accent: string[];
};
export declare const grytAlphaScalesLight: {
    readonly neutral: string[];
    readonly accent: string[];
};
export declare function createGrytTheme(options?: GrytThemeOptions): CSSProperties;
//# sourceMappingURL=createGrytTheme.d.ts.map