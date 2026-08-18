import { createContext, useContext, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsible(part: string) {
  const value = useContext(CollapsibleContext);
  if (!value) throw new Error(`Collapsible.${part} must be rendered inside Collapsible.Root.`);
  return value;
}

export interface CollapsibleRootProps extends OpenStateProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Root({ children, style, ...openProps }: CollapsibleRootProps) {
  const state = useOpenState(openProps);
  return (
    <CollapsibleContext.Provider value={state}>
      <View style={style}>{children}</View>
    </CollapsibleContext.Provider>
  );
}

function Trigger({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { open, setOpen } = useCollapsible("Trigger");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={() => setOpen(!open)}
      style={style}
    >
      {children}
    </Pressable>
  );
}

/**
 * Unmounted when closed, rather than animated to zero height.
 *
 * The web animates the panel's height, which needs the content measured first.
 * React Native can do it with `onLayout` plus `Animated`, and it costs a frame
 * of the content rendered at the wrong size before the measurement lands. Not
 * worth it for the first pass, and it is in the exceptions table.
 */
function Panel({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { open } = useCollapsible("Panel");
  if (!open) return null;
  return <View style={style}>{children}</View>;
}

export const Collapsible = { Root, Trigger, Panel };
