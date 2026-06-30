import TextareaAutosize from "@mui/material/TextareaAutosize";
import type {
  FormEvent,
  FormEventHandler,
  TextareaHTMLAttributes
} from "react";
import { forwardRef } from "react";
import { Button } from "../Button/Button";
import { cn } from "../utils/cn";

export interface ComposerProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onSubmit"
> {
  onSubmit?: FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  disabled?: boolean;
}

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  function Composer(
    {
      className,
      disabled = false,
      onSubmit,
      placeholder = "Message Gryt",
      submitLabel = "Send",
      ...props
    },
    ref
  ) {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
      if (!onSubmit) {
        event.preventDefault();
        return;
      }

      onSubmit(event);
    }

    return (
      <form className={cn("gryt-composer", className)} onSubmit={handleSubmit}>
        <TextareaAutosize
          ref={ref}
          minRows={1}
          maxRows={8}
          disabled={disabled}
          placeholder={placeholder}
          className="gryt-composer-textarea disabled:cursor-not-allowed disabled:opacity-60"
          {...props}
        />
        <Button type="submit" disabled={disabled} size="small">
          {submitLabel}
        </Button>
      </form>
    );
  }
);
