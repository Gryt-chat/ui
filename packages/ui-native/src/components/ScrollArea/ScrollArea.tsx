import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ScrollView, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";

import { DragLockContext, type DragLock } from "../internal/dragLock";

export interface ScrollAreaProps extends Omit<ScrollViewProps, "style"> {
  children?: ReactNode;
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * A thin pass over ScrollView.
 *
 * The web's ScrollArea exists to replace scrollbars the browser draws badly and
 * inconsistently. A phone has no scrollbars to replace: the indicator is drawn
 * by the OS, it fades on its own, and it already matches everything else on the
 * device. So the component stays for call-site parity and does almost nothing,
 * which is the honest version.
 *
 * Its one job was defaulting the indicator off, since the web version hides the
 * native scrollbar too. It has a second now: it publishes a drag lock, so a
 * control inside it can hold it still while it is being dragged. See
 * internal/dragLock — a Slider is unusable in a scrolling screen without it.
 */
export function ScrollArea({
  children,
  horizontal = false,
  style,
  contentStyle,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  scrollEnabled,
  ...rest
}: ScrollAreaProps) {
  const [locks, setLocks] = useState(0);

  // Counted rather than a boolean. Two controls can overlap in principle — a
  // drag interrupted by a second one starting — and the first to finish would
  // otherwise unlock the list while the second is still going.
  const lock = useCallback(() => setLocks((n) => n + 1), []);
  const unlock = useCallback(() => setLocks((n) => Math.max(0, n - 1)), []);

  const dragLock = useMemo<DragLock>(
    () => ({ locked: locks > 0, lock, unlock }),
    [locks, lock, unlock],
  );

  return (
    <DragLockContext.Provider value={dragLock}>
      <ScrollView
        horizontal={horizontal}
        style={style}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        // Only overridden while something is actually dragging, so a caller
        // that passes `scrollEnabled={false}` still gets a list that never
        // scrolls.
        scrollEnabled={scrollEnabled === false ? false : locks === 0}
        {...rest}
      >
        {children}
      </ScrollView>
    </DragLockContext.Provider>
  );
}
