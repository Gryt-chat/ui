import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";

import { AnchoredPopup } from "../../overlay/AnchoredPopup";
import type { Align, Side } from "../../overlay/placePopup";
import { useAnchorMeasure } from "../../overlay/useAnchoredPosition";
import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";
import { useTheme } from "../../theme";

/**
 * A tooltip on a device with no pointer: opens on a long press, closes when the
 * press ends. **A different interaction wearing the same name**, and the
 * component where 1:1 is least achievable — an interface that depends on
 * tooltips to be usable will not survive the port. In the exceptions table.
 */

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchor: ReturnType<typeof useAnchorMeasure>["anchor"];
  measure: (node: View | null) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltip(part: string) {
  const value = useContext(TooltipContext);
  if (!value) throw new Error(`Tooltip.${part} must be rendered inside Tooltip.Root.`);
  return value;
}

export interface TooltipRootProps extends OpenStateProps {
  children?: ReactNode;
}

function Root({ children, ...openProps }: TooltipRootProps) {
  const { open, setOpen } = useOpenState(openProps);
  const { anchor, measure } = useAnchorMeasure();
  return (
    <TooltipContext.Provider value={{ open, setOpen, anchor, measure }}>
      {children}
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps {
  children?: ReactNode;
  /** Still fires on a normal tap, so the tooltip does not eat the action. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function Trigger({ children, onPress, style }: TooltipTriggerProps) {
  const { setOpen, measure } = useTooltip("Trigger");
  const ref = useRef<View | null>(null);

  const show = useCallback(() => {
    measure(ref.current);
    setOpen(true);
  }, [measure, setOpen]);

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onLongPress={show}
      onPressOut={() => setOpen(false)}
      style={style}
    >
      {children}
    </Pressable>
  );
}

function Portal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export interface TooltipPopupProps {
  children?: ReactNode;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  style?: StyleProp<ViewStyle>;
}

function Popup({ children, style, ...options }: TooltipPopupProps) {
  const { open, setOpen, anchor } = useTooltip("Popup");
  const theme = useTheme();

  return (
    <AnchoredPopup
      open={open}
      anchor={anchor}
      onDismiss={() => setOpen(false)}
      side="top"
      // A tooltip is never the thing you are trying to touch.
      pointerEvents="none"
      style={[
        {
          paddingHorizontal: theme.space(2.5),
          paddingVertical: theme.space(1.5),
          maxWidth: 260,
          backgroundColor: theme.scales.neutral[4],
        },
        style,
      ]}
      {...options}
    >
      {typeof children === "string" ? (
        <Text style={{ color: theme.color.text, fontSize: 12 }}>{children}</Text>
      ) : (
        children
      )}
    </AnchoredPopup>
  );
}

/** The web's Provider shares a delay timer between tooltips. There is no delay here. */
function Provider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export const Tooltip = { Root, Trigger, Portal, Popup, Provider };
export const TooltipProvider = Provider;
