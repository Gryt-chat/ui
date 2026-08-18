import { createContext, useContext, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

type TabValue = string | number;

interface TabsContextValue {
  value: TabValue | null;
  setValue: (value: TabValue) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string) {
  const value = useContext(TabsContext);
  if (!value) throw new Error(`Tabs.${part} must be rendered inside Tabs.`);
  return value;
}

export interface TabsProps {
  value?: TabValue;
  defaultValue?: TabValue;
  onValueChange?: (value: TabValue) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Root({
  value: controlled,
  defaultValue,
  onValueChange,
  children,
  style,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState<TabValue | null>(defaultValue ?? null);
  const value = controlled ?? uncontrolled;
  return (
    <TabsContext.Provider
      value={{
        value,
        setValue: (next) => {
          if (controlled === undefined) setUncontrolled(next);
          onValueChange?.(next);
        },
      }}
    >
      <View style={style}>{children}</View>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children?: ReactNode;
  /** Tabs that do not fit scroll sideways rather than wrapping or shrinking. */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

function List({ children, scrollable = true, style }: TabsListProps) {
  const theme = useTheme();
  const row = (
    <View
      accessibilityRole="tablist"
      style={[
        {
          flexDirection: "row",
          gap: theme.space(1),
          borderBottomWidth: 1,
          borderBottomColor: theme.color.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!scrollable) return row;
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

/**
 * The underline is drawn by the tab, not by a separate indicator.
 *
 * `@gryt/ui` has a `Tabs.Indicator` that Base UI slides between tabs, measured
 * against the active one. Sliding it here means measuring every tab and
 * animating between them, which is real work for a decoration. Each tab draws
 * its own bottom border instead: it appears rather than slides.
 *
 * `Indicator` is still exported, as a no-op, so call sites match.
 */
function Tab({ value, children, disabled, style }: TabProps) {
  const theme = useTheme();
  const tabs = useTabs("Tab");
  const active = tabs.value === value;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => tabs.setValue(value)}
      style={[
        {
          paddingHorizontal: theme.space(4),
          paddingVertical: theme.space(3),
          borderBottomWidth: 2,
          borderBottomColor: active ? theme.color.accent : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={{
            color: active ? theme.color.text : theme.color.muted,
            fontSize: 14,
            fontWeight: active ? "600" : "500",
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
  const tabs = useTabs("Panel");
  if (tabs.value !== value) return null;
  // React Native has "tab" and "tablist" but no "tabpanel" role, so there is
  // nothing to put here. The panel is still reachable, it just does not announce
  // itself as the tab's panel. In the exceptions table.
  return <View style={style}>{children}</View>;
}

/** See Tab: the underline belongs to the tab here. Kept so call sites match. */
function Indicator(): null {
  return null;
}

export const Tabs = Object.assign(Root, { List, Tab, Panel, Indicator });
export { Tab };
