import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { springy } from "../../motion";
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
 * Animates its height, the same as the web.
 *
 * The web transitions height on `ease-spring` at `--gryt-dur-spring`, and this
 * now does the same curve at the same duration.
 *
 * The content has to be measured before its height can be animated to, which
 * is why this was unmounted-when-closed to begin with. It is measured off an
 * absolutely positioned copy that never affects layout, so nothing is drawn at
 * the wrong size on the way in — the earlier objection was to measuring the
 * visible content and paying a frame for it.
 *
 * Children stay mounted while closed, at height zero with `overflow: hidden`,
 * matching the web. That is a behaviour change as well as a visual one: state
 * inside a closed panel now survives, where before it was destroyed.
 */
function Panel({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { open } = useCollapsible("Panel");
  const reducedMotion = useReducedMotion();
  const [height, setHeight] = useState(0);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    const to = open ? 1 : 0;
    // eslint-disable-next-line react-hooks/immutability
    progress.value = reducedMotion ? to : springy(to);
  }, [open, progress, reducedMotion]);

  const animated = useAnimatedStyle(() => ({
    height: height * progress.value,
    opacity: progress.value
  }));

  return (
    <Animated.View style={[{ overflow: "hidden" }, animated, style]}>
      {/* Measured, never seen. Absolute so it cannot push the layout around,
          and non-interactive so it cannot take a touch from the real copy. */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 0, right: 0, opacity: 0 }}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      >
        {children}
      </View>
      {children}
    </Animated.View>
  );
}

export const Collapsible = { Root, Trigger, Panel };
