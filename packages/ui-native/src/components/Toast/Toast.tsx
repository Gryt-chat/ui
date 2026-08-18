import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../theme";

export type ToastSeverity = "info" | "success" | "warning" | "error";

export interface ToastOptions {
  title?: string;
  description?: string;
  severity?: ToastSeverity;
  /** Milliseconds. Null keeps it up until it is dismissed. */
  duration?: number | null;
}

interface QueuedToast extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  show: (toast: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toasts need somewhere to live, which on the web is a portal at the document
 * root and here is a provider near the top of the tree.
 *
 * They are deliberately not built on `Modal` like the dialogs are. A modal
 * intercepts touches for the whole screen, and a toast that blocked the app
 * until it faded would be worse than no toast.
 */
export function ToastProvider({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast: ToastOptions) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...toast, id }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <Viewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside a <ToastProvider>.");
  return value;
}

const RAMP: Record<ToastSeverity, "accent" | "success" | "warning" | "danger"> = {
  info: "accent",
  success: "success",
  warning: "warning",
  error: "danger",
};

function Viewport({
  toasts,
  onDismiss,
}: {
  toasts: QueuedToast[];
  onDismiss: (id: number) => void;
}) {
  const theme = useTheme();
  if (toasts.length === 0) return null;

  return (
    <View
      // Only the toasts take touches; the gaps between them do not.
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: theme.space(6),
        paddingHorizontal: theme.space(4),
        gap: theme.space(2),
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: QueuedToast;
  onDismiss: (id: number) => void;
}) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(reducedMotion ? 1 : 0));
  const ramp = theme.scales[RAMP[toast.severity ?? "info"]];
  const duration = toast.duration === undefined ? 4000 : toast.duration;

  useEffect(() => {
    if (!reducedMotion) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    if (duration === null) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss, opacity, reducedMotion, toast.id]);

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion={
          toast.severity === "error" || toast.severity === "warning" ? "assertive" : "polite"
        }
        onPress={() => onDismiss(toast.id)}
        style={{
          backgroundColor: theme.color.surfaceRaised,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderLeftWidth: 3,
          borderColor: theme.color.border,
          borderLeftColor: ramp[8],
          padding: theme.space(3),
          gap: theme.space(0.5),
        }}
      >
        {toast.title ? (
          <Text style={{ color: theme.color.text, fontSize: 14, fontWeight: "600" }}>
            {toast.title}
          </Text>
        ) : null}
        {toast.description ? (
          <Text style={{ color: theme.color.muted, fontSize: 13, lineHeight: 18 }}>
            {toast.description}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export interface ToastProps {
  style?: StyleProp<ViewStyle>;
}
