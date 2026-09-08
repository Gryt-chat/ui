import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { AnchoredPopup } from "../../overlay/AnchoredPopup";
import type { Align, Side } from "../../overlay/placePopup";
import { useAnchorMeasure } from "../../overlay/useAnchoredPosition";
import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";
import { useTheme } from "../../theme";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchor: ReturnType<typeof useAnchorMeasure>["anchor"];
  measure: (node: View | null) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(part: string) {
  const value = useContext(PopoverContext);
  if (!value) throw new Error(`Popover.${part} must be rendered inside Popover.Root.`);
  return value;
}

export interface PopoverRootProps extends OpenStateProps {
  children?: ReactNode;
}

function Root({ children, ...openProps }: PopoverRootProps) {
  const { open, setOpen } = useOpenState(openProps);
  const { anchor, measure } = useAnchorMeasure();
  return (
    <PopoverContext.Provider value={{ open, setOpen, anchor, measure }}>
      {children}
    </PopoverContext.Provider>
  );
}

function Trigger({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { setOpen, measure } = usePopover("Trigger");
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

/** A passthrough. React Native's Modal already renders above everything. */
function Portal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export interface PopoverPopupProps {
  children?: ReactNode;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  style?: StyleProp<ViewStyle>;
}

function Popup({ children, style, ...options }: PopoverPopupProps) {
  const { open, setOpen, anchor } = usePopover("Popup");
  const theme = useTheme();
  return (
    <AnchoredPopup
      open={open}
      anchor={anchor}
      onDismiss={() => setOpen(false)}
      style={[{ padding: theme.space(3), minWidth: 160 }, style]}
      {...options}
    >
      {children}
    </AnchoredPopup>
  );
}

function Close({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { setOpen } = usePopover("Close");
  return (
    <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={style}>
      {children}
    </Pressable>
  );
}

/**
 * Not drawn. Base UI's Arrow is positioned once Floating UI has settled; here it would
 * mean a rotated square and a two-sided border. A no-op, so call sites match.
 */
function Arrow() {
  return null;
}

export const Popover = { Root, Trigger, Portal, Popup, Close, Arrow };
