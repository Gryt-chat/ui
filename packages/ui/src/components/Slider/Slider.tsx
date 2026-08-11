import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { focusRing, toneBg } from "../utils/styles";
import type { Tone } from "../utils/styles";

export interface SliderProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSlider.Root>, "className"> {
  tone?: Tone;
  className?: string;
  "aria-label"?: string;
}

export function Slider({
  className,
  tone = "primary",
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  return (
    <BaseSlider.Root
      className={cn("gryt-slider w-full", className)}
      {...props}
    >
      <BaseSlider.Control className="flex w-full touch-none items-center py-2 select-none">
        <BaseSlider.Track className="h-1.5 w-full rounded-(--gryt-radius-full) bg-gryt-surface-raised select-none">
          <BaseSlider.Indicator
            className={cn(
              "h-full rounded-(--gryt-radius-full) select-none",
              toneBg[tone]
            )}
          />
          <BaseSlider.Thumb
            aria-label={ariaLabel}
            className={cn(
              "h-4 w-4 rounded-(--gryt-radius-full) bg-gryt-text select-none",
              "transition-transform duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
              "motion-safe:hover:scale-[1.14] motion-safe:active:scale-[0.95]",
              focusRing
            )}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
