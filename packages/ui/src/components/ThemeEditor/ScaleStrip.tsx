/**
 * The twelve steps a family generated, under the anchors that generated them. Changing one
 * hex value moves a whole ramp, and seeing that happen is the point of the page.
 */
export interface ScaleStripProps {
  label: string;
  steps: string[];
}

export function ScaleStrip({ label, steps }: ScaleStripProps) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[11px] font-medium tracking-wide text-gryt-muted">
        {label}
      </span>
      <ol className="m-0 flex list-none gap-px overflow-hidden rounded-(--gryt-radius-sm) border border-gryt-border p-0">
        {steps.map((step, index) => (
          <li
            key={`${label}-${index}`}
            className="h-6 min-w-0 flex-1"
            style={{ backgroundColor: step }}
            title={`${label} ${index + 1} · ${step}`}
          />
        ))}
      </ol>
    </div>
  );
}
