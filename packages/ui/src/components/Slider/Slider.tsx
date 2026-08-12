import { Slider as BaseSlider } from "@base-ui/react/slider";
import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "../utils/cn";
import { focusRingWithin, toneBg } from "../utils/styles";
import type { Tone } from "../utils/styles";

export interface SliderProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSlider.Root>, "className"> {
  tone?: Tone;
  className?: string;
  "aria-label"?: string;
}

/** How far the pointer has to move before a press counts as a drag. */
const DRAG_SLOP = 3;

/**
 * The travel is animated, on the spring.
 *
 * Two things about that are worth reading before changing it.
 *
 * It uses --ease-spring-tight rather than --ease-spring. The overshoot in the
 * standard spring is a percentage of the travel, which is texture on a control
 * that scales in place and a problem on one whose travel is its own width: a
 * full-track jump measured 110% along a 919px track, putting the thumb 96px
 * outside the slider before it came back. The thumb still scales on the
 * standard spring, where the overshoot belongs.
 *
 * And it animates on a click or an arrow key but not under a dragging pointer,
 * where a transition means the thumb lags behind the cursor. Base UI's
 * data-dragging is not the right signal for that: it appears on pointerdown,
 * which is also how you click the track, so keying off it would kill the
 * animation for the most common interaction there is. What matters is whether
 * the pointer has actually moved, so that is what is tracked here — with a few
 * pixels of slop, because a mouse rarely stays perfectly still through a click.
 */
export function Slider({
  className,
  tone = "primary",
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  const [dragging, setDragging] = useState(false);
  const origin = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!dragging && origin.current === null) {
      return;
    }

    // On window rather than the control: the pointer is very often released
    // outside a 6px-tall track, and a pointerup we never hear about leaves the
    // slider stuck in its dragging state with the animation off for good.
    const end = () => {
      origin.current = null;
      setDragging(false);
    };

    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);

    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    origin.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = origin.current;
    if (start === null || dragging) {
      return;
    }

    const moved =
      Math.abs(event.clientX - start.x) > DRAG_SLOP ||
      Math.abs(event.clientY - start.y) > DRAG_SLOP;

    if (moved) {
      setDragging(true);
    }
  }

  // Base UI positions the thumb with inset-inline-start and sizes the fill with
  // width, so those are the properties that move. `translate` stays out of it:
  // that holds the -50% centring offset, and animating it would drift the thumb
  // off the track rather than along it.
  const travel = dragging
    ? "transition-none"
    : "duration-(--gryt-dur-spring) ease-spring-tight motion-reduce:transition-none";

  return (
    <BaseSlider.Root className={cn("gryt-slider w-full", className)} {...props}>
      <BaseSlider.Control
        className="flex w-full touch-none items-center py-2 select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <BaseSlider.Track className="h-1.5 w-full rounded-(--gryt-radius-full) bg-gryt-surface-raised select-none">
          <BaseSlider.Indicator
            className={cn(
              "h-full rounded-(--gryt-radius-full) select-none",
              "transition-[width]",
              travel,
              toneBg[tone]
            )}
          />
          {/* Two elements because they animate on two curves, and one element
              gets one timing function. The thumb travels on the tight spring;
              the dot inside it scales on the standard one, so the press still
              has the overshoot every other control here has. */}
          <BaseSlider.Thumb
            aria-label={ariaLabel}
            className={cn(
              "group h-4 w-4 rounded-(--gryt-radius-full) select-none",
              "transition-[inset-inline-start]",
              travel,
              // The ring goes on the thumb but the focus lands on the visually
              // hidden input inside it, so this has to match a descendant.
              // Without it the slider is the one control here you cannot see
              // yourself tab to.
              focusRingWithin
            )}
          >
            <span
              className={cn(
                "block h-full w-full rounded-(--gryt-radius-full) bg-gryt-text",
                "transition-[scale] duration-(--gryt-dur-spring) ease-spring",
                "motion-safe:group-hover:scale-[1.12] motion-safe:group-active:scale-[0.94]",
                "motion-reduce:transition-none"
              )}
            />
          </BaseSlider.Thumb>
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
