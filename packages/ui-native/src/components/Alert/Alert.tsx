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
 * Severity is carried by colour and by the accessibility role, not by an icon.
 *
 * Colour alone is not enough to tell somebody an alert is an error, which is why
 * the web pairs it with an icon. The equivalent here is the live region: an
 * `error` or `warning` announces itself as an assertive alert, the other two
 * politely. That reaches a screen reader, which an icon does not.
 *
 * A visible icon still wants an icon set. Noted in the exceptions table.
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
