import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { useTheme } from "../../theme";

/**
 * A bottom sheet, which is the phone's modal.
 *
 * `@gryt/ui` has no counterpart, and that is deliberate rather than an
 * oversight to be corrected later. A sheet is what a phone does where the web
 * opens a dialog or slides a drawer, and the two are not the same interaction:
 * a sheet is dragged, it settles at heights the user chooses, and dismissing it
 * is a flick rather than a click on an X. Shipping the web's Dialog on a phone
 * would be 1:1 and wrong; inventing a sheet on the web would be worse. So this
 * is an addition, and it is in the parity exceptions table as one.
 *
 * Built on `@gorhom/bottom-sheet` rather than by hand, which is the opposite of
 * the call made for Slider and Tabs, and the reason is the shape of the
 * problem. Those were shallow and Gryt-specific — a press scale is four lines
 * and no library will give you the right one. A sheet is deep and generic:
 * velocity-based dismiss, snap points, keyboard avoidance, a backdrop whose
 * opacity tracks the drag, and the handoff between dragging the sheet and
 * scrolling the content inside it. None of that is about Gryt and all of it is
 * months of edge cases.
 *
 * The library supplies behaviour only. Every colour, radius and dimension below
 * comes from the theme.
 */

interface SheetContextValue {
  open: () => void;
  close: () => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheet(part: string) {
  const value = useContext(SheetContext);
  if (!value) throw new Error(`Sheet.${part} must be rendered inside Sheet.`);
  return value;
}

export interface SheetProps {
  /**
   * Heights the sheet settles at, as percentages or points.
   *
   * The web has no equivalent concept — a dialog is one size — which is part of
   * why this is its own component rather than a Drawer with a prop.
   */
  snapPoints?: (string | number)[];
  /** Starts open. Uncontrolled; use the Trigger for the usual case. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function Root({
  snapPoints = ["50%"],
  defaultOpen = false,
  onOpenChange,
  children,
}: SheetProps) {
  const ref = useRef<BottomSheet>(null);
  const [mounted, setMounted] = useState(defaultOpen);

  const open = useCallback(() => {
    setMounted(true);
    // Expanding on the next tick rather than immediately: the sheet has to
    // exist before it can be told to move, and on first open it does not yet.
    requestAnimationFrame(() => ref.current?.snapToIndex(0));
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  const context = useMemo<SheetContextValue>(() => ({ open, close }), [open, close]);

  return (
    <SheetContext.Provider value={context}>
      <SheetRefContext.Provider value={{ ref, mounted, setMounted, snapPoints, onOpenChange }}>
        {children}
      </SheetRefContext.Provider>
    </SheetContext.Provider>
  );
}

interface SheetRefValue {
  ref: React.RefObject<BottomSheet | null>;
  mounted: boolean;
  setMounted: (mounted: boolean) => void;
  snapPoints: (string | number)[];
  onOpenChange?: (open: boolean) => void;
}

const SheetRefContext = createContext<SheetRefValue | null>(null);

export interface SheetTriggerProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A Pressable, like every other trigger in this package — which means its
 * children have to be plain visual content. Nesting a Button inside one gives
 * the inner pressable the touch and the sheet never opens, silently. Same
 * footgun the overlay triggers already carry.
 */
function Trigger({ children, style }: SheetTriggerProps) {
  const sheet = useSheet("Trigger");
  return (
    <Pressable onPress={sheet.open} style={style}>
      {children}
    </Pressable>
  );
}

export interface SheetContentProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Content({ children, style }: SheetContentProps) {
  const theme = useTheme();
  const state = useContext(SheetRefContext);
  if (!state) throw new Error("Sheet.Content must be rendered inside Sheet.");

  const { ref, mounted, setMounted, snapPoints, onOpenChange } = state;

  // Unmounted while closed rather than kept at index -1. A sheet that is not
  // open should not be holding a backdrop over the screen, and gorhom's own
  // examples differ on this — keeping it mounted is what makes a closed sheet
  // eat taps.
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        // Tracks the drag, so dragging the sheet down lightens the scrim
        // rather than holding full opacity until it snaps shut.
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  if (!mounted) return null;

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={() => {
        setMounted(false);
        onOpenChange?.(false);
      }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.color.surface,
        // Corners on the top two only. A sheet is anchored to the bottom edge
        // and rounding all four would float it, which is a different component.
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.color.border,
        width: 36,
        height: 4,
      }}
      style={{
        // gorhom draws no shadow, and without a border the sheet's top edge
        // vanishes against a dark backdrop at low opacity.
        borderTopWidth: 1,
        borderColor: theme.color.border,
      }}
    >
      <BottomSheetView style={[{ flex: 1, padding: theme.space(4) }, style]}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}

export interface SheetCloseProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Close({ children, style }: SheetCloseProps) {
  const sheet = useSheet("Close");
  return (
    <Pressable onPress={sheet.close} style={style}>
      {children}
    </Pressable>
  );
}

export interface SheetTitleProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Title({ children, style }: SheetTitleProps) {
  const theme = useTheme();
  return (
    <View style={style}>
      <Text
        accessibilityRole="header"
        style={{
          color: theme.color.text,
          fontSize: 18,
          fontWeight: "600",
          marginBottom: theme.space(2),
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export const Sheet = Object.assign(Root, { Trigger, Content, Close, Title });
