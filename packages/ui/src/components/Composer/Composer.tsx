import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useCallback, useLayoutEffect, useRef } from "react";
import type {
  FormEvent,
  FormEventHandler,
  TextareaHTMLAttributes
} from "react";
import { forwardRef } from "react";
import { Button } from "../Button/Button";
import { cn } from "../utils/cn";

export interface ComposerProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onSubmit"> {
  onSubmit?: FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
}

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  function Composer(
    {
      className,
      disabled = false,
      maxRows = 8,
      minRows = 1,
      onSubmit,
      placeholder = "Message Gryt",
      submitLabel = "Send",
      ...props
    },
    ref
  ) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    // Replaces MUI's TextareaAutosize. Reset to auto first, otherwise
    // scrollHeight only ever reports the current height and the box can grow
    // but never shrink.
    const resize = useCallback(() => {
      const node = innerRef.current;
      if (!node) {
        return;
      }

      const styles = window.getComputedStyle(node);
      const lineHeight = parseFloat(styles.lineHeight) || 24;
      const vertical =
        parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

      node.style.height = "auto";
      node.style.height = `${Math.min(
        Math.max(node.scrollHeight, lineHeight * minRows + vertical),
        lineHeight * maxRows + vertical
      )}px`;
    }, [maxRows, minRows]);

    useLayoutEffect(resize, [resize, props.value]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
      if (!onSubmit) {
        event.preventDefault();
        return;
      }

      onSubmit(event);
    }

    return (
      <form className={cn("gryt-composer", className)} onSubmit={handleSubmit}>
        <textarea
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          rows={minRows}
          disabled={disabled}
          placeholder={placeholder}
          onInput={resize}
          className="gryt-composer-textarea disabled:cursor-not-allowed disabled:opacity-60"
          {...props}
        />
        <Button
          type="submit"
          disabled={disabled}
          size="small"
          endIcon={<PaperPlaneTilt size={14} weight="fill" />}
        >
          {submitLabel}
        </Button>
      </form>
    );
  }
);
