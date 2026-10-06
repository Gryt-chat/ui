/**
 * An owl or an egg on its own, for its link preview (GRYT-1673). The og service opens these at
 * 1200 by 630 and screenshots them, like the card's, so a shared link shows what it shares.
 */
import { eggAvatarColour, eggAvatarDataUri, owlAvatarColour, owlAvatarDataUri } from "@gryt/owl";
import { type ReactNode, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { sharedEgg, sharedOwl } from "../lib/sharedLook";
import { OG_HEIGHT, OG_WIDTH } from "./CardOgPage";

/** Tells the service the page is drawn, once fonts are in, so it doesn't capture a half page. */
function useOgReady() {
  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!cancelled) document.body.dataset.ogReady = "1";
      })),
    );
    return () => {
      cancelled = true;
    };
  }, []);
}

/** The picture on the left, words on the right, on a wash of the picture's own colour. */
function Frame({ colour, picture, title, line }: { colour: string; picture: ReactNode; title: string; line: string }) {
  return (
    <div
      className="flex items-center gap-16 bg-gryt-bg px-24"
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        overflow: "hidden",
        backgroundImage: `radial-gradient(circle at 28% 50%, color-mix(in oklch, ${colour} 45%, transparent), transparent 62%)`,
      }}
    >
      <div className="shrink-0 overflow-hidden rounded-[96px] shadow-2xl" style={{ width: 400, height: 400 }}>
        {picture}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="font-display text-[64px] leading-[1.05] font-bold tracking-[-0.03em] text-gryt-text [overflow-wrap:anywhere]">{title}</div>
        <div className="text-[28px] text-gryt-muted">{line}</div>
      </div>
    </div>
  );
}

export function OwlOgPage() {
  const [params] = useSearchParams();
  const owl = useMemo(() => sharedOwl(params), [params]);
  useOgReady();
  const seed = owl?.seed ?? "gryt";
  return (
    <Frame
      colour={owlAvatarColour(seed, owl?.options)}
      picture={<img alt="" src={owlAvatarDataUri(seed, { size: 400, ...owl?.options })} width={400} height={400} />}
      title={owl ? `${owl.name}'s owl` : "A Gryt owl"}
      line={owl?.worn ? "Dressed up in Gryt. Design yours at ui.gryt.chat" : "Every name draws its own owl in Gryt"}
    />
  );
}

export function EggOgPage() {
  const [params] = useSearchParams();
  const seed = useMemo(() => sharedEgg(params) ?? "gryt", [params]);
  useOgReady();
  return (
    <Frame
      colour={eggAvatarColour(seed)}
      picture={<img alt="" src={eggAvatarDataUri(seed, { size: 400 })} width={400} height={400} />}
      title={seed}
      line="Groups and servers in Gryt hatch from an egg"
    />
  );
}
