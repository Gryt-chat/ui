import { Dialog, type DialogPopupProps, type DialogRootProps } from "../Dialog/Dialog";

/**
 * A dialog that will not go away until it is answered.
 *
 * The only difference from Dialog, on the web and here: no dismissal by
 * accident. Base UI drops the outside-press and Escape handling; this drops the
 * outside-press and the Android back button, which are the two ways a phone
 * offers to leave without choosing.
 *
 * There is no Footer here, matching the web, which does not export one for
 * AlertDialog either.
 */

// Omit rather than ignore: passing dismissible to an alert dialog is a mistake
// worth catching at the call site rather than silently dropping.
export type AlertDialogPopupProps = Omit<DialogPopupProps, "dismissible">;

function Popup(props: AlertDialogPopupProps) {
  return <Dialog.Popup {...props} dismissible={false} />;
}

export type AlertDialogRootProps = DialogRootProps;

export const AlertDialog = {
  Root: Dialog.Root,
  Trigger: Dialog.Trigger,
  Portal: Dialog.Portal,
  Backdrop: Dialog.Backdrop,
  Popup,
  Title: Dialog.Title,
  Description: Dialog.Description,
  Close: Dialog.Close,
};
