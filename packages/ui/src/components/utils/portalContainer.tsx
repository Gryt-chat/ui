import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * Where an overlay should portal to, when it is inside something that has an
 * opinion about that (GRYT-242).
 *
 * Base UI portals a popup to `document.body`. For a page with one theme that is
 * exactly right — the popup wants the app's theme and reads it from `:root`.
 * It goes wrong in two places:
 *
 * - **Inside a modal.** A dropdown that renders as a sibling of the dialog
 *   rather than a child of it has to win a stacking contest against the
 *   dialog's own backdrop and popup, and does not reliably.
 * - **Inside a second theme.** Previewing a theme in a panel means the panel's
 *   colours are on a subtree, and a popup portalled to `document.body` comes up
 *   in the surrounding page's colours instead.
 *
 * `Select` already took a `portalContainer` prop for this, and a prop is the
 * wrong shape for it. Every call site has to know it is inside a dialog and
 * remember to thread the element down, so the ones that forget are broken and
 * nothing says so. That is not hypothetical: the client threaded it into two
 * tabs of its server settings and missed a third, which is how this came back.
 *
 * A dialog knows it is a dialog. It publishes its popup element here, and the
 * overlays inside it pick it up without being told.
 */
const PortalContainerContext = createContext<HTMLElement | null>(null);

export function PortalContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>
  );
}

/**
 * The container an overlay should use.
 *
 * An explicit prop wins, so a caller that knows better still can. `undefined`
 * means "nobody said", and falls through to the context; `null` is an answer,
 * and means the document body.
 */
export function usePortalContainer(
  explicit?: HTMLElement | null,
): HTMLElement | null {
  const inherited = useContext(PortalContainerContext);
  return explicit !== undefined ? explicit : inherited;
}

/**
 * Feed one element to a forwarded ref and a setter at once.
 *
 * A popup needs to both honour whatever ref its caller passed and keep the
 * element in state so it can be published. Nothing in the tree should have to
 * choose between the two.
 */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): (value: T | null) => void {
  return (value) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as React.MutableRefObject<T | null>).current = value;
    }
  };
}
