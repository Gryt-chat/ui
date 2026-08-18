import { useCallback, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { AnchoredPopup } from "../../overlay/AnchoredPopup";
import { useAnchorMeasure } from "../../overlay/useAnchoredPosition";
import { useTheme } from "../../theme";

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}

export type SelectSize = "small" | "medium";

const SIZES: Record<SelectSize, { minHeight: number; fontSize: number; paddingH: number }> = {
  small: { minHeight: 36, fontSize: 14, paddingH: 12 },
  medium: { minHeight: 40, fontSize: 14, paddingH: 14 },
};

export interface SelectProps {
  options?: SelectOption[];
  value?: string | number | null;
  defaultValue?: string | number | null;
  onValueChange?: (value: string | number) => void;
  label?: ReactNode;
  placeholder?: string;
  size?: SelectSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A single component, like the web's, rather than a namespace.
 *
 * `@gryt/ui`'s Select takes an `options` array and renders the trigger, the
 * list, the checkmark and the positioning itself, so this matches that shape
 * instead of exposing Root/Trigger/Popup.
 *
 * Underneath it is the same anchored popup Menu uses. The one thing worth
 * knowing: the platform pickers are not used. iOS would give a wheel and Android
 * a dialog, neither takes the Gryt palette, and the two look nothing like each
 * other. A list matching the rest of the library is more use than two native
 * controls that match neither.
 */
export function Select({
  options = [],
  value: controlled,
  defaultValue = null,
  onValueChange,
  label,
  placeholder = "Select…",
  size = "medium",
  disabled,
  style,
}: SelectProps) {
  const theme = useTheme();
  const metrics = SIZES[size];
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled === undefined ? uncontrolled : controlled;
  const { anchor, measure } = useAnchorMeasure();
  const ref = useRef<View | null>(null);

  const selected = options.find((o) => o.value === value);

  const openList = useCallback(() => {
    measure(ref.current);
    setOpen(true);
  }, [measure]);

  return (
    <View style={[{ gap: theme.space(1.5) }, style]}>
      {label ? (
        <Text style={{ color: theme.color.muted, fontSize: 13, fontWeight: "500" }}>
          {label}
        </Text>
      ) : null}

      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, expanded: open }}
        disabled={disabled}
        onPress={openList}
        style={{
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingH,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.space(2),
          borderWidth: 1,
          borderColor: open ? theme.color.accent : theme.color.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.color.surface,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {typeof selected?.label === "string" || selected === undefined ? (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: selected ? theme.color.text : theme.color.muted,
              fontSize: metrics.fontSize,
            }}
          >
            {selected ? (selected.label as string) : placeholder}
          </Text>
        ) : (
          <View style={{ flex: 1 }}>{selected.label}</View>
        )}
        <Text style={{ color: theme.color.muted, fontSize: 11 }}>▾</Text>
      </Pressable>

      <AnchoredPopup
        open={open}
        anchor={anchor}
        onDismiss={() => setOpen(false)}
        align="start"
        style={{ paddingVertical: theme.space(1), minWidth: 180 }}
      >
        <View accessibilityRole="menu">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={String(option.value)}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected, disabled: !!option.disabled }}
                disabled={option.disabled}
                onPress={() => {
                  if (controlled === undefined) setUncontrolled(option.value);
                  onValueChange?.(option.value);
                  setOpen(false);
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.space(3),
                  paddingHorizontal: theme.space(4),
                  paddingVertical: theme.space(2.5),
                  opacity: option.disabled ? 0.5 : 1,
                  backgroundColor: pressed ? theme.color.surfaceHover : "transparent",
                })}
              >
                {typeof option.label === "string" ? (
                  <Text style={{ color: theme.color.text, fontSize: 14 }}>
                    {option.label}
                  </Text>
                ) : (
                  option.label
                )}
                {isSelected ? (
                  <Text style={{ color: theme.color.accent, fontSize: 13, fontWeight: "900" }}>
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </AnchoredPopup>
    </View>
  );
}
