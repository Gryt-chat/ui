import type { ReactNode } from "react";
import { View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";

import { useTheme } from "../../theme";

export interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.color.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.color.border,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Sits at the end of the header row: an avatar, a menu, a badge. */
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export function CardHeader({ title, subtitle, action, style, titleStyle }: CardHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.space(3),
          padding: theme.space(4),
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: theme.space(0.5) }}>
        {typeof title === "string" ? (
          <Text
            accessibilityRole="header"
            style={[{ color: theme.color.text, fontSize: 16, fontWeight: "600" }, titleStyle]}
          >
            {title}
          </Text>
        ) : (
          title
        )}
        {typeof subtitle === "string" ? (
          <Text style={{ color: theme.color.muted, fontSize: 13 }}>{subtitle}</Text>
        ) : (
          subtitle
        )}
      </View>
      {action}
    </View>
  );
}

export function CardContent({ children, style }: CardProps) {
  const theme = useTheme();
  return (
    <View style={[{ paddingHorizontal: theme.space(4), paddingBottom: theme.space(4), gap: theme.space(2) }, style]}>
      {children}
    </View>
  );
}

export function CardActions({ children, style }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: theme.space(2),
          paddingHorizontal: theme.space(4),
          paddingBottom: theme.space(4),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
