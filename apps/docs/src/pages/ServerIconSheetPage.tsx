import {
  EGG_PATTERNS,
  PALETTE_NAMES,
  eggAvatarSvg,
  resolveEggs
} from "@gryt/owl";
import { useMemo } from "react";
import { Link } from "react-router-dom";

/**
 * Six hundred server icons on one page.
 *
 * Its own route rather than a section of the server-icons page, because the
 * documentation page should stay quick to open and this one is two megabytes of
 * markup by design. It is the contact sheet: the thing you look at to decide
 * whether the mix is right, which is a question a dozen samples cannot answer
 * and six hundred can.
 *
 * No controls. These are server icons and a server does not pick its own, so a
 * picker here would be a tool for a decision nobody makes.
 */

/** How many, and how big each one is drawn. */
const SHEET = 600;
const SIZE = 64;

/**
 * Stable seeds rather than random ones.
 *
 * The same rule the owls' sheet uses. A contact sheet is for judging the mix,
 * so the mix has to be the same every time somebody looks — a page that
 * reshuffles on reload cannot be compared against itself after a change.
 * `server-0` and its neighbours mean nothing beyond being six hundred different
 * strings.
 */
const seeds = Array.from({ length: SHEET }, (_, i) => `server-${i}`);

export function ServerIconSheetPage() {
  /*
   * Inline markup rather than six hundred `<img src="data:...">`.
   *
   * The same icons come to 2.0 MB inline and 2.8 MB once percent-encoded into
   * data URIs, and the browser then decodes six hundred separate documents
   * instead of parsing one. Every id in an icon carries a hash of its seed, so
   * six hundred of them in one document do not collide.
   *
   * Drawn once and memoised: the seeds never change, so re-running this on a
   * theme toggle would be 34 ms of work to produce the same string.
   */
  const markup = useMemo(
    () =>
      seeds
        .map((seed) => eggAvatarSvg(seed, { size: SIZE, cornerRadius: 0.2 }))
        .join(""),
    []
  );

  const counts = useMemo(() => {
    const arrangements = new Map<number, number>();
    const patterns = new Set<string>();
    const palettes = new Set<string>();
    let mixed = 0;

    for (const seed of seeds) {
      const c = resolveEggs(seed);
      arrangements.set(c.count, (arrangements.get(c.count) ?? 0) + 1);
      palettes.add(`${c.paletteName}/${c.scheme}`);
      if (c.eggs.some((e) => e.hue !== c.paletteName)) mixed += 1;
      for (const egg of c.eggs) if (egg.pattern) patterns.add(egg.pattern.name);
      if (c.field.pattern) patterns.add(c.field.pattern.name);
    }

    return {
      arrangements,
      patterns: patterns.size,
      palettes: palettes.size,
      mixed
    };
  }, []);

  return (
    <div className="w-full">
      <header className="mb-(--space-lg) max-w-[68ch]">
        <h1 className="font-display text-[length:var(--text-2xl)] tracking-[-0.022em]">
          {SHEET} server icons
        </h1>
        <p className="mt-(--space-xs) text-gryt-muted">
          Seeded <code>server-0</code> through <code>server-{SHEET - 1}</code>,
          drawn by <code>@gryt/owl</code> as you load the page. Six hundred is
          enough to see the mix: which arrangements crowd, which patterns turn
          up twice in a row, and whether any palette reads as another one from
          across the room.
        </p>
        <p className="mt-(--space-xs) text-gryt-muted">
          {counts.arrangements.get(1) ?? 0} have one egg,{" "}
          {counts.arrangements.get(2) ?? 0} have two and{" "}
          {counts.arrangements.get(3) ?? 0} have three. Between them they reach{" "}
          {counts.patterns} of the {EGG_PATTERNS.length} patterns and{" "}
          {counts.palettes} of the {PALETTE_NAMES.length * 3} palettes, and{" "}
          {counts.mixed} take one egg's tone from a second hue.{" "}
          <Link className="underline" to="/server-icons">
            How it works
          </Link>
          .
        </p>
      </header>

      {/*
        The markup goes in as one string rather than six hundred React elements.
        It is generated, it never changes, and handing React six hundred subtrees
        to reconcile on every render is work with nothing to show for it.

        Not `dangerously` in the sense that matters: nothing here comes from a
        user. The seeds are `server-0` upwards and the SVG is built by the
        library from constants, which is also why there is no sanitiser — there
        is no input to sanitise.
      */}
      <div
        aria-label={`${SHEET} generated server icons`}
        className="grid gap-(--space-xs) [grid-template-columns:repeat(auto-fill,minmax(64px,1fr))]"
        dangerouslySetInnerHTML={{ __html: markup }}
        role="img"
      />
    </div>
  );
}
