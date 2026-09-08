import type { NativeTheme, Ramp } from "./createNativeTheme";

/**
 * Roles to ramps. On the web that mapping is repeated in Tailwind classes one component at
 * a time; written once here, because four copies is how one stops meaning it.
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
