import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export type BadgeTone = "neutral" | "accent" | "secondary" | "success" | "danger" | "warning";

export interface BadgeProps {
  /** Rendered as a count. Values above `max` show as "max+". */
  count?: number;
  max?: number;
  /** A dot with no number, for "something happened" without saying how much. */
  dot?: boolean;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

export function Badge({
  count,
  max = 99,
  dot = false,
  tone = "danger",
  style,
}: BadgeProps) {
  const theme = useTheme();
  const ramp = theme.scales[tone];

  if (dot) {
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel="Unread"
        style={[
          { width: 8, height: 8, borderRadius: 4, backgroundColor: ramp[8] },
          style,
        ]}
      />
    );
  }

  if (count === undefined || count <= 0) return null;
  const label = count > max ? `${max}+` : String(count);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${count} unread`}
      style={[
        {
          minWidth: 18,
          height: 18,
          paddingHorizontal: 5,
          borderRadius: 9,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: ramp[8],
        },
        style,
      ]}
    >
      <Text style={{ color: theme.color.bg, fontSize: 11, fontWeight: "700" }}>
        {label}
      </Text>
    </View>
  );
}
