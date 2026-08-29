import type { GrytBezier } from "@gryt/theme";
import { useCallback, useRef, useState } from "react";

/* A cubic bezier you drag.
 *
 * Drawn at 1×1 in user units with the y axis flipped, so the curve reads the
 * way everybody draws one: time left to right, progress bottom to top.
 *
 * The box has room above and below the unit square, because a curve worth
 * drawing usually leaves it. A control point above y=1 overshoots and comes
 * back, which is the whole reason to draw one rather than pick "smooth" — and
 * a graph that clipped it would make the interesting curves look like they
 * flatten out.
 *
 * x is clamped to 0..1 and y is not. That is not a stylistic choice: a cubic
 * bezier timing function with a control point outside the time axis is invalid
 * CSS and the browser drops the whole declaration, so a handle that could be
 * dragged there would be a handle that silently breaks the theme.
 */

const PAD = 0.45;
const VIEW = { min: -PAD, size: 1 + PAD * 2 };

interface CurveEditorProps {
  value: GrytBezier;
  onChange: (next: GrytBezier) => void;
  /** Drawn faintly behind, to compare against. */
  reference?: readonly number[];
  /**
   * A sampled curve to draw instead of the bezier, with no handles.
   *
   * For the named curves. A spring is not a cubic bezier and cannot be shown
   * as one, so while a named curve is selected the graph draws the samples the
   * theme will actually run and offers nothing to drag — the alternative was
   * a prominent line that was not the curve in effect, which is worse than no
   * line at all.
   */
  samples?: readonly number[];
}

type Handle = 0 | 1;

export function CurveEditor({
  value,
  onChange,
  reference,
  samples
}: CurveEditorProps) {
  const readOnly = samples !== undefined;
  const svg = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<Handle | null>(null);
  const [x1, y1, x2, y2] = value;

  /* Client pixels to curve units. getBoundingClientRect rather than the SVG's
     own matrix, because the panel this sits in can be zoomed — the client
     applies a zoom to the root element — and the rect already accounts for it
     while a hand-rolled ratio would not. */
  const toUnits = useCallback((clientX: number, clientY: number) => {
    const box = svg.current?.getBoundingClientRect();
    if (box === undefined || box.width === 0) return null;
    const x = VIEW.min + ((clientX - box.left) / box.width) * VIEW.size;
    const y = VIEW.min + ((box.bottom - clientY) / box.height) * VIEW.size;
    return { x, y };
  }, []);

  const move = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (dragging === null) return;
      const point = toUnits(event.clientX, event.clientY);
      if (point === null) return;
      const x = Math.min(1, Math.max(0, Number(point.x.toFixed(3))));
      const y = Number(point.y.toFixed(3));
      onChange(
        dragging === 0 ? [x, y, x2, y2] : [x1, y1, x, y]
      );
    },
    [dragging, onChange, toUnits, x1, y1, x2, y2]
  );

  /* SVG user space: x straight through, y flipped so 1 is the top. */
  const px = (x: number) => x;
  const py = (y: number) => 1 - y;
  const path = `M 0 ${py(0)} C ${px(x1)} ${py(y1)}, ${px(x2)} ${py(y2)}, 1 ${py(1)}`;

  return (
    <svg
      className="w-full touch-none rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-surface-raised"
      onPointerDown={(event) => {
        if (readOnly) return;
        // Deciding here rather than on each handle keeps the pointer captured
        // by one element, so a drag that leaves a 12px circle keeps going.
        const point = toUnits(event.clientX, event.clientY);
        if (point === null) return;
        const near = (hx: number, hy: number) =>
          (point.x - hx) ** 2 + (point.y - hy) ** 2;
        setDragging(near(x1, y1) <= near(x2, y2) ? 0 : 1);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={move}
      onPointerUp={(event) => {
        setDragging(null);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      preserveAspectRatio="none"
      ref={svg}
      role={readOnly ? "img" : "application"}
      aria-label="Timing curve"
      style={{ height: 132 }}
      viewBox={`${VIEW.min} ${VIEW.min} ${VIEW.size} ${VIEW.size}`}
    >
      {/* The unit square: where the animation starts and where it ends. Any
          part of the curve outside it is overshoot, and saying so is the
          point of drawing the box at all. */}
      <rect
        fill="none"
        height={1}
        stroke="var(--gryt-border)"
        strokeWidth={0.004}
        width={1}
        x={0}
        y={0}
      />

      {reference !== undefined ? (
        <polyline
          fill="none"
          opacity={0.35}
          points={reference
            .map((v, i) => `${i / (reference.length - 1)},${py(v)}`)
            .join(" ")}
          stroke="var(--gryt-muted)"
          strokeWidth={0.008}
        />
      ) : null}

      {readOnly ? (
        <polyline
          fill="none"
          points={samples
            .map((v, i) => `${i / (samples.length - 1)},${py(v)}`)
            .join(" ")}
          stroke="var(--gryt-accent)"
          strokeWidth={0.014}
        />
      ) : (
        <>
          <line
            stroke="var(--gryt-muted)"
            strokeWidth={0.005}
            x1={0}
            x2={px(x1)}
            y1={py(0)}
            y2={py(y1)}
          />
          <line
            stroke="var(--gryt-muted)"
            strokeWidth={0.005}
            x1={1}
            x2={px(x2)}
            y1={py(1)}
            y2={py(y2)}
          />

          <path
            d={path}
            fill="none"
            stroke="var(--gryt-accent)"
            strokeWidth={0.014}
          />

          <circle
            cx={px(x1)}
            cy={py(y1)}
            fill="var(--gryt-accent)"
            r={dragging === 0 ? 0.035 : 0.026}
          />
          <circle
            cx={px(x2)}
            cy={py(y2)}
            fill="var(--gryt-accent)"
            r={dragging === 1 ? 0.035 : 0.026}
          />
        </>
      )}
    </svg>
  );
}
