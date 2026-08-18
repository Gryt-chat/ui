import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface ToolbarProps {
  children?: ReactNode;
  orientation?: "horizontal" | "vertical";
  style?: StyleProp<ViewStyle>;
}

/**
 * A row of controls that reads as one thing.
 *
 * The web's Toolbar manages roving focus, so arrow keys move between the
 * buttons and the group takes one tab stop. There is no roving focus to manage
 * here, so what is left is the grouping: the accessibility role, and the
 * spacing.
 *
 * Kept rather than dropped because the role is what tells a screen reader these
 * controls belong together, which is most of what the web version was for.
 */
export function Toolbar({ children, orientation = "horizontal", style }: ToolbarProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="toolbar"
      style={[
        {
          flexDirection: orientation === "horizontal" ? "row" : "column",
          alignItems: "center",
          gap: theme.space(1),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface ToolbarSeparatorProps {
  orientation?: "horizontal" | "vertical";
  style?: StyleProp<ViewStyle>;
}

export function ToolbarSeparator({
  orientation = "vertical",
  style,
}: ToolbarSeparatorProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        orientation === "vertical"
          ? { width: 1, alignSelf: "stretch", marginVertical: theme.space(1.5) }
          : { height: 1, alignSelf: "stretch", marginHorizontal: theme.space(1.5) },
        { backgroundColor: theme.color.border },
        style,
      ]}
    />
  );
}
