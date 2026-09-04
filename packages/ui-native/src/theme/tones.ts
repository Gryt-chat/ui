import type { NativeTheme, Ramp } from "./createNativeTheme";

/**
 * Roles to ramps. `@gryt/ui` names tones by role and the ramps are named by
 * hue; on the web that mapping is repeated in Tailwind classes one component at
 * a time. Written once here, because four copies of "primary means accent" is
 * how one of them stops meaning it.
 */
export type ComponentTone =
  | "primary"
  | "secondary"
  | "neutral"
  | "danger"
  | "success"
  | "warning";

const TONE_TO_RAMP: Record<ComponentTone, keyof NativeTheme["scales"]> = {
  primary: "accent",
  secondary: "secondary",
  neutral: "neutral",
  danger: "danger",
  success: "success",
  warning: "warning",
};

export function toneRamp(theme: NativeTheme, tone: ComponentTone): Ramp {
  return theme.scales[TONE_TO_RAMP[tone]];
}
