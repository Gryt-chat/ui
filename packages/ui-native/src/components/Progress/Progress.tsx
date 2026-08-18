import { View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface ProgressProps {
  /** 0 to 100. Leave undefined for an indeterminate bar. */
  value?: number;
  tone?: "accent" | "success" | "danger" | "warning";
  style?: StyleProp<ViewStyle>;
}

/**
 * Determinate only for now.
 *
 * The web's indeterminate state is a CSS keyframe sweeping a partial bar across
 * the track. Reproducing it here needs an Animated loop and a reduce-motion
 * check, which is worth doing properly rather than as a footnote on this one, so
 * an undefined value currently renders an empty track. Recorded in the parity
 * exceptions table.
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
