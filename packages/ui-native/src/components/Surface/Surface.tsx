import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

/**
 * A panel. The thing almost everything else sits on.
 *
 * `@gryt/ui`'s Surface is a div with Tailwind classes picking `--gryt-neutral-*`
 * steps. The steps are the same here; only the delivery differs.
 */
export type SurfaceLevel = "bg" | "surface" | "raised";

export interface SurfaceProps extends ViewProps {
  level?: SurfaceLevel;
  bordered?: boolean;
  radius?: "sm" | "md" | "lg" | "xl" | "full" | "none";
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

export function Surface({
  level = "surface",
  bordered = false,
  radius = "md",
  padding,
  style,
  ...rest
}: SurfaceProps) {
  const theme = useTheme();

  const background =
    level === "bg"
      ? theme.color.bg
      : level === "raised"
        ? theme.color.surfaceRaised
        : theme.color.surface;

  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderRadius: radius === "none" ? 0 : theme.radius[radius],
          ...(bordered
            ? { borderWidth: 1, borderColor: theme.color.border }
            : null),
          ...(padding === undefined ? null : { padding: theme.space(padding) }),
        },
        style,
      ]}
      {...rest}
    />
  );
}
