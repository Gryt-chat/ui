import { useState } from "react";
import { Image, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";

import { useTheme } from "../../theme";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

export interface AvatarProps {
  name?: string;
  source?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
}

/**
 * Picks a ramp from the name, so the same person is the same colour everywhere.
 *
 * Deliberately the same arithmetic as the web: sum the code units and take the
 * remainder. Anything cleverer would give a different colour on each platform
 * for the same person, which is the one outcome to avoid.
 */
function toneFor(name: string): "accent" | "secondary" | "success" | "danger" | "warning" {
  const tones = ["accent", "secondary", "success", "danger", "warning"] as const;
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return tones[sum % tones.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name = "", source, size = "md", style }: AvatarProps) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const px = SIZES[size];
  const ramp = theme.scales[toneFor(name)];

  const frame: ViewStyle = {
    width: px,
    height: px,
    borderRadius: px / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  // A broken image URL falls back to initials rather than to a blank circle.
  // The web gets this from <img onerror>; here it is onError plus state.
  if (source && !failed) {
    return (
      <View style={[frame, { backgroundColor: theme.color.surfaceRaised }, style]}>
        <Image
          source={{ uri: source }}
          onError={() => setFailed(true)}
          accessibilityLabel={name || undefined}
          style={{ width: px, height: px }}
        />
      </View>
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name || undefined}
      style={[frame, { backgroundColor: ramp[2] }, style]}
    >
      <Text
        style={{
          color: ramp[10],
          fontSize: Math.round(px * 0.4),
          fontWeight: "600",
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
