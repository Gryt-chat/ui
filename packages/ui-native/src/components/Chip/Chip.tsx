import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export type ChipTone = "neutral" | "accent" | "secondary" | "success" | "danger" | "warning";
export type ChipVariant = "soft" | "solid" | "outline";

export interface ChipProps {
  label: string;
  tone?: ChipTone;
  variant?: ChipVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * A small status label. No interaction — that is Button's job.
 *
 * Steps 3, 9 and 11 are the same ones `@gryt/ui` picks: 3 is the soft fill, 9
 * is the solid one, 11 is text that passes contrast against both.
 */
export function Chip({
  label,
  tone = "neutral",
  variant = "soft",
  style,
}: ChipProps) {
  const theme = useTheme();
  const ramp = theme.scales[tone];

  const background =
    variant === "solid" ? ramp[8] : variant === "soft" ? ramp[2] : "transparent";

  const foreground =
    variant === "solid"
      ? tone === "accent"
        ? theme.color.onAccent
        : tone === "secondary"
          ? theme.color.onSecondary
          : tone === "danger"
            ? theme.color.onDanger
            : theme.color.bg
      : ramp[10];

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: background,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.space(2.5),
          paddingVertical: theme.space(1),
          ...(variant === "outline"
            ? { borderWidth: 1, borderColor: ramp[6] }
            : null),
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={{ color: foreground, fontSize: 12, fontWeight: "600" }}
      >
        {label}
      </Text>
    </View>
  );
}
