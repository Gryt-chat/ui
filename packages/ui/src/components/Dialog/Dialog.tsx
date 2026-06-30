import MuiDialog from "@mui/material/Dialog";
import MuiDialogActions from "@mui/material/DialogActions";
import MuiDialogContent from "@mui/material/DialogContent";
import MuiDialogTitle from "@mui/material/DialogTitle";
import type { DialogProps as MuiDialogProps } from "@mui/material/Dialog";
import type {
  DialogActionsProps,
  DialogContentProps,
  DialogTitleProps
} from "@mui/material";
import { cn } from "../utils/cn";

export type DialogProps = MuiDialogProps;

export function Dialog({ PaperProps, ...props }: DialogProps) {
  return (
    <MuiDialog
      PaperProps={{
        ...PaperProps,
        className: cn("gryt-dialog", PaperProps?.className)
      }}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <MuiDialogTitle className={cn("gryt-dialog-title", className)} {...props} />
  );
}

export function DialogContent({ className, ...props }: DialogContentProps) {
  return (
    <MuiDialogContent
      className={cn("gryt-dialog-content", className)}
      {...props}
    />
  );
}

export function DialogActions({ className, ...props }: DialogActionsProps) {
  return (
    <MuiDialogActions
      className={cn("gryt-dialog-actions", className)}
      {...props}
    />
  );
}
