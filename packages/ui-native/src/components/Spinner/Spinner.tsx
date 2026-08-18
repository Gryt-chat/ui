import { ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface SpinnerProps {
  size?: "small" | "large";
  /** Defaults to the accent solid step, the same one the web spinner uses. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The platform indicator rather than a rotating SVG.
 *
 * `@gryt/ui`'s Spinner is a CSS animation on a stroked circle, and it could be
 * reproduced here with Animated and a loop. It should not be: ActivityIndicator
 * is what the OS draws for "working", it respects reduce-motion for free, and on
 * iOS and Android it looks different from each other on purpose.
 *
 * So this is the first entry on the parity exceptions list — the behaviour
 * matches, the drawing does not, and matching the drawing would be worse.
 */
export function Spinner({ size = "small", color, style }: SpinnerProps) {
  const theme = useTheme();
  return (
    <ActivityIndicator
      size={size}
      color={color ?? theme.scales.accent[8]}
      style={style}
    />
  );
}
