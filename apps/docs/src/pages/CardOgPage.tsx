/**
 * A shared card on its own, for its link preview (GRYT-1673). The og service on the Pi opens
 * this at 1200 by 630 and screenshots it, so the preview is the card the link describes.
 */
import { CardIcon, decodeGrytCard, DEFAULT_CARD_STYLE, MemberCard, setCardIconLoader } from "@gryt/ui";
import { avatarSeed, owlAvatarColour, owlAvatarDataUri } from "@gryt/owl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

setCardIconLoader(() => import("../lib/cardIcons"));

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const CARD_WIDTH = 340;

export function CardOgPage() {
  const [searchParams] = useSearchParams();
  const style = useMemo(() => decodeGrytCard(searchParams.toString()) ?? DEFAULT_CARD_STYLE, [searchParams]);
  const seed = avatarSeed("Gryt") ?? "gryt";
  const avatar = useMemo(() => owlAvatarDataUri(seed), [seed]);
  const card = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // As large as fits with a margin, whatever height the card's style gives it.
  useLayoutEffect(() => {
    const height = card.current?.offsetHeight ?? 0;
    if (height) setScale(Math.min((OG_HEIGHT - 80) / height, (OG_WIDTH - 160) / CARD_WIDTH, 2));
  }, [style]);

  // The service waits for this, so the screenshot isn't of half-loaded fonts or icons.
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
  }, [scale]);

  return (
    <div
      className="flex items-center justify-center bg-gryt-bg"
      style={{ width: OG_WIDTH, height: OG_HEIGHT, overflow: "hidden" }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        <div ref={card} style={{ width: CARD_WIDTH }}>
          <MemberCard
            appearance="dark"
            avatarSrc={avatar}
            avatarType="image"
            bannerUrl={null}
            bannerType="image"
            game={null}
            name="Gryt"
            owlHex={owlAvatarColour(seed)}
            profile={{ cardStyle: style, bio: "Build yours at ui.gryt.chat/card.", pronouns: null, statusLine: null }}
            seedKey="Gryt"
            status="online"
          >
            <div className="gmc-acts" aria-hidden="true">
              <span className="gmc-ib"><CardIcon.chat /></span>
              <span className="gmc-ib"><CardIcon.friend /></span>
              <span className="gmc-ib quiet"><CardIcon.at /></span>
              <span className="sp" />
              <span className="gmc-ib quiet"><CardIcon.more /></span>
            </div>
          </MemberCard>
        </div>
      </div>
    </div>
  );
}
