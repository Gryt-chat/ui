import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";

import { useTheme } from "../../theme";

export type AlertSeverity = "info" | "success" | "warning" | "error";

export interface AlertProps {
  severity?: AlertSeverity;
  title?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const RAMP: Record<AlertSeverity, "accent" | "success" | "warning" | "danger"> = {
  info: "accent",
  success: "success",
  warning: "warning",
  error: "danger",
};

/**
 * Severity is carried by colour and by the accessibility role, not an icon —
 * colour alone does not tell somebody an alert is an error, and the live region
 * reaches a screen reader where an icon does not. A visible icon still wants an
 * icon set; noted in the exceptions table.
 */
export function Alert({ severity = "info", title, children, style }: AlertProps) {
  const theme = useTheme();
  const ramp = theme.scales[RAMP[severity]];
  const urgent = severity === "error" || severity === "warning";

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion={urgent ? "assertive" : "polite"}
      style={[
        {
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: ramp[6],
          backgroundColor: ramp[2],
          padding: theme.space(3),
          gap: theme.space(1),
        },
        style,
      ]}
    >
      {title ? (
        typeof title === "string" ? (
          <Text style={{ color: ramp[11], fontSize: 14, fontWeight: "600" }}>{title}</Text>
        ) : (
          title
        )
      ) : null}
      {typeof children === "string" ? (
        <Text style={{ color: ramp[10], fontSize: 13, lineHeight: 18 }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
