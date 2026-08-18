import type { NativeTheme, Ramp } from "./createNativeTheme";

/**
 * Roles to ramps.
 *
 * `@gryt/ui` names its component tones by role — primary, secondary, neutral,
 * danger — while the ramps are named by hue. On the web the mapping is buried in
 * Tailwind classes, one component at a time: Button says
 * `primary: "bg-gryt-accent"`, Checkbox says the same thing again.
 *
 * Written once here, because four copies of "primary means accent" is how one of
 * them eventually stops meaning it.
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
