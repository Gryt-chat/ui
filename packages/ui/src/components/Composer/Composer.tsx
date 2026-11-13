"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, FormEventHandler, KeyboardEvent, MouseEventHandler, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

import { PiArrowUpBold, PiPlusBold, PiSmileyWinkFill } from "../../icons/icons";
import { cn } from "../utils/cn";

export interface ComposerProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onSubmit"> {
  onSubmit?: FormEventHandler<HTMLFormElement>;
  /** The send button's accessible name. */
  submitLabel?: string;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Shows the round + before the field, for attachments and the like. */
  onAdd?: MouseEventHandler<HTMLButtonElement>;
  /** Shows the emoji button inside the field. */
  onEmoji?: MouseEventHandler<HTMLButtonElement>;
  /** A message that would go out unencrypted, which turns the field's edge red. */
  unencrypted?: boolean;
}

/** The message box as the client draws it: a round +, a pill field, and a send button once there's text. Enter sends. */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  {
    className,
    disabled = false,
    maxRows = 8,
    minRows = 1,
    onSubmit,
    placeholder = "Message Gryt",
    submitLabel = "Send message",
    onAdd,
    onEmoji,
    unencrypted = false,
    onInput,
    onKeyDown,
    ...props
  },
  ref
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [typed, setTyped] = useState(false);
  const hasText = props.value !== undefined ? String(props.value).trim().length > 0 : typed;

  // Reset to auto first, or scrollHeight only reports the current height and the box can grow but never shrink.
  const resize = useCallback(() => {
    const node = innerRef.current;
    if (!node) return;
    const styles = window.getComputedStyle(node);
    const lineHeight = parseFloat(styles.lineHeight) || 24;
    const vertical = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    node.style.height = "auto";
    node.style.height = `${Math.min(Math.max(node.scrollHeight, lineHeight * minRows + vertical), lineHeight * maxRows + vertical)}px`;
  }, [maxRows, minRows]);

  useLayoutEffect(resize, [resize, props.value]);

  // A field cleared from code fires no input event, so look again once the submit or reset has run.
  const recheck = () => queueMicrotask(() => {
    setTyped((innerRef.current?.value.trim().length ?? 0) > 0);
    resize();
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!onSubmit) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
    recheck();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (hasText) formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} className={cn("gryt-composer", disabled && "gryt-composer-disabled", className)} onSubmit={handleSubmit} onReset={recheck}>
      {onAdd && (
        <button className="gryt-composer-add" type="button" aria-label="Add" disabled={disabled} onClick={onAdd}>
          <PiPlusBold size={20} />
        </button>
      )}
      <div className="gryt-composer-field" data-unencrypted={unencrypted ? "" : undefined}>
        <textarea
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          rows={minRows}
          disabled={disabled}
          placeholder={placeholder}
          onInput={(event) => {
            setTyped(event.currentTarget.value.trim().length > 0);
            resize();
            onInput?.(event);
          }}
          onKeyDown={handleKeyDown}
          className="gryt-composer-textarea"
          {...props}
        />
        {onEmoji && (
          <button className="gryt-composer-emoji" type="button" aria-label="Insert emoji" disabled={disabled} onClick={onEmoji}>
            <PiSmileyWinkFill size={20} />
          </button>
        )}
        {hasText && (
          <button className="gryt-composer-send" type="submit" aria-label={submitLabel} disabled={disabled}>
            <PiArrowUpBold size={18} />
          </button>
        )}
      </div>
    </form>
  );
});
