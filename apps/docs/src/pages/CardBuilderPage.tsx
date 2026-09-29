/* The member card, built here and shared as a link, the way the theme generator
 * shares a theme. The controls are MemberCardEditor from @gryt/ui, the same ones
 * the app puts in Edit my card, so a link from here pastes straight in there.
 */
import {
  type CardStyle,
  CardIcon,
  DEFAULT_CARD_STYLE,
  decodeGrytCard,
  encodeGrytCard,
  MemberCard,
  MemberCardEditor,
  type RichActivity,
  seedFromId,
  setCardIconLoader,
  TextField
} from "@gryt/ui";
import { avatarSeed, owlAvatarColour, owlAvatarDataUri } from "@gryt/owl";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSiteTheme } from "../lib/theme/siteTheme";

setCardIconLoader(() => import("../lib/cardIcons"));

const SAMPLE_GAME: RichActivity = {
  type: "playing",
  name: "Minecraft",
  details: "Harbourtown SMP",
  state: "Survival",
  party: { size: 2, max: 8 },
  startedAt: Date.now() - (23 * 60 + 41) * 1000
};

export function CardBuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Read once, like the theme generator: re-reading would fight the editor on every copy.
  const [style, setStyle] = useState<CardStyle>(() => decodeGrytCard(searchParams.toString()) ?? DEFAULT_CARD_STYLE);
  const [name, setName] = useState("Sivert");
  const [playing, setPlaying] = useState(true);
  const appearance = useSiteTheme().appearance;

  const seed = avatarSeed(name) ?? avatarSeed("Gryt") ?? "gryt";
  const owlHex = owlAvatarColour(seed);
  const avatar = useMemo(() => owlAvatarDataUri(seed), [seed]);

  const shareLink = (code: string) => {
    // The address bar moves with the button, so what gets pasted and what's on screen agree.
    setSearchParams(new URLSearchParams(code), { replace: true });
    return `${window.location.origin}${window.location.pathname}${code ? `?${code}` : ""}`;
  };

  return (
    <article className="flex min-w-0 flex-col gap-(--space-md)">
      <header className="max-w-[68ch]">
        <p className="m-0 font-mono text-xs tracking-wide text-gryt-accent-11">MemberCard</p>
        <h1 className="mt-2 font-display text-[length:var(--text-2xl)] font-semibold leading-tight tracking-[-0.022em] text-gryt-text">
          Build your own card
        </h1>
        <p className="mt-2 text-[length:var(--text-md)] leading-7 text-gryt-muted">
          The card people see when they hover your name in Gryt. Pick a colour and a pattern, tune it, and
          copy the link. Paste it into Edit my card in the app and your card looks like this.
        </p>
      </header>

      <div className="grid min-w-0 items-start gap-(--space-md) lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="min-w-0 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-2 lg:sticky lg:top-20">
          <MemberCardEditor
            appearance={appearance}
            nickname={name}
            onChange={setStyle}
            owlHex={owlHex}
            seed={seedFromId(name)}
            shareLink={shareLink}
            value={style}
          />
        </aside>

        <section className="flex min-w-0 flex-col items-start gap-4 lg:sticky lg:top-20">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-xs font-bold text-gryt-muted">
              Name on the card
              <TextField value={name} onChange={(e) => setName(e.target.value.slice(0, 32))} />
            </label>
            <label className="flex items-center gap-2 text-sm text-gryt-text">
              <input type="checkbox" checked={playing} onChange={(e) => setPlaying(e.target.checked)} />
              Playing a game
            </label>
          </div>
          <div style={{ width: 340, maxWidth: "100%" }}>
            <MemberCard
              appearance={appearance}
              avatarSrc={avatar}
              game={playing ? SAMPLE_GAME : null}
              name={name || "Gryt"}
              owlHex={owlHex}
              profile={{ cardStyle: style, bio: "Mostly on after nine.", pronouns: null, statusLine: "Around tonight for co-op." }}
              seedKey={name}
              status="online"
            >
              <div className="gmc-acts" aria-hidden="true">
                <span className="gmc-ib"><CardIcon.chat /></span>
                <span className="gmc-ib"><CardIcon.friend /></span>
                <span className="gmc-ib quiet"><CardIcon.at /></span>
                <span className="sp" />
                <span className="gmc-ib danger"><CardIcon.flag /></span>
                <span className="gmc-ib quiet"><CardIcon.more /></span>
              </div>
            </MemberCard>
          </div>
          <code className="max-w-full break-all font-mono text-xs text-gryt-muted">{encodeGrytCard(style) || "(the default card)"}</code>
        </section>
      </div>
    </article>
  );
}
