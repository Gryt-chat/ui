import { Button } from "@gryt/ui";
import { Check, Warning, X } from "@phosphor-icons/react";
import type { ContrastCheck } from "../../lib/theme/contrast";

export interface ContrastReportProps {
  checks: ContrastCheck[];
  /** Absent when nothing is failing. */
  onRepair?: () => void;
}

const ICONS = {
  pass: Check,
  tight: Warning,
  fail: X
};

const TONES = {
  pass: "text-gryt-success-11",
  tight: "text-gryt-warning-11",
  fail: "text-gryt-danger-11"
};

/**
 * What the library's own tests would say about this theme.
 *
 * Ratios rather than a verdict, because "3.9 against 4.5" tells somebody how
 * far off they are and "fails" does not. The repair only moves the colours
 * whose job is to be read — it will not quietly redesign an accent somebody
 * chose on purpose.
 */
export function ContrastReport({ checks, onRepair }: ContrastReportProps) {
  const failures = checks.filter(
    (item) => !item.advisory && item.level === "fail"
  ).length;

  return (
    <section className="min-w-0">
      <header className="flex items-center justify-between gap-2 pb-2">
        <h2 className="m-0 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
          Contrast
        </h2>
        {failures > 0 ? (
          <span className="text-xs text-gryt-danger-11">
            {failures} of {checks.length}
          </span>
        ) : (
          <span className="text-xs text-gryt-muted">
            {checks.length} checks pass
          </span>
        )}
      </header>

      <ul className="m-0 list-none space-y-1 p-0">
        {checks.map((item) => {
          const state = item.advisory && item.level === "fail" ? "tight" : item.level;
          const Icon = ICONS[state];
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <Icon aria-hidden="true" className={TONES[state]} size={12} />
                <span className="truncate text-gryt-muted">{item.label}</span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-gryt-muted">
                <span className={state === "pass" ? "text-gryt-text" : TONES[state]}>
                  {item.ratio.toFixed(1)}
                </span>
                <span aria-hidden="true"> / {item.min}</span>
                <span className="sr-only"> against a minimum of {item.min}</span>
                {/* AAA is not the bar any of these have to clear, so it is a
                    note rather than a verdict. Worth showing because it is the
                    difference people ask about. */}
                {!item.advisory && item.ratio >= 7 ? (
                  <span className="pl-1.5 text-[10px] text-gryt-success-11">AAA</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>

      {onRepair ? (
        <div className="pt-3">
          <Button onClick={onRepair} size="small" tone="neutral">
            Fix the text colours
          </Button>
        </div>
      ) : null}
    </section>
  );
}
