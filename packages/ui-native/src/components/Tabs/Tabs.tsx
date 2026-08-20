import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { springy } from "../../motion";
import { useTheme } from "../../theme";

type TabValue = string | number;
export type TabsOrientation = "horizontal" | "vertical";

/** Where a tab is, in its list's coordinates. */
interface TabBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TabsContextValue {
  value: TabValue | null;
  setValue: (value: TabValue) => void;
  orientation: TabsOrientation;
  report: (value: TabValue, box: TabBox) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string) {
  const value = useContext(TabsContext);
  if (!value) throw new Error(`Tabs.${part} must be rendered inside Tabs.`);
  return value;
}

/** Matches the web: `p-1` on the list, so the pill insets by 4 on every side. */
const LIST_PADDING = 4;

export interface TabsProps {
  value?: TabValue;
  defaultValue?: TabValue;
  onValueChange?: (value: TabValue) => void;
  /**
   * A rail rather than a row. Same visual language turned ninety degrees, and
   * the same caveat the web carries: past about a dozen destinations a filled
   * pill becomes a block of accent parked in the corner, and something quieter
   * is the better call.
   */
  orientation?: TabsOrientation;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Root({
  value: controlled,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  children,
  style,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState<TabValue | null>(
    defaultValue ?? null,
  );
  const [boxes, setBoxes] = useState<Record<string, TabBox>>({});
  const value = controlled ?? uncontrolled;

  // Keyed by String(value) because a Record cannot key on `string | number`
  // and 1 and "1" would collide. They are already distinct TabValues, so
  // collapsing them here would make two tabs share one measurement.
  const report = useCallback((tab: TabValue, box: TabBox) => {
    setBoxes((prev) => {
      const key = `${typeof tab}:${tab}`;
      const seen = prev[key];
      if (
        seen &&
        seen.x === box.x &&
        seen.y === box.y &&
        seen.width === box.width &&
        seen.height === box.height
      ) {
        // onLayout fires on every re-render in some trees, and setting state
        // unconditionally from it is an infinite loop.
        return prev;
      }
      return { ...prev, [key]: box };
    });
  }, []);

  const context = useMemo<TabsContextValue>(
    () => ({
      value,
      orientation,
      report,
      setValue: (next) => {
        if (controlled === undefined) setUncontrolled(next);
        onValueChange?.(next);
      },
    }),
    [value, orientation, report, controlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={context}>
      <BoxesContext.Provider value={boxes}>
        <View
          style={[
            // Vertical puts the rail and the panel side by side, as the web's
            // `data-[orientation=vertical]:flex` does.
            orientation === "vertical"
              ? { flexDirection: "row", alignItems: "stretch" }
              : null,
            style,
          ]}
        >
          {children}
        </View>
      </BoxesContext.Provider>
    </TabsContext.Provider>
  );
}

const BoxesContext = createContext<Record<string, TabBox>>({});

export interface TabsListProps {
  children?: ReactNode;
  /**
   * Tabs that do not fit scroll sideways rather than overflowing.
   *
   * Off by default, which is the web's behaviour and the reason this defaults
   * the way it does — the web has no scroller here at all. It is kept because
   * a phone is narrow and a five-tab rail genuinely does not fit, and clipping
   * silently is worse than scrolling. Horizontal only; a vertical rail is a
   * column in a screen that already scrolls.
   */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The pill rail, and the indicator that slides across it.
 *
 * The indicator lives here rather than in `Tabs.Indicator` because it needs
 * every tab's measured box, and the list is the only part that sees them all.
 * `Tabs.Indicator` is still exported and still renders nothing, so a call site
 * copied from the web keeps working.
 *
 * The previous version of this file drew a 2px underline per tab and said
 * sliding one pill was "real work for a decoration". It is real work, and the
 * decoration is most of what the component looks like — an underline and a
 * filled pill are not the same design with different paint.
 */
function List({ children, scrollable = false, style }: TabsListProps) {
  const theme = useTheme();
  const tabs = useTabs("List");
  const boxes = useContext(BoxesContext);
  const reducedMotion = useReducedMotion();
  const vertical = tabs.orientation === "vertical";

  const active = tabs.value === null ? undefined : boxes[`${typeof tabs.value}:${tabs.value}`];

  // Starts at 0 and is only ever animated to a measured box, so the pill grows
  // out of the left edge on first paint. The web has the same first-frame
  // problem and solves it with `renderBeforeHydration`; here the first layout
  // arrives in the same frame as the first paint, so there is nothing to see.
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const w = useSharedValue(0);
  const h = useSharedValue(0);

  if (active) {
    const to = reducedMotion
      ? { x: active.x, y: active.y, w: active.width, h: active.height }
      : null;
    /* eslint-disable react-hooks/immutability */
    // Assigned during render on purpose: a shared value is not React state and
    // does not schedule one, and doing it in an effect would land the animation
    // a frame after the tab's colour has already changed.
    x.value = to ? to.x : springy(active.x);
    y.value = to ? to.y : springy(active.y);
    w.value = to ? to.w : springy(active.width);
    h.value = to ? to.h : springy(active.height);
    /* eslint-enable react-hooks/immutability */
  }

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    width: w.value,
    height: h.value,
  }));

  const row = (
    <View
      accessibilityRole="tablist"
      style={[
        {
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "stretch" : "center",
          alignSelf: vertical ? "auto" : "flex-start",
          gap: LIST_PADDING,
          padding: LIST_PADDING,
          backgroundColor: theme.color.surfaceRaised,
          // A 999px radius on a tall box bows its short edges, which is why the
          // web drops the rail to `lg` rather than keeping the pill shape.
          borderRadius: vertical ? theme.radius.lg : theme.radius.full,
        },
        style,
      ]}
    >
      {active ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              borderRadius: vertical ? theme.radius.md : theme.radius.full,
              backgroundColor: theme.color.accent,
            },
            indicatorStyle,
          ]}
        />
      ) : null}
      {children}
    </View>
  );

  if (!scrollable || vertical) return row;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  );
}

export interface TabProps {
  value: TabValue;
  children?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

function Tab({ value, children, disabled, style }: TabProps) {
  const theme = useTheme();
  const tabs = useTabs("Tab");
  const active = tabs.value === value;
  const vertical = tabs.orientation === "vertical";

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      tabs.report(value, { x, y, width, height });
    },
    [tabs, value],
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => tabs.setValue(value)}
      onLayout={onLayout}
      // Sits above the indicator, which is absolutely positioned behind it.
      // Without this the pill paints over its own label.
      style={[
        {
          zIndex: 1,
          minHeight: vertical ? 36 : 32,
          paddingHorizontal: vertical ? 12 : 16,
          paddingVertical: 6,
          alignItems: "center",
          justifyContent: vertical ? "flex-start" : "center",
          flexDirection: "row",
          gap: vertical ? 10 : 0,
          borderRadius: vertical ? theme.radius.md : theme.radius.full,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          numberOfLines={1}
          style={{
            // The tab only changes its text colour; the fill belongs to the
            // indicator so it can travel. `onAccent` rather than `text`,
            // because the pill underneath is the accent.
            color: active ? theme.color.onAccent : theme.color.muted,
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "500",
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

export interface TabsPanelProps {
  value: TabValue;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Panel({ value, children, style }: TabsPanelProps) {
  const theme = useTheme();
  const tabs = useTabs("Panel");
  if (tabs.value !== value) return null;

  const vertical = tabs.orientation === "vertical";

  // React Native has "tab" and "tablist" but no "tabpanel" role, so there is
  // nothing to put here. The panel is still reachable, it just does not
  // announce itself as the tab's panel. In the exceptions table.
  return (
    <View
      style={[
        vertical
          ? { flex: 1, minWidth: 0, paddingLeft: theme.space(4) }
          : { paddingTop: theme.space(3) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Kept so a call site copied from the web keeps working.
 *
 * The indicator is drawn by `List`, which is the only part that has measured
 * every tab. Rendering it here would mean measuring the list from inside one of
 * its children.
 */
function Indicator(): null {
  return null;
}

export const Tabs = Object.assign(Root, { List, Tab, Panel, Indicator });
export { Tab };
