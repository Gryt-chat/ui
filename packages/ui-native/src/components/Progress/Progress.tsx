import { View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface ProgressProps {
  /** 0 to 100. Leave undefined for an indeterminate bar. */
  value?: number;
  tone?: "accent" | "success" | "danger" | "warning";
  style?: StyleProp<ViewStyle>;
}

/**
 * Determinate only — and so is the web, which is not what this used to say.
 *
 * The previous note here claimed the web's indeterminate state was a CSS
 * keyframe sweeping a bar across the track, and listed this as a parity
 * exception. It is not one. `@gryt/ui`'s Progress passes `value={null}` to
 * Base UI and styles nothing for it: there is no `@keyframes` anywhere in the
 * package, no rule for `data-indeterminate`, and the compiled stylesheet has
 * zero rules matching `gryt-progress`. An indeterminate Progress renders an
 * empty track on the web too.
 *
 * So both platforms agree, and both are missing the feature. Implementing it
 * belongs on both at once — GRYT-382 — rather than here, where it would make
 * React Native the one that behaves differently.
 *
 * The travel that *is* implemented follows the web deliberately: 300ms on
 * ease-out rather than the spring. A progress bar is a reading, and the
 * spring's 12% overshoot on a jump to 100% runs past the end of the track and
 * comes back — which reads as the job finishing, unfinishing, then finishing.
 */
export function Progress({ value, tone = "accent", style }: ProgressProps) {
  const theme = useTheme();
  const clamped = value === undefined ? 0 : Math.max(0, Math.min(100, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={value === undefined ? undefined : { now: clamped, min: 0, max: 100 }}
      style={[
        {
          height: 6,
          borderRadius: theme.radius.full,
          backgroundColor: theme.scales.neutral[3],
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: "100%",
          borderRadius: theme.radius.full,
          backgroundColor: theme.scales[tone][8],
        }}
      />
    </View>
  );
}
