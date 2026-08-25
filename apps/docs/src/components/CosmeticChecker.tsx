import { ACCESSORY_SLOTS, OWL_BASE, owlAvatarSvg, owlPalette } from "@gryt/owl";
import {
  INKS,
  ROLES,
  extract,
  placementFor,
  type Placement
} from "@gryt/owl/authoring";
import { Button, Surface } from "@gryt/ui";
import { useCallback, useMemo, useRef, useState } from "react";

/* The same lookup the generator uses, keyed the way the extractor wants it. */
const inks = new Map(
  Object.entries(INKS).map(([hex, role]) => [hex.toLowerCase(), role])
);

/* Palettes to show it on. One is what you drew against; the others are two of
   the thirty it will actually be worn in, which is the thing a drawing most
   often turns out not to survive. */
const PREVIEWS = [
  { seed: "your drawing", palette: OWL_BASE.palette, scheme: OWL_BASE.scheme },
  { seed: "ingy", palette: "amber", scheme: "night" },
  { seed: "gryt", palette: "plum", scheme: "dusk" }
] as const;

type Report =
  | { ok: false; where: "name" | "drawing"; message: string }
  | {
      ok: true;
      placement: Placement;
      paths: number;
      bytes: number;
      saved: number;
      unplaced: string[];
      /* How much of the bird the drawing was made on top of. */
      found: number;
      ofBird: number;
      hides: string[];
      recolours: string[];
      /* Rebuilt path elements, one string per preview palette. */
      draw: (palette: Record<string, string>) => string;
    };

function readDrawing(filename: string, svg: string): Report {
  let placement: Placement;
  try {
    placement = placementFor(filename, ACCESSORY_SLOTS);
  } catch (error) {
    return {
      ok: false,
      where: "name",
      message: error instanceof Error ? error.message : String(error)
    };
  }

  try {
    const built = extract(svg, filename, {
      name: placement.name,
      slot: placement.slot,
      layer: placement.layer,
      // The real one comes from SLOT_PRESENCE and what else is drawn, neither
      // of which a single upload knows about.
      weight: 0,
      excludes: placement.excludes,
      places: 1,
      tolerance: 0.4,
      map: inks
    });

    const before = svg.length;
    const bytes = built.kept.reduce((n, p) => n + p.d.length, 0);

    return {
      ok: true,
      placement,
      paths: built.kept.length,
      bytes,
      saved: Math.max(0, Math.round((100 * (before - bytes)) / before)),
      unplaced: built.guessed,
      found: built.found,
      ofBird: built.ofBird,
      hides: [...built.literal.matchAll(/hides: \[([^\]]*)\]/g)].flatMap((m) =>
        m[1].split(",").map((s) => s.replace(/["\s]/g, "")).filter(Boolean)
      ),
      recolours: [...built.literal.matchAll(/(\w+): "(\w+)"/g)]
        .filter(([, k]) => k === "wing" || k === "body" || k === "face")
        .map(([, k, v]) => `${k} → ${v}`),
      /* Every attribute here is rebuilt rather than passed through: `d` is
         re-emitted from parsed numbers, and the fill is a palette value looked
         up by role. Nothing from the uploaded file reaches the DOM as markup,
         which is what makes rendering somebody else's SVG safe to do. */
      draw: (palette) =>
        built.kept
          .map((p) =>
            built.paint(p, (hex) => palette[built.roles.get(hex) ?? "trim"] ?? "#888")
          )
          .join("")
    };
  } catch (error) {
    return {
      ok: false,
      where: "drawing",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

function Preview({
  report,
  seed,
  palette,
  scheme
}: {
  report: Extract<Report, { ok: true }>;
  seed: string;
  palette: string;
  scheme: string;
}) {
  const html = useMemo(() => {
    const options = { ...OWL_BASE, palette, scheme, size: 1024 } as Parameters<
      typeof owlAvatarSvg
    >[1];
    const bird = owlAvatarSvg(seed, options);
    const inner = bird.slice(bird.indexOf(">") + 1, bird.lastIndexOf("</svg>"));
    const colours = owlPalette(
      palette as Parameters<typeof owlPalette>[0],
      scheme as Parameters<typeof owlPalette>[1]
    );
    return inner + report.draw(colours as unknown as Record<string, string>);
  }, [report, seed, palette, scheme]);

  return (
    <svg
      aria-label={`Your cosmetic on the ${palette} palette`}
      className="block h-full w-full"
      dangerouslySetInnerHTML={{ __html: html }}
      role="img"
      viewBox="0 0 1024 1024"
    />
  );
}

export function CosmeticChecker() {
  const [report, setReport] = useState<Report | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const take = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setFilename(file.name);
    setReport(readDrawing(file.name, await file.text()));
  }, []);

  return (
    <div className="not-prose flex flex-col gap-(--space-md)">
      <Surface
        className={[
          "flex flex-col items-center gap-(--space-sm) border-dashed py-(--space-xl) text-center transition-colors",
          over ? "border-gryt-accent bg-gryt-surface-raised" : ""
        ].join(" ")}
        onDragLeave={() => setOver(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void take(event.dataTransfer.files[0]);
        }}
      >
        <p className="m-0 text-sm text-gryt-muted">
          Drop your SVG here, or
        </p>
        <Button onClick={() => input.current?.click()} size="small" tone="neutral">
          Choose a file
        </Button>
        <input
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(event) => void take(event.target.files?.[0])}
          ref={input}
          type="file"
        />
        <p className="m-0 text-xs text-gryt-muted">
          Nothing is uploaded. It is read in this tab and never leaves it.
        </p>
      </Surface>

      {report === null ? null : report.ok ? (
        <Surface className="flex flex-col gap-(--space-md)">
          <div className="grid grid-cols-1 gap-(--space-md) sm:grid-cols-3">
            {PREVIEWS.map((p) => (
              <figure key={p.palette} className="m-0">
                <div className="overflow-hidden rounded-(--gryt-radius-md)">
                  <Preview palette={p.palette} report={report} scheme={p.scheme} seed={p.seed} />
                </div>
                <figcaption className="mt-1 text-center text-[11px] text-gryt-muted">
                  {p.palette}
                </figcaption>
              </figure>
            ))}
          </div>

          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {[
              ["file", filename],
              ["name", report.placement.name],
              ["slot", report.placement.slot],
              ["family", report.placement.family],
              ["variant", report.placement.variant || "—"],
              ["rarity", report.placement.rarity],
              ["layer", report.placement.layer],
              [
                "cannot be worn with",
                report.placement.excludes.join(", ") || "—"
              ],
              ["paths kept", `${report.paths}`],
              ["size", `${(report.bytes / 1000).toFixed(1)}kB, ${report.saved}% smaller`],
              ["hides", report.hides.join(", ") || "—"],
              ["repaints", report.recolours.join(", ") || "—"]
            ].map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-gryt-muted">{label}</dt>
                <dd className="m-0 font-mono text-gryt-text">{value}</dd>
              </div>
            ))}
          </dl>

          {report.found < report.ofBird ? (
            <div className="rounded-(--gryt-radius-md) border border-gryt-danger p-3 text-sm">
              <p className="m-0 text-gryt-text">
                Only {report.found} of the bird&rsquo;s {report.ofBird} shapes
                were found in this file.
              </p>
              <p className="m-0 mt-2 text-xs text-gryt-muted">
                {report.found === 0
                  ? "None of them, so this was not drawn on owl-base.svg. Start from the download in step 1 and draw over it."
                  : "A part of the bird was moved, rescaled or deleted. Everything it could not find is being kept as part of your cosmetic, which is what the preview above is showing."}
              </p>
            </div>
          ) : null}

          {report.unplaced.length > 0 ? (
            <div className="rounded-(--gryt-radius-md) bg-gryt-surface-raised p-3 text-sm">
              <p className="m-0 mb-2 text-gryt-text">
                {report.unplaced.length} colour
                {report.unplaced.length === 1 ? "" : "s"} the project has not
                seen. Say which rung of the palette each one is when you share
                it:
              </p>
              <pre className="m-0 overflow-x-auto font-mono text-xs text-gryt-muted">
                {report.unplaced.map((hex) => `"${hex}": "trim",`).join("\n")}
              </pre>
              <p className="m-0 mt-2 text-xs text-gryt-muted">
                One of: {ROLES.join(", ")}
              </p>
            </div>
          ) : (
            <p className="m-0 text-sm text-gryt-muted">
              Every colour in it already has a role, so it needs no configuration
              at all.
            </p>
          )}
        </Surface>
      ) : (
        <Surface className="border-gryt-danger">
          <p className="m-0 mb-2 text-sm font-semibold text-gryt-text">
            {report.where === "name"
              ? "The filename does not say where this goes"
              : "The drawing cannot be used yet"}
          </p>
          <pre className="m-0 overflow-x-auto font-mono text-xs whitespace-pre-wrap text-gryt-muted">
            {report.message}
          </pre>
        </Surface>
      )}
    </div>
  );
}
