import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlertDialog } from "../AlertDialog/AlertDialog";
import { Dialog } from "../Dialog/Dialog";
import { Select } from "../Select/Select";

/**
 * Where a Select's popup ends up (GRYT-242).
 *
 * The bug this pins down is not a rendering detail. A dropdown portalled to the
 * document body while its dialog is open has to win a stacking contest against
 * that dialog, and does not reliably — so the list opens behind the modal and
 * cannot be clicked. `Select` grew a `portalContainer` prop for it, and the
 * prop had to be threaded by hand from every call site, so the ones that forgot
 * stayed broken and nothing said so.
 */

const options = [
  { label: "One", value: "1" },
  { label: "Two", value: "2" },
];

describe("a Select inside a dialog", () => {
  it("puts its popup inside the dialog, not beside it", async () => {
    render(
      <Dialog.Root open>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Popup data-testid="popup">
            <Select options={options} defaultOpen />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    const dialog = await screen.findByTestId("popup");
    const option = await screen.findByText("One");

    expect(dialog.contains(option)).toBe(true);
  });

  it("does the same inside an AlertDialog", async () => {
    render(
      <AlertDialog.Root open>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Popup data-testid="popup">
            <Select options={options} defaultOpen />
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );

    const dialog = await screen.findByTestId("popup");
    expect(dialog.contains(await screen.findByText("One"))).toBe(true);
  });

  it("lets an explicit container win over the dialog", async () => {
    // The prop is still an override, so a caller that knows better can say so.
    // `null` is an answer meaning the body, not an absence.
    render(
      <Dialog.Root open>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Popup data-testid="popup">
            <Select options={options} defaultOpen portalContainer={null} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    const dialog = await screen.findByTestId("popup");
    expect(dialog.contains(await screen.findByText("One"))).toBe(false);
  });
});

describe("a Select outside any dialog", () => {
  it("is unchanged, and portals to the body", async () => {
    render(<Select options={options} defaultOpen />);
    const option = await screen.findByText("One");
    expect(document.body.contains(option)).toBe(true);
  });
});
