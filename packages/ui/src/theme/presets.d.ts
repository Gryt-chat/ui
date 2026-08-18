import type { GrytTheme } from "./theme";
export interface GrytThemePreset {
    id: string;
    name: string;
    /** One line under the name: what makes this one different. */
    note: string;
    group: "Gryt" | "Ported";
    /** Where the values came from. Shown as the attribution line. */
    source?: string;
    theme: GrytTheme;
}
export declare const grytPresets: GrytThemePreset[];
export declare const grytPresetsById: Map<string, GrytThemePreset>;
//# sourceMappingURL=presets.d.ts.map