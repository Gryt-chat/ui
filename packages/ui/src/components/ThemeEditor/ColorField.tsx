import { TextField } from "../TextField/TextField";
import { Warning } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { isHex, normalizeHex } from "./draft";

export interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Set when a contrast check blames this colour. */
  warning?: string;
  /** Shown but not editable, for values something else is computing. */
  disabled?: boolean;
}

/**
 * One anchor: the swatch, and the hex beside it. The picker finds a colour you cannot
 * name, the box pastes one you have. The box only commits when what is in it parses.
 */
export function ColorField({
  label,
  value,
  onChange,
  warning,
  disabled = false
}: ColorFieldProps) {
  const id = useId();
  const [text, setText] = useState(value);
  const [seen, setSeen] = useState(value);

  // A preset, a generated theme or a shared link changes the value from outside, and the
  // box has to follow. Adjusted during render, so the stale text is never on screen.
  if (value !== seen) {
    setSeen(value);
    setText(value);
  }

  function commit(next: string) {
    setText(next);
    if (isHex(next)) onChange(normalizeHex(next));
  }

  return (
    <div className="min-w-0">
      <span
        className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gryt-muted"
        id={`${id}-label`}
      >
        <span className="truncate">{label}</span>
        {warning ? (
          <span className="inline-flex shrink-0 text-gryt-warning-11" title={warning}>
            <Warning aria-label={warning} size={13} />
          </span>
        ) : null}
      </span>
      <span className="flex items-center gap-2">
        <input
          aria-label={`${label}, colour picker`}
          className="docs-swatch disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onChange={(event) => commit(event.target.value)}
          type="color"
          value={normalizeHex(value)}
        />
        <TextField
          aria-label={`${label}, hex value`}
          className="font-mono"
          disabled={disabled}
          onBlur={() => setText(value)}
          onChange={(event) => commit(event.target.value)}
          size="small"
          spellCheck={false}
          value={text}
        />
      </span>
    </div>
  );
}
