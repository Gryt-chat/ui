import { type ReactNode } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "../../internal/Text";
import Animated from "react-native-reanimated";

import { grytScaleSteps } from "@gryt/theme";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { usePressScale } from "../../motion";
import { useTheme } from "../../theme";

export type ButtonTone = "primary" | "secondary" | "neutral" | "danger" | "ghost";
export type ButtonSize = "xsmall" | "small" | "medium" | "large";

const SIZES: Record<ButtonSize, { minHeight: number; paddingH: number; fontSize: number }> = {
  xsmall: { minHeight: 32, paddingH: 12, fontSize: 12 },
  small: { minHeight: 36, paddingH: 16, fontSize: 14 },
  medium: { minHeight: 40, paddingH: 20, fontSize: 14 },
  large: { minHeight: 48, paddingH: 24, fontSize: 16 },
};

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  children?: ReactNode;
  tone?: ButtonTone;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * This button opens something.
   *
   * The web reads `aria-haspopup`, which Base UI sets on a trigger, and skips
   * the press scale for it: the popup is positioned against the trigger's
   * measured box and keeps measuring while open, so a trigger that changes size
   * drags its own menu sideways. React Native has no equivalent attribute, so
   * the caller says it.
   */
  hasPopup?: boolean;
}

/**
 * `active:scale-[0.96]` on the web, and the same number here.
 *
 * `hover:scale-[1.03]` has no counterpart: a touch screen has no state
 * between not-touching and touching, so emulating hover would be a
 * difference from the web rather than a match to it.
 */
const PRESSED_SCALE = grytScaleSteps.button.press;

export function Button({
  children,
  tone = "primary",
  size = "medium",
  startIcon,
  endIcon,
  style,
  hasPopup = false,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const metrics = SIZES[size];
  const animate = !reducedMotion && !hasPopup && !disabled;
  const press = usePressScale(PRESSED_SCALE, !animate);

  const fill =
    tone === "primary"
      ? theme.color.accent
      : tone === "secondary"
        ? theme.color.secondary
        : tone === "neutral"
          ? theme.color.surfaceRaised
          : tone === "danger"
            ? theme.color.danger
            : "transparent";

  const label =
    tone === "primary"
      ? theme.color.onAccent
      : tone === "secondary"
        ? theme.color.onSecondary
        : tone === "danger"
          ? theme.color.onDanger
          : tone === "ghost"
            ? theme.color.muted
            : theme.color.text;

  /**
   * Disabled drops the fill rather than fading it.
   *
   * Every tone used to share one `opacity: 0.5`, and on the quiet tones that
   * reads. On a filled one it does not: the accent at half opacity over a dark
   * screen is still a saturated purple button, and nothing in it says it will
   * not respond. That cost two taps on a Save button before I believed it was
   * inert, having written the disabled condition myself half an hour earlier.
   * GRYT-511, and the web's Button makes the same change in the same commit.
   *
   * So a disabled filled button becomes the surface it sits on, with a muted
   * label — same size, same word, no longer claiming to be the action. Ghost
   * has no fill to lose and its label is already muted, so the opacity below is
   * what carries it.
   */
  const background = disabled && tone !== "ghost" ? theme.color.surfaceRaised : fill;
  const foreground = disabled ? theme.color.muted : label;

  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={{
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingH,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.space(2),
          borderRadius: theme.radius.full,
          backgroundColor: background,
          /* Lighter than it was, because the fill swap is doing the work now.
             It is kept because `startIcon` and `endIcon` are the caller's
             elements with the caller's colours — nothing here can mute those,
             and an icon at full strength on a dead button is the same lie in
             miniature. */
          opacity: disabled ? 0.6 : 1,
        }}
        {...rest}
      >
        {startIcon}
        {typeof children === "string" ? (
          <Text
            numberOfLines={1}
            style={{
              color: foreground,
              fontSize: metrics.fontSize,
              fontWeight: "600",
            }}
          >
            {children}
          </Text>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {children}
          </View>
        )}
        {endIcon}
      </Pressable>
    </Animated.View>
  );
}
