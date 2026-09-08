/**
 * The seed a person's avatar is drawn from. Its own file because two apps have to agree
 * on it exactly; `generatedAvatar.ts` re-exports it.
 */

/**
 * Their nickname, normalised: case and surrounding whitespace dropped. The nickname rather
 * than the per-server id, which made the same person unrecognisable in every server.
 */
export function avatarSeed(nickname: string | null | undefined): string | undefined {
  const trimmed = nickname?.trim().toLowerCase();
  return trimmed ? trimmed : undefined;
}
