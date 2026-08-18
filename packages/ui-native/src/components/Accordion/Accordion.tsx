import { createContext, useContext, useState, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

type ItemValue = string | number;

interface AccordionContextValue {
  open: ItemValue[];
  toggle: (value: ItemValue) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<ItemValue | null>(null);

function useAccordion(part: string) {
  const value = useContext(AccordionContext);
  if (!value) throw new Error(`Accordion.${part} must be rendered inside Accordion.Root.`);
  return value;
}

function useItem(part: string) {
  const value = useContext(ItemContext);
  if (value === null) throw new Error(`Accordion.${part} must be rendered inside Accordion.Item.`);
  return value;
}

export interface AccordionRootProps {
  /** `single` closes the others when one opens. */
  type?: "single" | "multiple";
  value?: ItemValue[];
  defaultValue?: ItemValue[];
  onValueChange?: (value: ItemValue[]) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Root({
  type = "single",
  value: controlled,
  defaultValue = [],
  onValueChange,
  children,
  style,
}: AccordionRootProps) {
  const [uncontrolled, setUncontrolled] = useState<ItemValue[]>(defaultValue);
  const open = controlled ?? uncontrolled;

  const toggle = (item: ItemValue) => {
    const isOpen = open.includes(item);
    const next = isOpen
      ? open.filter((v) => v !== item)
      : type === "single"
        ? [item]
        : [...open, item];
    if (controlled === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <AccordionContext.Provider value={{ open, toggle }}>
      <View style={style}>{children}</View>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  value: ItemValue;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Item({ value, children, style }: AccordionItemProps) {
  const theme = useTheme();
  return (
    <ItemContext.Provider value={value}>
      <View
        style={[
          { borderBottomWidth: 1, borderBottomColor: theme.color.border },
          style,
        ]}
      >
        {children}
      </View>
    </ItemContext.Provider>
  );
}

function Trigger({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const { open, toggle } = useAccordion("Trigger");
  const value = useItem("Trigger");
  const isOpen = open.includes(value);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      onPress={() => toggle(value)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.space(3),
          paddingVertical: theme.space(3.5),
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={{ color: theme.color.text, fontSize: 15, fontWeight: "500", flex: 1 }}>
          {children}
        </Text>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
      {/* Rotating a glyph needs a transform and a measurement; two glyphs do
          not. Same reasoning as the checkbox tick. */}
      <Text style={{ color: theme.color.muted, fontSize: 11 }}>{isOpen ? "▾" : "▸"}</Text>
    </Pressable>
  );
}

function Panel({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const { open } = useAccordion("Panel");
  const value = useItem("Panel");
  if (!open.includes(value)) return null;
  return <View style={[{ paddingBottom: theme.space(3.5) }, style]}>{children}</View>;
}

export const Accordion = { Root, Item, Trigger, Panel };
