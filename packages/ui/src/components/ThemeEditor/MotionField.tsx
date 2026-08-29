import type { GrytBezier, GrytMotion, GrytMotionCurve } from "@gryt/theme";
import {
  GRYT_MOTION_SCALE_MAX,
  grytDurations,
  grytMotion,
  isBezier,
  springSamples,
  springTightSamples
} from "@gryt/theme";
import { useState } from "react";

import { Select } from "../Select/Select";
import { Slider } from "../Slider/Slider";
import { CurveEditor } from "./CurveEditor";

/* How Gryt moves, as two questions and a graph.
 *
 * How fast is one slider over every tier rather than one per tier. The tiers
 * are already in proportion — a drawer takes longer than a button because it
 * travels further — and five sliders would be re-deciding that relationship
 * with no way to tell it had gone wrong except by opening a drawer.
 *
 * What shape is three named curves and a bezier you can drag. The named ones
 * keep the library's two apart: the overshooting spring for things that grow
 * in place, the critically damped one for things that travel inside their
 * bounds. A bezier cannot be both, so drawing one collapses them — which the
 * panel says out loud, because a curve that overshoots is fine on a button and
 * throws a drawer outside its own container.
 */

const CUSTOM = "custom";
/* Somewhere to start dragging from. Roughly ease-out: most of the distance
   early, settling at the end, and no overshoot — so the first thing anybody
   sees is a curve that works rather than one that needs fixing. */
const CUSTOM_START: GrytBezier = [0.22, 1, 0.36, 1];

interface MotionFieldProps {
  motion: GrytMotion | null | undefined;
  onChange: (next: GrytMotion) => void;
}

export function MotionField({ motion, onChange }: MotionFieldProps) {
  const current = motion ?? grytMotion;
  /* The narrowed value rather than a boolean. `isBezier(x) ? … : …` on a
     separate line does not teach TypeScript anything about `current.curve`
     later in the function, and every use below needs it to know. */
  const bezier = isBezier(current.curve) ? current.curve : null;
  const [lastBezier, setLastBezier] = useState<GrytBezier>(
    bezier ?? CUSTOM_START
  );

  function setCurve(curve: GrytMotionCurve) {
    onChange({ ...current, curve });
  }

  const stopped = current.scale === 0;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="min-w-0">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-gryt-muted">Speed</span>
          <span className="font-mono text-[11px] text-gryt-muted">
            {stopped
              ? "off"
              : `${current.scale.toFixed(2)}× · ${Math.round(
                  grytDurations.spring * current.scale
                )}ms`}
          </span>
        </div>
        <Slider
          aria-label="Animation speed"
          max={GRYT_MOTION_SCALE_MAX}
          min={0}
          onValueChange={(next) =>
            onChange({ ...current, scale: Number(Number(next).toFixed(2)) })
          }
          step={0.05}
          value={current.scale}
        />
        <p className="m-0 pt-1 text-[11px] leading-4 text-gryt-muted">
          {stopped
            ? "Nothing animates. A real choice, not a broken one — some people find movement unpleasant."
            : "One multiplier over every tier, so a drawer stays slower than a button."}
        </p>
      </div>

      <div className="min-w-0">
        <Select
          label="Curve"
          onValueChange={(value) => {
            const next = String(value);
            if (next === CUSTOM) setCurve(lastBezier);
            else setCurve(next as GrytMotionCurve);
          }}
          options={[
            { label: "Spring — overshoots and settles", value: "spring" },
            { label: "Smooth — settles without passing", value: "smooth" },
            { label: "Linear — no easing at all", value: "linear" },
            { label: "Draw one…", value: CUSTOM }
          ]}
          size="small"
          value={bezier === null ? current.curve : CUSTOM}
        />
      </div>

      {bezier !== null ? (
        <div className="flex min-w-0 flex-col gap-1.5">
          <CurveEditor
            onChange={(next) => {
              setLastBezier(next);
              setCurve(next);
            }}
            reference={springSamples}
            value={bezier}
          />
          <p className="m-0 font-mono text-[11px] text-gryt-muted">
            cubic-bezier({bezier.join(", ")})
          </p>
          <p className="m-0 text-[11px] leading-4 text-gryt-muted">
            The faint line is the shipped spring, to compare against. Anything
            drawn above the box overshoots — fine on a button, and it throws a
            drawer outside its own edge, because one curve now does both jobs.
          </p>
        </div>
      ) : (
        <CurveEditor
          onChange={setCurve}
          samples={
            current.curve === "smooth"
              ? springTightSamples
              : current.curve === "linear"
                ? [0, 1]
                : springSamples
          }
          value={lastBezier}
        />
      )}

      {/* Something that actually moves. A curve is a shape until you watch it,
          and the difference between 0.9× and 1.1× is not visible in a number.
          Keyed on the settings so it restarts whenever they change. */}
      <div className="min-w-0">
        <span className="text-xs font-medium text-gryt-muted">Preview</span>
        <div className="mt-1 overflow-hidden rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-surface-raised p-2">
          <div
            className="h-4 w-4 rounded-(--gryt-radius-sm) bg-gryt-accent"
            key={`${current.scale}-${String(current.curve)}`}
            style={{
              animation: stopped
                ? "none"
                : `gryt-motion-preview ${Math.round(
                    grytDurations.springSoft * current.scale
                  )}ms var(--ease-spring) infinite alternate`
            }}
          />
        </div>
      </div>
    </div>
  );
}
