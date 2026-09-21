"use client";

import { ImageBroken } from "@phosphor-icons/react";
import { forwardRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/styles";

export interface WebhookCardAuthor {
  name: string;
  url?: string;
  iconUrl?: string;
}

export interface WebhookCardField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface WebhookCardFooter {
  text: string;
  iconUrl?: string;
}

/** One card a webhook posted, with its pictures already turned into URLs the host can load. */
export interface WebhookCardData {
  title?: string;
  /** Where a click anywhere on the card goes. Needs a title, and only http(s) counts. */
  url?: string;
  description?: string;
  /** `#rrggbb`. Anything else is ignored. */
  color?: string;
  author?: WebhookCardAuthor;
  fields?: WebhookCardField[];
  imageUrl?: string;
  thumbnailUrl?: string;
  footer?: WebhookCardFooter;
  /** ISO 8601. */
  timestamp?: string;
}

export interface WebhookCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  card: WebhookCardData;
  /** The chat's own markdown, for the description and field values. Plain text when absent. */
  renderMarkdown?: (text: string) => ReactNode;
  formatTimestamp?: (iso: string) => string;
  /** Replaces the default new-tab link, e.g. to route through a confirm dialog. */
  onOpenUrl?: (url: string) => void;
  onPressImage?: (url: string) => void;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Only http(s) becomes a link. Anything else draws as plain text, as on the phone. */
function openableUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  return trimmed && /^https?:\/\/\S+$/i.test(trimmed) ? trimmed : undefined;
}

// What handles its own click: links and controls, and a picture the host drew in the markdown.
const OWN_CLICK =
  "a, button, input, select, textarea, summary, [role=button], [role=link], .gryt-webhook-card-description img, .gryt-webhook-card-field img";

function defaultTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

interface CardLinkProps {
  href?: string;
  className?: string;
  children: ReactNode;
  onOpenUrl?: (url: string) => void;
  /** The card draws this link's focus ring, because the whole card is the link. */
  cardFocus?: boolean;
}

function CardLink({ href, className, children, onOpenUrl, cardFocus }: CardLinkProps) {
  if (!href) return <span className={className}>{children}</span>;
  const onClick = onOpenUrl
    ? (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onOpenUrl(href);
      }
    : undefined;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
      onClick={onClick}
      className={cn(
        "rounded-sm underline-offset-2 hover:underline active:opacity-80",
        cardFocus ? "outline-none" : focusRing,
        className
      )}
    >
      {children}
    </a>
  );
}

type ImageStatus = "loading" | "loaded" | "error";

interface CardImageProps {
  src: string;
  className?: string;
  small?: boolean;
  onPress?: (url: string) => void;
}

// Callers key it by src, so a new picture starts loading again instead of keeping an old error.
function CardImage({ src, className, small, onPress }: CardImageProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");

  const image = (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={() => setStatus("loaded")}
      onError={() => setStatus("error")}
      className={cn(
        "block h-full w-full object-cover transition-opacity duration-150 motion-reduce:transition-none",
        status === "loaded" ? "opacity-100" : "opacity-0"
      )}
    />
  );

  return (
    <div
      data-state={status}
      className={cn(
        "gryt-webhook-card-image relative overflow-hidden rounded-(--gryt-radius-sm) bg-gryt-surface-raised",
        className
      )}
    >
      {status === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-gryt-surface-hover motion-reduce:animate-none" />
      ) : null}
      {status === "error" ? (
        <div
          role="img"
          aria-label="Image unavailable"
          className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-gryt-muted"
        >
          <ImageBroken size={small ? 16 : 20} aria-hidden="true" />
          {small ? null : <span>Image unavailable</span>}
        </div>
      ) : onPress ? (
        <button
          type="button"
          aria-label="Open image"
          onClick={() => onPress(src)}
          className={cn("block h-full w-full active:opacity-80", focusRing)}
        >
          {image}
        </button>
      ) : (
        image
      )}
    </div>
  );
}

function Icon({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="h-4 w-4 shrink-0 rounded-full object-cover"
    />
  );
}

/** A webhook's card: the app background inside a hairline box, so the host's row hover stops at
    the border. The payload colour is one dot, never behind text. A click anywhere opens `url`. */
export const WebhookCard = forwardRef<HTMLElement, WebhookCardProps>(
  function WebhookCard(
    {
      card,
      className,
      formatTimestamp = defaultTimestamp,
      onClick,
      onOpenUrl,
      onPressImage,
      renderMarkdown,
      style,
      ...props
    },
    ref
  ) {
    const color =
      card.color && HEX_COLOR.test(card.color) ? card.color : undefined;
    const cardUrl = card.title ? openableUrl(card.url) : undefined;
    const markdown = (text: string) =>
      renderMarkdown ? renderMarkdown(text) : text;
    // Plain text keeps its line breaks. A markdown renderer draws its own, so pre-line would double them.
    const lines = renderMarkdown ? undefined : "whitespace-pre-line";
    const time = card.timestamp ? formatTimestamp(card.timestamp) : "";
    const fields = card.fields?.length ? card.fields : null;

    // The same new tab the title link opens. A drag that selected text ends in a click too,
    // and that one opens nothing.
    const onCardClick = (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!cardUrl || event.defaultPrevented) return;
      if ((event.target as Element).closest(OWN_CLICK)) return;
      if (window.getSelection()?.toString()) return;
      if (onOpenUrl) onOpenUrl(cardUrl);
      else window.open(cardUrl, "_blank", "noopener,noreferrer");
    };

    return (
      <article
        ref={ref}
        data-color={color ? "" : undefined}
        style={
          {
            ...style,
            "--gryt-webhook-card-color": color ?? "var(--gryt-border)"
          } as CSSProperties
        }
        onClick={cardUrl ? onCardClick : onClick}
        className={cn(
          "gryt-webhook-card @container flex w-full max-w-[32rem] min-w-0 flex-col gap-2 rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-bg px-3 py-2.5 text-gryt-text",
          cardUrl && [
            "cursor-pointer transition-colors duration-150 motion-reduce:transition-none",
            "hover:border-gryt-neutral-8 [&:hover_.gryt-webhook-card-title]:underline",
            "has-[.gryt-webhook-card-title:focus-visible]:outline-2 has-[.gryt-webhook-card-title:focus-visible]:outline-offset-2 has-[.gryt-webhook-card-title:focus-visible]:outline-gryt-accent-light"
          ],
          className
        )}
        {...props}
      >
        {card.author || card.title || card.thumbnailUrl ? (
          <div className="flex min-w-0 gap-3">
            {card.thumbnailUrl ? (
              <CardImage
                key={card.thumbnailUrl}
                small
                src={card.thumbnailUrl}
                onPress={onPressImage}
                className="h-10 w-10 shrink-0"
              />
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              {card.author ? (
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-(--gryt-webhook-card-color)"
                  />
                  <Icon key={card.author.iconUrl} src={card.author.iconUrl} />
                  <CardLink
                    href={openableUrl(card.author.url)}
                    onOpenUrl={onOpenUrl}
                    className="min-w-0 truncate text-xs text-gryt-muted"
                  >
                    {card.author.name}
                  </CardLink>
                </div>
              ) : null}
              {card.title ? (
                <CardLink
                  href={cardUrl}
                  cardFocus
                  onOpenUrl={onOpenUrl}
                  className={cn(
                    "gryt-webhook-card-title flex min-w-0 items-center gap-2 text-sm leading-5 font-semibold break-words",
                    cardUrl ? "text-gryt-accent-11" : "text-gryt-text"
                  )}
                >
                  {card.author ? null : (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full bg-(--gryt-webhook-card-color)"
                    />
                  )}
                  <span className="min-w-0">{card.title}</span>
                </CardLink>
              ) : null}
            </div>
          </div>
        ) : null}

        {card.description ? (
          <div className={cn("gryt-webhook-card-description min-w-0 text-sm leading-6 break-words", lines)}>
            {markdown(card.description)}
          </div>
        ) : null}

        {fields ? (
          <dl className="flex flex-wrap gap-1.5">
            {fields.map((field, index) => (
              <div
                key={index}
                className={cn(
                  "flex max-w-full min-w-0 items-baseline gap-1.5 rounded-(--gryt-radius-sm) bg-gryt-surface-raised px-2 py-1 text-xs",
                  !field.inline && "basis-full"
                )}
              >
                <dt className="shrink-0 text-gryt-muted">{field.name}</dt>
                <dd className={cn("gryt-webhook-card-field min-w-0 break-words text-gryt-text", lines)}>
                  {markdown(field.value)}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {card.imageUrl ? (
          <CardImage
            key={card.imageUrl}
            src={card.imageUrl}
            onPress={onPressImage}
            className="aspect-[1.91/1] max-h-72 w-full"
          />
        ) : null}

        {card.footer || time ? (
          <div className="flex min-w-0 items-center gap-2 text-xs text-gryt-muted">
            <Icon key={card.footer?.iconUrl} src={card.footer?.iconUrl} />
            <span className="min-w-0 truncate">
              {card.footer?.text}
              {card.footer && time ? " · " : null}
              {time ? <time dateTime={card.timestamp}>{time}</time> : null}
            </span>
          </div>
        ) : null}
      </article>
    );
  }
);
