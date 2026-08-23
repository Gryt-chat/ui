import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";

import { useTheme } from "../../theme";

export interface MeterProps {
  value: number;
  min?: number;
  max?: number;
  label?: ReactNode;
  /** Shows the formatted value at the end of the label row. */
  showValue?: boolean;
  format?: (value: number) => string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A reading, not a progress bar.
 *
 * Progress goes one way and finishes. A meter is a level that moves in both
 * directions: microphone input, disk use, how full a channel is. `@gryt/ui`
 * keeps them separate for that reason and so does this.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  label,
  showValue = false,
  format,
  style,
}: MeterProps) {
  const theme = useTheme();
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));

  // Green until it is worth noticing, amber, then red. The thresholds match the
  // web's: two thirds and nine tenths.
  const ramp =
    ratio >= 0.9
      ? theme.scales.danger
      : ratio >= 0.66
        ? theme.scales.warning
        : theme.scales.success;

  return (
    <View style={[{ gap: theme.space(1.5) }, style]}>
      {label || showValue ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {typeof label === "string" ? (
            <Text style={{ color: theme.color.muted, fontSize: 13 }}>{label}</Text>
          ) : (
            label
          )}
          {showValue ? (
            <Text style={{ color: theme.color.muted, fontSize: 13 }}>
              {format ? format(value) : String(Math.round(value))}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min, max, now: value }}
        style={{
          height: 6,
          borderRadius: theme.radius.full,
          backgroundColor: theme.scales.neutral[3],
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            borderRadius: theme.radius.full,
            backgroundColor: ramp[8],
          }}
        />
      </View>
    </View>
  );
}
