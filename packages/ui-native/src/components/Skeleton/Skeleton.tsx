import { View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  /** Matches the shape of what is loading. `circle` for avatars. */
  shape?: "rect" | "circle" | "text";
  style?: StyleProp<ViewStyle>;
}

/**
 * Still, not shimmering.
 *
 * The web version pulses. A looping animation here would run for as long as the
 * request takes, on a device where that costs battery, and it is the kind of
 * motion reduce-motion users turn off first. A flat block reads as "loading"
 * without any of that. Recorded in the parity exceptions table.
 */
export function Skeleton({
  width = "100%",
  height,
  shape = "rect",
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const resolved = height ?? (shape === "text" ? 14 : 40);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[
        {
          width,
          height: resolved,
          backgroundColor: theme.scales.neutral[3],
          borderRadius:
            shape === "circle"
              ? resolved / 2
              : shape === "text"
                ? theme.radius.sm
                : theme.radius.md,
        },
        style,
      ]}
    />
  );
}
