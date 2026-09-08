import { ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface SpinnerProps {
  size?: "small" | "large";
  /** Defaults to the accent solid step, the same one the web spinner uses. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The platform indicator rather than a rotating SVG: ActivityIndicator is what the OS draws
 * for "working", it respects reduce-motion, and the two platforms differ on purpose.
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
