import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrytProvider } from "../../GrytProvider";
import { AlertDialog } from "../AlertDialog/AlertDialog";
import { Dialog } from "./Dialog";

const VIEWPORT_CLASSES = [
  "max-h-[calc(100dvh-3rem)]",
  "overflow-y-auto",
  "overscroll-contain"
];

function expectViewportBoundPopup(selector: string) {
  const popup = document.querySelector(selector);
  expect(popup).not.toBeNull();
  expect(popup).toHaveClass(...VIEWPORT_CLASSES);
}

describe("dialogs stay inside the viewport", () => {
  it("caps and scrolls a Dialog popup", () => {
    render(
      <GrytProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.Title>Tall dialog</Dialog.Title>
              <div>Content</div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </GrytProvider>
    );

    expectViewportBoundPopup(".gryt-dialog");
  });

  it("caps and scrolls an AlertDialog popup", () => {
    render(
      <GrytProvider>
        <AlertDialog.Root defaultOpen>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
              <AlertDialog.Title>Tall alert</AlertDialog.Title>
              <AlertDialog.Description>Content</AlertDialog.Description>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </GrytProvider>
    );

    expectViewportBoundPopup(".gryt-alert-dialog");
  });
});
