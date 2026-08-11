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
 * No transition on the indicator: the common caller is a mic level updating
 * every animation frame, and easing a value that already changes 60 times a
 * second only makes it lag behind the sound.
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
        <BaseMeter.Indicator
          className={cn(
            "h-full rounded-(--gryt-radius-full)",
            toneFill[tone]
          )}
        />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
