import type { GrytFontKey, GrytFonts } from "@gryt/theme";
import { grytFonts, isFontStack } from "@gryt/theme";
import { useState } from "react";

import { Select } from "../Select/Select";
import { TextField } from "../TextField/TextField";
import {
  FONT_CHOICES,
  FONT_ROLE_HINTS,
  FONT_ROLE_LABELS,
  choiceFor,
  primaryFamily
} from "./fonts";

/* One role's typeface: a list of good ones, and a box for everything else.
 *
 * The box is not a fallback for a short list — it is how the long tail works.
 * A curated dozen cannot cover what somebody wants, and downloading Google's
 * sixteen hundred families to populate a dropdown would be a request to Google
 * made by a picker, on an app where talking to Google is a setting. So the
 * list is what is worth suggesting and the box is what is possible.
 *
 * What is typed is a family name, not a stack. Asking somebody to write
 * `"Bodoni Moda", ui-serif, Georgia, serif` is asking them to know CSS, and
 * getting the tail wrong is how a theme ends up unreadable on a machine that
 * does not have the face. The tail comes from whichever listed choice the role
 * is nearest to.
 */

interface FontFieldProps {
  role: GrytFontKey;
  fonts: GrytFonts | null | undefined;
  onChange: (stack: string) => void;
  /** Says so when a remote face will not be fetched on this machine. */
  remoteAllowed?: boolean;
}

const CUSTOM = "custom";

export function FontField({
  role,
  fonts,
  onChange,
  remoteAllowed = true
}: FontFieldProps) {
  const stack = fonts?.[role] ?? grytFonts[role];
  const listed = choiceFor(stack);
  const [custom, setCustom] = useState(() =>
    listed === undefined ? primaryFamily(stack) : ""
  );

  /* The tail a typed family inherits. Mono keeps a mono tail, because a
     proportional fallback under a column of hex values is worse than the
     wrong face. */
  const tail =
    role === "mono"
      ? "ui-monospace, Menlo, Consolas, monospace"
      : "ui-sans-serif, system-ui, sans-serif";

  function pick(value: string) {
    if (value === CUSTOM) {
      const family = custom.trim();
      if (family !== "") apply(family);
      return;
    }
    const choice = FONT_CHOICES.find((entry) => entry.label === value);
    if (choice !== undefined) onChange(choice.stack);
  }

  function apply(family: string) {
    const next = `"${family}", ${tail}`;
    // Refused rather than escaped: a family name has no use for a brace or a
    // semicolon, and this string is heading for a CSS declaration.
    if (isFontStack(next)) onChange(next);
  }

  const remoteAndBlocked = listed?.remote === true && !remoteAllowed;

  return (
    <div className="min-w-0 flex flex-col gap-1.5">
      <Select
        label={FONT_ROLE_LABELS[role]}
        onValueChange={(value) => pick(String(value))}
        options={[
          ...FONT_CHOICES.map((choice) => ({
            label: choice.remote ? `${choice.label} · fetched` : choice.label,
            value: choice.label
          })),
          { label: "Something else…", value: CUSTOM }
        ]}
        size="small"
        value={listed?.label ?? CUSTOM}
      />

      {listed === undefined ? (
        <TextField
          label="Family name"
          onChange={(event) => {
            setCustom(event.target.value);
            const family = event.target.value.trim();
            if (family !== "") apply(family);
          }}
          placeholder="Bodoni Moda"
          size="small"
          value={custom}
        />
      ) : null}

      <p className="m-0 text-[11px] leading-4 text-gryt-muted">
        {listed?.note ?? FONT_ROLE_HINTS[role]}
      </p>

      {remoteAndBlocked ? (
        <p className="m-0 text-[11px] leading-4 text-gryt-warning-11">
          This one is fetched from Google, which is off on this machine. It will
          fall back until you turn it on.
        </p>
      ) : null}

      {/* Set in the face it names, so the choice is visible before it is
          applied to anything. */}
      <p
        className="m-0 truncate text-sm text-gryt-text"
        style={{ fontFamily: stack }}
      >
        The quick brown fox — 0123456789
      </p>
    </div>
  );
}
