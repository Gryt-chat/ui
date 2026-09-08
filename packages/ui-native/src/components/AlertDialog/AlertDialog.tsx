import { Dialog, type DialogPopupProps, type DialogRootProps } from "../Dialog/Dialog";

/**
 * A dialog that will not go away until it is answered. This drops the outside press and
 * the Android back button, which are the two ways a phone offers to leave.
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
