import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { createContext, forwardRef, useContext } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";
import { useMediaQuery } from "../utils/useMediaQuery";

export type DrawerSide = "left" | "right" | "top" | "bottom";

/**
 * A panel pinned to an edge of the screen, and a sheet on small screens.
 *
 * Built on Base UI's `drawer` rather than on `dialog`, which is what this used
 * to be. A dialog pinned to an edge looks like a drawer and does none of what
 * one is for: it cannot be dragged away, it does not follow the finger, and it
 * does not know which edge it belongs to. The primitive brings swipe-to-dismiss,
 * snap points and nested stacking, and it drives the drag through CSS variables
 * so the panel tracks the pointer without a re-render per frame.
 *
 * `side` lives on Root, not on Popup as it used to. It has to: the swipe
 * direction is Root's business, and Viewport and Popup both need to agree with
 * it. Callers passing `side` to Popup will need to move it up one level.
 */

/** Which way you drag to dismiss, per edge. */
const swipeBySide = {
  left: "left",
  right: "right",
  top: "up",
  bottom: "down"
} as const;

const SideContext = createContext<DrawerSide>("right");

/** Where the panel sits inside the viewport. */
const viewportBySide: Record<DrawerSide, string> = {
  left: "items-stretch justify-start",
  right: "items-stretch justify-end",
  top: "items-start justify-center",
  bottom: "items-end justify-center"
};

/**
 * Corners are rounded on the edges away from the origin only.
 *
 * A sheet coming up from the bottom is still attached to the bottom of the
 * screen, so rounding its bottom corners would float it off an edge it has not
 * left. Rounding the leading edge alone is what makes it read as attached.
 */
const radiusBySide: Record<DrawerSide, string> = {
  left: "rounded-r-(--gryt-radius-xl)",
  right: "rounded-l-(--gryt-radius-xl)",
  top: "rounded-b-(--gryt-radius-xl)",
  bottom: "rounded-t-(--gryt-radius-xl)"
};

/**
 * Size, the overhang, and the off-screen resting transform.
 *
 * The panel runs --gryt-drawer-bleed past its edge and hangs that much
 * off-screen, with matching padding so content sits where it would have. The
 * spring settles onto its target from both directions, and without the overhang
 * a fractional undershoot shows a seam of backdrop down the edge.
 */
const popupBySide: Record<DrawerSide, string> = {
  left: [
    "h-full w-[calc(20rem+var(--gryt-drawer-bleed))] max-w-[calc(85vw+var(--gryt-drawer-bleed))]",
    "-ml-(--gryt-drawer-bleed) border-r py-5 pr-5 pl-[calc(1.25rem+var(--gryt-drawer-bleed))]",
    "[transform:translateX(var(--drawer-swipe-movement-x))]",
    "data-starting-style:[transform:translateX(calc(-100%+var(--gryt-drawer-bleed)))]",
    "data-ending-style:[transform:translateX(calc(-100%+var(--gryt-drawer-bleed)))]"
  ].join(" "),
  right: [
    "h-full w-[calc(20rem+var(--gryt-drawer-bleed))] max-w-[calc(85vw+var(--gryt-drawer-bleed))]",
    "-mr-(--gryt-drawer-bleed) border-l py-5 pl-5 pr-[calc(1.25rem+var(--gryt-drawer-bleed))]",
    "[transform:translateX(var(--drawer-swipe-movement-x))]",
    "data-starting-style:[transform:translateX(calc(100%-var(--gryt-drawer-bleed)))]",
    "data-ending-style:[transform:translateX(calc(100%-var(--gryt-drawer-bleed)))]"
  ].join(" "),
  top: [
    "w-full max-h-[calc(85vh+var(--gryt-drawer-bleed))]",
    "-mt-(--gryt-drawer-bleed) border-b px-5 pb-5 pt-[calc(1.25rem+var(--gryt-drawer-bleed))]",
    "[transform:translateY(var(--drawer-swipe-movement-y))]",
    "data-starting-style:[transform:translateY(calc(-100%+var(--gryt-drawer-bleed)))]",
    "data-ending-style:[transform:translateY(calc(-100%+var(--gryt-drawer-bleed)))]"
  ].join(" "),
  bottom: [
    "w-full max-h-[calc(85vh+var(--gryt-drawer-bleed))]",
    "-mb-(--gryt-drawer-bleed) border-t px-5 pt-5 pb-[calc(1.25rem+var(--gryt-drawer-bleed))]",
    "[transform:translateY(var(--drawer-swipe-movement-y))]",
    "data-starting-style:[transform:translateY(calc(100%-var(--gryt-drawer-bleed)))]",
    "data-ending-style:[transform:translateY(calc(100%-var(--gryt-drawer-bleed)))]"
  ].join(" ")
};

export interface DrawerRootProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseDrawer.Root>,
    "swipeDirection"
  > {
  /** Edge the panel is pinned to. Ignored on small screens unless sheetOnMobile is false. */
  side?: DrawerSide;
  /**
   * Become a bottom sheet under 768px.
   *
   * A side panel is a desktop shape. On a phone it eats the width the content
   * needs and puts the drag gesture on the axis the browser uses for back
   * navigation. Set false to keep `side` at every width.
   */
  sheetOnMobile?: boolean;
  children?: ReactNode;
}

function Root({
  side = "right",
  sheetOnMobile = true,
  children,
  ...props
}: DrawerRootProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const resolved: DrawerSide = sheetOnMobile && isMobile ? "bottom" : side;

  return (
    <SideContext.Provider value={resolved}>
      <BaseDrawer.Root swipeDirection={swipeBySide[resolved]} {...props}>
        {children}
      </BaseDrawer.Root>
    </SideContext.Provider>
  );
}

export type DrawerViewportProps = ComponentPropsWithoutRef<
  typeof BaseDrawer.Viewport
>;

const Viewport = forwardRef<HTMLDivElement, DrawerViewportProps>(
  function DrawerViewport({ className, ...props }, ref) {
    const side = useContext(SideContext);
    return (
      <BaseDrawer.Viewport
        ref={ref}
        className={cn(
          // z-50 matters: the popup is no longer positioned itself, so the
          // viewport is what has to sit above the page. Without it a sticky
          // site header renders over the panel.
          "gryt-drawer-viewport fixed inset-0 z-50 flex",
          viewportBySide[side],
          className
        )}
        {...props}
      />
    );
  }
);

export type DrawerPopupProps = ComponentPropsWithoutRef<
  typeof BaseDrawer.Popup
>;

const Popup = forwardRef<HTMLDivElement, DrawerPopupProps>(function DrawerPopup(
  { className, ...props },
  ref
) {
  const side = useContext(SideContext);
  return (
    <BaseDrawer.Popup
      ref={ref}
      className={cn(
        "gryt-drawer flex flex-col gap-4 border-gryt-border bg-gryt-surface text-gryt-text",
        "overflow-y-auto overscroll-contain outline-none",
        "transition-transform duration-(--gryt-dur-spring-soft) ease-spring",
        // While the finger is down the panel must track it exactly. Any
        // duration here turns a drag into a drag plus lag.
        "data-swiping:duration-0 data-swiping:select-none",
        "motion-reduce:transition-none",
        popupBySide[side],
        radiusBySide[side],
        className
      )}
      {...props}
    />
  );
});

const Backdrop = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseDrawer.Backdrop>
>(function DrawerBackdrop({ className, ...props }, ref) {
  return (
    <BaseDrawer.Backdrop
      ref={ref}
      className={cn(
        "gryt-drawer-backdrop fixed inset-0 z-50 min-h-dvh bg-black/60",
        "backdrop-blur-(--gryt-backdrop-blur)",
        // Lightens as the panel is dragged away, so letting go halfway does not
        // leave a full-strength scrim over a half-gone sheet.
        "[opacity:calc(1-var(--drawer-swipe-progress,0))]",
        "transition-opacity duration-(--gryt-dur-spring-soft) ease-spring",
        "data-swiping:duration-0",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
});

export interface DrawerGrabberProps {
  className?: string;
}

/**
 * The bar people expect to drag on a sheet.
 *
 * Rendered only for the top and bottom edges: on a left or right panel it would
 * be pointing the wrong way, and a horizontal drawer is a desktop shape where
 * nobody reaches for a grab bar anyway. Decorative — the whole popup is
 * draggable, so this is a hint, not the control.
 */
function Grabber({ className }: DrawerGrabberProps) {
  const side = useContext(SideContext);
  if (side !== "bottom" && side !== "top") return null;

  return (
    <div
      aria-hidden
      className={cn(
        "gryt-drawer-grabber mx-auto h-1.5 w-10 shrink-0 rounded-(--gryt-radius-full) bg-gryt-border",
        side === "top" && "order-last",
        className
      )}
    />
  );
}

export const Drawer = {
  Root,
  Trigger: BaseDrawer.Trigger,
  Portal: BaseDrawer.Portal,
  Backdrop,
  Viewport,
  Popup,
  Content: BaseDrawer.Content,
  Grabber,
  Close: BaseDrawer.Close,
  Title: BaseDrawer.Title,
  Description: BaseDrawer.Description
};
