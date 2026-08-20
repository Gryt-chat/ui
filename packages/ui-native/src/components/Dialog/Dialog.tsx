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
          // Shrinks inside the capped wrapper below rather than carrying its
          // own percentage, so the popup hugs short content and gives way when
          // the content is taller than the cap.
          flexShrink: 1,
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
        // flexGrow 0 so the ScrollView takes the height of its content rather
        // than filling the popup, and flexShrink 1 so it still gives way when
        // maxHeight caps it and the content has to scroll.
        //
        // Without these it clipped every short dialog: a ScrollView has no
        // intrinsic height, the popup sizes to its content, and neither had
        // anything to measure against — so the footer was drawn half off the
        // bottom. The `scrollable={false}` path was unaffected, which is what
        // made it look like a layout choice rather than a bug (GRYT-379).
        <ScrollView
          style={{ flexGrow: 0, flexShrink: 1 }}
          contentContainerStyle={{ gap: theme.space(3) }}
        >
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
        {/*
          A View that claims the touch, not a Pressable — and the difference is
          the whole of GRYT-383.

          This has to do two things at once: stop a tap on the panel reaching
          the scrim and dismissing it, while letting a drag reach the ScrollView
          inside. A `Pressable` does the first and prevents the second, because
          it sets `onResponderTerminationRequest: () => false` — once it has the
          touch it refuses to hand it over, so the ScrollView never gets the
          drag and a dialog taller than the cap could not be scrolled at all.

          `onStartShouldSetResponder` on a plain View is asked during the bubble
          phase, so children are offered the touch first. A ScrollView claims a
          drag and scrolls; a tap on empty space nobody wanted lands here, stops
          bubbling, and the scrim never sees it. Nothing is refused, so nothing
          is starved.

          Same approach `@rn-primitives/dialog` takes for the same reason: its
          `Content` is a `View` with `onStartShouldSetResponder` returning true,
          while its `Overlay` is the Pressable that closes.
        */}
        {/* The 80% cap lives here, not on the popup.
            A percentage maxHeight only resolves against a parent with a
            definite height. This wrapper had `alignItems` and a width and no
            height at all, so the popup's `maxHeight: "80%"` resolved against
            nothing and never constrained anything — which is why a short
            dialog clipped its footer while `scrollable={false}` looked fine.
            The scrim above is `flex: 1`, so a percentage here does resolve. */}
        <View
          onStartShouldSetResponder={claimTouch}
          style={{ width: "100%", alignItems: "center", maxHeight: "80%" }}
        >
          {body}
        </View>
      </Pressable>
    </Modal>
  );
}

/**
 * Claim a touch that no child wanted.
 *
 * Declared once rather than as an inline arrow, so every Dialog is not handing
 * the responder system a new function identity on every render.
 */
function claimTouch(): boolean {
  return true;
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
