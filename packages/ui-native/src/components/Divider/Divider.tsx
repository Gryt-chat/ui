import { View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  /** Inset from both ends, in 4pt steps. */
  inset?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A hairline.
 *
 * The web uses 1px. Here it is `1` in device-independent points, which lands on
 * one physical pixel on a 1x screen and stays a hairline on 2x and 3x — the same
 * thing the web gets from a 1px border on a retina display.
 */
export function Divider({
  orientation = "horizontal",
  inset = 0,
  style,
}: DividerProps) {
  const theme = useTheme();
  const gap = theme.space(inset);

  return (
    <View
      accessibilityRole="none"
      style={[
        orientation === "horizontal"
          ? { height: 1, alignSelf: "stretch", marginHorizontal: gap }
          : { width: 1, alignSelf: "stretch", marginVertical: gap },
        { backgroundColor: theme.color.border },
        style,
      ]}
    />
  );
}
