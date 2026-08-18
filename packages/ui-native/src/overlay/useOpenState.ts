import { useCallback, useState } from "react";

/**
 * Controlled or uncontrolled open state, matching Base UI's props.
 *
 * `open` with `onOpenChange` drives it from outside; `defaultOpen` alone lets it
 * manage itself. Base UI takes both and so does everything here, so a call site
 * moving between the two libraries does not change shape.
 */
export interface OpenStateProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useOpenState({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
}: OpenStateProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlled !== undefined;
  const open = isControlled ? controlled : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return { open, setOpen };
}
