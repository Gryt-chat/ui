/* The member card, built here and shared as a link, the way the theme generator
 * shares a theme. The controls are MemberCardEditor from @gryt/ui, the same ones
 * the app puts in Edit my card, so a link from here pastes straight in there.
 */
import {
  Button,
  type CardStyle,
  CardIcon,
  CopyCardLink,
  DEFAULT_CARD_STYLE,
  decodeGrytCard,
  encodeGrytCard,
  MemberCard,
  MemberCardEditor,
  randomCardStyle,
  type RichActivity,
  seedFromId,
  Select,
  setCardIconLoader,
  TextField
} from "@gryt/ui";
import { avatarSeed, owlAvatarColour, owlAvatarDataUri } from "@gryt/owl";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSiteTheme } from "../lib/theme/siteTheme";

setCardIconLoader(() => import("../lib/cardIcons"));

/* Real games to try the band with. */
const SAMPLE_GAMES: { id: string; name: string; details: string; state: string; party?: [number, number] }[] = [
  { id: "1158877933042143272", name: "Counter-Strike 2", details: "Premier · Ancient", state: "In a match", party: [5, 5] },
  { id: "356875988589740042", name: "Dota 2", details: "Ranked All Pick", state: "Playing Invoker", party: [3, 5] },
  { id: "1137125502985961543", name: "Baldur's Gate III", details: "Act II · Moonrise Towers", state: "Co-op", party: [2, 4] },
  { id: "1402418436809953330", name: "ELDEN RING", details: "Limgrave", state: "Level 42" },
  { id: "1124358970618953818", name: "Valheim", details: "The Black Forest", state: "Building a longhouse", party: [4, 10] },
  { id: "359509387670192128", name: "Stardew Valley", details: "Summer 12, Year 2", state: "Pelican Town", party: [2, 4] },
  { id: "1402418344912752671", name: "Terraria", details: "Expert world", state: "Fighting the Eye of Cthulhu", party: [3, 8] },
  { id: "1402418594532298837", name: "Rust", details: "Rustafied EU Main", state: "Online for 3 hours" },
  { id: "1402418717781921935", name: "PUBG: BATTLEGROUNDS", details: "Erangel · Squad", state: "34 left", party: [4, 4] }
];

const STARTED = Date.now() - (23 * 60 + 41) * 1000;

function sampleGame(id: string): RichActivity {
  const g = SAMPLE_GAMES.find((x) => x.id === id) ?? SAMPLE_GAMES[0];
  return {
    type: "playing",
    name: g.name,
    appId: g.id,
    details: g.details,
    state: g.state,
    party: g.party ? { size: g.party[0], max: g.party[1] } : undefined,
    startedAt: STARTED
  };
}

export function CardBuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Read once, like the theme generator: re-reading would fight the editor on every copy.
  const [style, setStyle] = useState<CardStyle>(() => decodeGrytCard(searchParams.toString()) ?? DEFAULT_CARD_STYLE);
  const [name, setName] = useState("Sivert");
  const [playing, setPlaying] = useState(true);
  const [gameId, setGameId] = useState(SAMPLE_GAMES[0].id);
  // Pictures picked here stay in this browser as object URLs; nothing is uploaded.
  const [ownAvatar, setOwnAvatar] = useState<string | null>(null);
  const [ownBanner, setOwnBanner] = useState<string | null>(null);
  useEffect(() => () => { if (ownAvatar) URL.revokeObjectURL(ownAvatar); }, [ownAvatar]);
  useEffect(() => () => { if (ownBanner) URL.revokeObjectURL(ownBanner); }, [ownBanner]);
  const pick = (set: (url: string | null) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && file.type.startsWith("image/")) set(URL.createObjectURL(file));
  };
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

      <div className="grid min-w-0 items-start gap-(--space-md) xl:grid-cols-[minmax(0,1fr)_23rem]">
        <aside className="flex min-w-0 overflow-hidden rounded-(--gryt-radius-lg) border border-gryt-border xl:sticky xl:top-20 xl:h-[min(40rem,calc(100dvh-6rem))]">
          <MemberCardEditor
            appearance={appearance}
            bannerUrl={ownBanner}
            nickname={name}
            onChange={setStyle}
            owlHex={owlHex}
            seed={seedFromId(name)}
            value={style}
          />
        </aside>

        <section className="flex min-w-0 flex-col items-start gap-4 xl:sticky xl:top-20">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-xs font-bold text-gryt-muted">
              Name on the card
              <TextField value={name} onChange={(e) => setName(e.target.value.slice(0, 32))} />
            </label>
            <label className="flex items-center gap-2 text-sm text-gryt-text">
              <input type="checkbox" checked={playing} onChange={(e) => setPlaying(e.target.checked)} />
              Playing
            </label>
            {playing && (
              <Select
                aria-label="Game"
                value={gameId}
                onValueChange={(v) => setGameId(String(v))}
                options={SAMPLE_GAMES.map((g) => ({ value: g.id, label: g.name }))}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="small" onClick={() => setStyle(randomCardStyle())}>
              Surprise me
            </Button>
            <CopyCardLink style={style} link={shareLink} />
            <label className="cursor-pointer rounded-md border border-gryt-border bg-gryt-surface-raised px-2.5 py-1 text-xs font-bold text-gryt-text hover:bg-gryt-surface-hover">
              {ownAvatar ? "Change avatar" : "Try your avatar"}
              <input type="file" accept="image/*" className="hidden" onChange={pick(setOwnAvatar)} />
            </label>
            <label className="cursor-pointer rounded-md border border-gryt-border bg-gryt-surface-raised px-2.5 py-1 text-xs font-bold text-gryt-text hover:bg-gryt-surface-hover">
              {ownBanner ? "Change banner" : "Try a banner"}
              <input type="file" accept="image/*" className="hidden" onChange={pick(setOwnBanner)} />
            </label>
            {(ownAvatar || ownBanner) && (
              <Button size="small" tone="neutral" onClick={() => { setOwnAvatar(null); setOwnBanner(null); }}>
                Back to the owl
              </Button>
            )}
          </div>
          <span className="text-xs text-gryt-muted">Pictures you pick stay in your browser. Nothing is uploaded.</span>
          <div style={{ width: 340, maxWidth: "100%" }}>
            <MemberCard
              appearance={appearance}
              avatarSrc={ownAvatar ?? avatar}
              bannerUrl={ownBanner}
              game={playing ? sampleGame(gameId) : null}
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
