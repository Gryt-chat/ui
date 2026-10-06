/* What an owl or egg link carries (GRYT-1673): /avatars?name=…&worn=… and /eggs?seed=…. Parsed
   here so the page, its preview and the og service agree on what a link is. */
import { avatarSeed, decodeWorn, wornToOptions } from "@gryt/owl";

/** Long enough for any nickname, short enough that a link stays a link. */
const MAX_NAME = 64;

export interface SharedOwl {
  name: string;
  seed: string;
  /** Owl options for the look, or none for the owl the name draws on its own. */
  options: ReturnType<typeof wornToOptions> | undefined;
  worn: string | null;
}

/** The owl a link names, or null when it names none. A worn code that doesn't decode is ignored. */
export function sharedOwl(params: URLSearchParams): SharedOwl | null {
  const name = (params.get("name") ?? "").trim().slice(0, MAX_NAME);
  const seed = name ? avatarSeed(name) : null;
  if (!seed) return null;
  const worn = params.get("worn");
  const look = worn ? decodeWorn(worn) : null;
  return { name, seed, options: look ? wornToOptions(look) : undefined, worn: look ? worn : null };
}

/** The egg a link names: any seed, the way a server or group name seeds one. */
export function sharedEgg(params: URLSearchParams): string | null {
  const seed = (params.get("seed") ?? "").trim().slice(0, MAX_NAME);
  return seed || null;
}

/** The link that shows this owl, as the app's Copy link writes it. */
export function owlLink(name: string, worn: string | null): string {
  const q = new URLSearchParams({ name });
  if (worn) q.set("worn", worn);
  return `https://ui.gryt.chat/avatars?${q.toString()}`;
}
