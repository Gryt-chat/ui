import { Meter as BaseMeter } from "@base-ui/react/meter";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";

export type MeterTone = "primary" | "success" | "warning" | "danger";

const toneFill: Record<MeterTone, string> = {
  primary: "bg-gryt-accent",
  success: "bg-gryt-success",
  warning: "bg-gryt-warning",
  danger: "bg-gryt-danger"
};

export interface MeterProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseMeter.Root>,
    "className" | "value"
  > {
  value: number;
  label?: ReactNode;
  /** Show the formatted value at the end of the label row. */
  showValue?: boolean;
  tone?: MeterTone;
  className?: string;
}

/**
 * A measurement inside a known range — mic input level, disk used, how full a
 * server is.
 *
 * Deliberately not Progress. Progress says "this task is 40% done and heading
 * for 100%"; a meter says "this is the reading right now", and a reading at
 * 100% is often the bad case rather than the finished one. They also announce
 * differently to a screen reader, which is the part that actually matters.
 *
 * The indicator moves rather than snapping, but only just — 120ms and ease-out,
 * no spring. This used to have no transition at all, on the grounds that the
 * common caller is a mic level updating every animation frame and easing a
 * value that changes 60 times a second only makes it lag behind the sound.
 * That reasoning holds for the mic and nothing else: disk used, server
 * capacity, a level polled a few times a second all read as broken when they
 * teleport. 120ms is shorter than the gap between polls at 4Hz, so a fast feed
 * still lands on every value it is handed.
 */
export function Meter({
  className,
  value,
  label,
  showValue = false,
  tone = "primary",
  ...props
}: MeterProps) {
  return (
    <BaseMeter.Root
      value={value}
      className={cn("gryt-meter flex w-full flex-col gap-1.5", className)}
      {...props}
    >
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2">
          {label ? (
            <BaseMeter.Label className="text-sm text-gryt-muted">
              {label}
            </BaseMeter.Label>
          ) : (
            <span />
          )}
          {showValue && (
            <BaseMeter.Value className="font-mono text-xs text-gryt-muted tabular-nums" />
          )}
        </div>
      )}
      <BaseMeter.Track className="h-1.5 w-full overflow-hidden rounded-(--gryt-radius-full) bg-gryt-surface-raised">
        {/* Short and linear-ish, so the bar moves rather than snapping.
            The note above says no transition, and that was written for a mic
            level updating every frame — easing a value that changes 60 times a
            second only makes it lag. But most meters are not that: disk used,
            how full a server is, a level polled a few times a second, and those
            all read as broken when they teleport. 120ms is under the gap
            between polls at 4Hz, so a fast feed still lands on every value it
            is given; it just gets there over two frames instead of one. */}
        <BaseMeter.Indicator
          className={cn(
            "h-full rounded-(--gryt-radius-full)",
            "transition-[width] duration-120 ease-out motion-reduce:transition-none",
            toneFill[tone]
          )}
        />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
