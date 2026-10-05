"use client";

import "./memberCard.css";

import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";

import type { RichActivity } from "../../memberCard/richActivity";
import { buttonLink, cardHeading, elapsed, gameIconUrl } from "../../memberCard/gameCard";
import type { CardProfile } from "../../memberCard/cardStyle";
import { cardVars } from "../../memberCard/cardVars";
import { seedFromId } from "../../memberCard/scatter";
import { CardIcon } from "./cardIcons";
import { usePatternAssets } from "./patternAssets";
import type { EmojiPickerGroup } from "../EmojiPicker/EmojiPicker";

/** Presence as the ring and the status line draw it. Offline gets no ring at all. */
/** Presence, as the app knows it. */
export type MemberCardStatus = "online" | "idle" | "dnd" | "offline" | "in_voice" | "invisible";

const STATUS: Record<string, { label: string; ring: string }> = {
  in_voice: { label: "In Voice", ring: "var(--gryt-accent)" },
  online: { label: "Online", ring: "var(--gryt-success)" },
  afk: { label: "AFK", ring: "var(--gryt-warning)" },
  offline: { label: "Offline", ring: "transparent" },
};

/** More seats than this and the pips would be a ruler, so only the words show. */
const MAX_PIPS = 16;

export interface CardChip {
  id: string;
  name: string;
  amber?: boolean;
}

export interface MemberCardViewProps {
  name: string;
  avatarSrc?: string;
  /** Makes the picture a button, for opening it larger. Without it the picture is just a picture. */
  onAvatarClick?: () => void;
  status: MemberCardStatus | string;
  channelName?: string;
  /** Something beside the name, like the app's bot tag. */
  badge?: ReactNode;
  profile: CardProfile;
  /** The owl's colour, the card's colour until they pick one. */
  owlHex: string;
  bannerUrl?: string | null;
  /** Videos autoplay silently and loop; images keep the existing background path. */
  bannerType?: "image" | "video";
  game?: RichActivity | null;
  chips?: CardChip[];
  appearance: "light" | "dark";
  /** Seeds a scatter pattern, so everybody sees the same one: the member's id. */
  seedKey: string;
  /** Their designed look, for the my-owl pattern. */
  worn?: string | null;
  /** Custom emoji from the server this card belongs to. */
  emojiGroups?: readonly EmojiPickerGroup[];
  /** Lets a menu hang out of the card instead of being cut off at its edge. */
  menuOpen?: boolean;
  /** The actions row, the moderation row and the drawer. */
  children?: ReactNode;
}

/** Without a picture or a pattern the tall banner is an empty block of colour, so it shrinks to fit the name. */
function hasPattern(style: MemberCardViewProps["profile"]["cardStyle"]): boolean {
  return !!style?.pattern && style.pattern !== "none";
}

export function MemberCardView({
  name,
  avatarSrc,
  onAvatarClick,
  status,
  channelName,
  badge,
  profile,
  owlHex,
  bannerUrl,
  bannerType = "image",
  game,
  chips = [],
  appearance,
  seedKey,
  worn,
  emojiGroups = [],
  menuOpen,
  children,
}: MemberCardViewProps) {
  const assets = usePatternAssets(profile.cardStyle, { nickname: name, worn }, emojiGroups);
  const { attrs, vars } = useMemo(
    () => cardVars(profile.cardStyle, owlHex, { appearance, seed: seedFromId(seedKey), ...assets }),
    [profile.cardStyle, owlHex, appearance, seedKey, assets],
  );
  const presence = STATUS[status] ?? STATUS.online;
  const playing = !!game && status !== "offline";
  const line = !playing && profile.statusLine ? profile.statusLine : null;
  const hasBand = playing || !!line;

  const style = { ...vars } as CSSProperties & Record<string, string>;
  if (bannerUrl && bannerType === "image") style["--img"] = `url("${bannerUrl.replace(/["\\]/g, "")}")`;

  return (
    <div
      className={["gmc-frame", menuOpen ? "menu-open" : ""].filter(Boolean).join(" ")}
      data-fc={attrs["data-fc"]}
      style={style}
    >
      <article
        className={["gmc", playing ? "playing" : "", hasBand ? "has-band" : "", menuOpen ? "menu-open" : ""].filter(Boolean).join(" ")}
        data-appearance={appearance}
        data-gryt="member-card"
        {...attrs}
        // Here as well as on the frame: .gmc sets its own defaults for some of these, which would win over inherited ones.
        style={style}
      >
      <div className={["gmc-banner", bannerUrl ? (bannerType === "video" ? "video" : "img") : "", !bannerUrl && !hasPattern(profile.cardStyle) ? "short" : ""].filter(Boolean).join(" ")}>
        {bannerUrl && bannerType === "video" && (
          <video className="gmc-banner-media" src={bannerUrl} autoPlay loop muted playsInline preload="metadata" aria-hidden="true" />
        )}
        <div className="gmc-over">
          {onAvatarClick && avatarSrc ? (
            <button
              type="button"
              className="gmc-av gmc-av-btn"
              aria-label={`Open ${name}'s picture`}
              onClick={onAvatarClick}
              style={{ "--s": "64px", "--ring": presence.ring } as CSSProperties}
            >
              <img alt="" src={avatarSrc} />
            </button>
          ) : (
            <span className="gmc-av" style={{ "--s": "64px", "--ring": presence.ring } as CSSProperties}>
              {avatarSrc ? <img alt="" src={avatarSrc} /> : <img alt="" />}
            </span>
          )}
          <div>
            <div className="gmc-nm">
              {name}
              {badge}
            </div>
            <div>
              <span className="gmc-st" style={{ color: status === "offline" ? "var(--gryt-muted)" : presence.ring }}>
                {presence.label}
              </span>
              {status === "in_voice" && channelName && <span className="gmc-st gmc-mut"> · {channelName}</span>}
            </div>
          </div>
        </div>
      </div>

      {playing && game ? (
        <GameBand card={game} />
      ) : line ? (
        <section className="gmc-band">
          <span className="gmc-band-verb">Status</span>
          <div className="gmc-line">{line}</div>
        </section>
      ) : null}

        <div className="gmc-body">
        {profile.pronouns && (
          <div>
            <span className="gmc-pro">{profile.pronouns}</span>
          </div>
        )}
        {profile.bio && <p className="gmc-bio">{profile.bio}</p>}
        {chips.length > 0 && (
          <div className="gmc-chips">
            {chips.map((chip) => (
              <span key={chip.id} className={chip.amber ? "gmc-chip amber" : "gmc-chip"}>
                {chip.name}
              </span>
            ))}
          </div>
        )}
        {children}
        </div>
      </article>
    </div>
  );
}

/** A game's Rich Presence, as the band between the banner and the rest of the card. */
function GameBand({ card }: { card: RichActivity }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (card.startedAt === undefined) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [card.startedAt]);

  const time = elapsed(card.startedAt, now);
  const verb = cardHeading(card);
  const party = card.party;
  const links = (card.buttons ?? [])
    .map((button) => ({ label: button.label, link: buttonLink(button.url) }))
    .filter((b): b is { label: string; link: { href: string; host: string } } => b.link !== null);

  return (
    <section className="gmc-band gmc-game-activity" aria-label={`${verb} ${card.name}`}>
      <div className="gmc-band-top">
        <span className="gmc-band-verb">{verb}</span>
        {time && (
          <span className="gmc-band-time">
            <time className="el" dateTime={new Date(card.startedAt ?? now).toISOString()}>{time}</time>
          </span>
        )}
      </div>
      <div className="gmc-band-game">
        <div>
          <b>{card.name}</b>
          {card.details && <span>{card.details}</span>}
          {card.state && <span className="gmc-mut">{card.state}</span>}
        </div>
        <GameIconSlot appId={card.appId} />
      </div>
      {party && (
        <div className="gmc-party">
          {party.max && party.max <= MAX_PIPS && (
            <span className="gmc-pips" aria-hidden="true">
              {Array.from({ length: party.max }, (_, i) => <i key={i} className={i < party.size ? "on" : undefined} />)}
            </span>
          )}
          <span>{party.max ? `${party.size} of ${party.max} in party` : `${party.size} in party`}</span>
        </div>
      )}
      {links.map(({ label, link }) => (
        <a key={link.href} className="gmc-glink solid" href={link.href} target="_blank" rel="noopener noreferrer" title={link.href}>
          {label}
          <span>{link.host}</span>
        </a>
      ))}
    </section>
  );
}

/** The mirrored icon, drawn over the empty slot so the pad shows until it loads, or if it never does. */
function GameIconSlot({ appId }: { appId?: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const url = gameIconUrl(appId);
  const size = { "--g": "56px" } as CSSProperties;
  const loaded = !!url && state === "loaded";
  return (
    <span className={loaded ? "gmc-gicon img" : "gmc-gicon"} role={loaded ? undefined : "img"} aria-label={loaded ? undefined : "No game icon"} style={size}>
      {!loaded && <CardIcon.pad />}
      {url && state !== "failed" && (
        <img
          alt=""
          src={url}
          style={loaded ? undefined : { position: "absolute", inset: 0, opacity: 0 }}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
        />
      )}
    </span>
  );
}
