import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { AnchoredPopup } from "../../overlay/AnchoredPopup";
import type { Align, Side } from "../../overlay/placePopup";
import { useAnchorMeasure } from "../../overlay/useAnchoredPosition";
import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";
import { useTheme } from "../../theme";

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchor: ReturnType<typeof useAnchorMeasure>["anchor"];
  measure: (node: View | null) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(part: string) {
  const value = useContext(MenuContext);
  if (!value) throw new Error(`Menu.${part} must be rendered inside Menu.Root.`);
  return value;
}

export interface MenuRootProps extends OpenStateProps {
  children?: ReactNode;
}

function Root({ children, ...openProps }: MenuRootProps) {
  const { open, setOpen } = useOpenState(openProps);
  const { anchor, measure } = useAnchorMeasure();
  return (
    <MenuContext.Provider value={{ open, setOpen, anchor, measure }}>
      {children}
    </MenuContext.Provider>
  );
}

function Trigger({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { setOpen, measure } = useMenu("Trigger");
  const ref = useRef<View | null>(null);
  const onPress = useCallback(() => {
    measure(ref.current);
    setOpen(true);
  }, [measure, setOpen]);
  return (
    <Pressable ref={ref} accessibilityRole="button" onPress={onPress} style={style}>
      {children}
    </Pressable>
  );
}

function Portal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

/**
 * Kept as a passthrough for shape.
 *
 * Base UI splits Positioner from Popup so the positioned box and the styled box
 * are separate elements. Here AnchoredPopup is both, because there is no
 * stacking context to escape and nothing gained by the extra view.
 */
function Positioner({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export interface MenuPopupProps {
  children?: ReactNode;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  style?: StyleProp<ViewStyle>;
}

function Popup({ children, style, ...options }: MenuPopupProps) {
  const { open, setOpen, anchor } = useMenu("Popup");
  const theme = useTheme();
  return (
    <AnchoredPopup
      open={open}
      anchor={anchor}
      onDismiss={() => setOpen(false)}
      align="start"
      style={[{ paddingVertical: theme.space(1), minWidth: 180 }, style]}
      {...options}
    >
      <View accessibilityRole="menu">{children}</View>
    </AnchoredPopup>
  );
}

export interface MenuItemProps {
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Renders in the danger ramp, for destructive actions. */
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
}

function Item({ children, onPress, disabled, destructive, style }: MenuItemProps) {
  const { setOpen } = useMenu("Item");
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      // Choosing something closes the menu, which is what Base UI does unless
      // an item opts out. Nothing here opts out yet.
      onPress={() => {
        onPress?.();
        setOpen(false);
      }}
      style={({ pressed }) => [
        {
          paddingHorizontal: theme.space(4),
          paddingVertical: theme.space(2.5),
          opacity: disabled ? 0.5 : 1,
          backgroundColor: pressed ? theme.color.surfaceHover : "transparent",
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={{
            color: destructive ? theme.scales.danger[10] : theme.color.text,
            fontSize: 14,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function Separator({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[
        { height: 1, backgroundColor: theme.color.border, marginVertical: theme.space(1) },
        style,
      ]}
    />
  );
}

export const Menu = { Root, Trigger, Portal, Positioner, Popup, Item, Separator };
