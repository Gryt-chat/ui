import { createContext, useContext, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";
import { useTheme } from "../../theme";

/**
 * The same shape as `@gryt/ui`'s Dialog: Root, Trigger, Portal, Backdrop, Popup,
 * Title, Description, Footer, Close. A call site should read the same on both.
 *
 * What differs is underneath. Base UI builds the trap, the dismiss behaviour and
 * the ARIA wiring itself; here React Native's `Modal` supplies most of it, and
 * the parts it does not are listed in the README.
 */

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog(part: string): DialogContextValue {
  const value = useContext(DialogContext);
  if (!value) {
    throw new Error(`Dialog.${part} must be rendered inside Dialog.Root.`);
  }
  return value;
}

export interface DialogRootProps extends OpenStateProps {
  children?: ReactNode;
}

function Root({ children, ...openProps }: DialogRootProps) {
  const state = useOpenState(openProps);
  return (
    <DialogContext.Provider value={state}>{children}</DialogContext.Provider>
  );
}

export interface DialogTriggerProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Trigger({ children, style }: DialogTriggerProps) {
  const { setOpen } = useDialog("Trigger");
  return (
    <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={style}>
      {children}
    </Pressable>
  );
}

/**
 * A passthrough.
 *
 * On the web a portal is how the popup escapes overflow and stacking contexts.
 * React Native's `Modal` already renders above everything, so there is nothing
 * to escape. It exists so call sites keep the same shape.
 */
function Portal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export interface DialogPopupProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  dismissible?: boolean;
  /** Long content scrolls rather than growing past the screen. */
  scrollable?: boolean;
}

function Popup({
  children,
  style,
  dismissible = true,
  scrollable = true,
}: DialogPopupProps) {
  const { open, setOpen } = useDialog("Popup");
  const theme = useTheme();

  const body = (
    <View
      // iOS hides everything behind a modal from VoiceOver with this; Android
      // gets the same effect from Modal itself.
      accessibilityViewIsModal
      style={[
        {
          width: "100%",
          maxWidth: 480,
          maxHeight: "80%",
          backgroundColor: theme.color.surfaceRaised,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.color.border,
          padding: theme.space(5),
          gap: theme.space(3),
        },
        style,
      ]}
    >
      {scrollable ? (
        <ScrollView contentContainerStyle={{ gap: theme.space(3) }}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      // Android's hardware back button, which is the closest thing a phone has
      // to the Escape key Base UI listens for. AlertDialog turns it off for the
      // same reason it turns off the scrim: neither is an answer.
      onRequestClose={dismissible ? () => setOpen(false) : undefined}
    >
      <Pressable
        // The scrim doubles as the outside-press target, which is how Base UI
        // dismisses too.
        onPress={dismissible ? () => setOpen(false) : undefined}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.space(5),
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        {/* Swallows presses so tapping the panel does not close it. */}
        <Pressable onPress={() => {}} style={{ width: "100%", alignItems: "center" }}>
          {body}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Not rendered.
 *
 * The scrim is drawn by Popup, because React Native's Modal owns that layer and
 * a separate backdrop element would have nothing to render into. Kept so call
 * sites written against `@gryt/ui` do not have to drop a line.
 */
function Backdrop(): null {
  return null;
}

function Title({ children, style }: { children?: ReactNode; style?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[{ color: theme.color.text, fontSize: 18, fontWeight: "600" }, style]}
    >
      {children}
    </Text>
  );
}

function Description({ children, style }: { children?: ReactNode; style?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  return (
    <Text style={[{ color: theme.color.muted, fontSize: 14, lineHeight: 20 }, style]}>
      {children}
    </Text>
  );
}

function Footer({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[
        { flexDirection: "row", justifyContent: "flex-end", gap: theme.space(3) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Close({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { setOpen } = useDialog("Close");
  return (
    <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={style}>
      {children}
    </Pressable>
  );
}

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Popup,
  Title,
  Description,
  Footer,
  Close,
};
