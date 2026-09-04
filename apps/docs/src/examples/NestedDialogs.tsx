import { Button, Dialog } from "@gryt/ui";
import { useState } from "react";

/**
 * A dialog opened from inside another dialog, and the one prop that makes it
 * work.
 *
 * Base UI drops a dialog's backdrop when that dialog is nested inside another —
 * `enabled: forceRender || !nested` in its DialogBackdrop. Two backdrops at 60%
 * black stack to 84%, so the reasoning is sound on its own.
 *
 * It stops being what you want the moment the outer dialog is a whole screen
 * rather than a prompt. Gryt's settings panel is a Dialog, so everything opened
 * from settings is nested — and shipped with no backdrop, which cost two
 * things: nothing dimmed, and it could not be dismissed by clicking away,
 * because Base UI only treats an outside press as a dismissal when the click
 * landed on *that dialog's own* backdrop.
 *
 * `forceRender` on the inner backdrop fixes both.
 */
export function NestedDialogs() {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);
  const [force, setForce] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-gryt-muted">
        <input
          checked={force}
          onChange={(e) => setForce(e.target.checked)}
          type="checkbox"
        />
        <code>forceRender</code> on the inner backdrop
      </label>

      <div>
        <Button onClick={() => setOuter(true)}>Open settings</Button>
      </div>

      <Dialog.Root onOpenChange={setOuter} open={outer}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Popup>
            <Dialog.Title>Settings</Dialog.Title>
            <Dialog.Description>
              A panel rather than a prompt. Anything opened from here is nested.
            </Dialog.Description>

            <div className="mt-4">
              <Button onClick={() => setInner(true)}>Change avatar</Button>
            </div>

            {/* The nested one. Its backdrop is suppressed without forceRender. */}
            <Dialog.Root onOpenChange={setInner} open={inner}>
              <Dialog.Portal>
                <Dialog.Backdrop forceRender={force} />
                <Dialog.Popup>
                  <Dialog.Title>Your avatar</Dialog.Title>
                  <Dialog.Description>
                    {force
                      ? "There is a backdrop, so clicking outside closes this and leaves settings open."
                      : "No backdrop. Clicking outside does nothing — the button below is the only way out."}
                  </Dialog.Description>
                  <Dialog.Footer>
                    <Dialog.Close render={<Button tone="neutral" />}>
                      Close
                    </Dialog.Close>
                  </Dialog.Footer>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Footer>
              <Dialog.Close render={<Button tone="neutral" />}>
                Done
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
