/* The member card's logic without its web components (GRYT-1630): the phone draws its own
   card from these, so both apps parse styles and pick colours the same way. */
export { BUILTIN_CARD_STYLES, randomCardStyle, styleSwatch } from "../memberCard/builtinStyles";
export type { BuiltinCardStyle } from "../memberCard/builtinStyles";
export {
  BIO_MAX,
  cardProfileOf,
  cardStyleForWire,
  cardText,
  DEFAULT_ANGLE,
  DEFAULT_CARD_STYLE,
  decodeCardStyle as decodeGrytCard,
  encodeCardStyle as encodeGrytCard,
  hexColour,
  normalizeCardStyle,
  PATTERN_FADES,
  PRONOUNS_MAX,
  sameCardStyle,
  STATUS_LINE_MAX,
  TUNING,
} from "../memberCard/cardStyle";
export type { CardFill, CardProfile, CardStyle, PatternFade } from "../memberCard/cardStyle";
export { cardVars, PATTERN_TEXT_CONTRAST, readablePatternAlpha } from "../memberCard/cardVars";
export type { CardVars, CardVarsOptions } from "../memberCard/cardVars";
export { bandColours, blend, contrast, fullColours, hexOf, lumOf, oklch, owlGradient } from "../memberCard/colour";
export type { BandColours, CardColourPick, FullCardColours } from "../memberCard/colour";
export { buttonLink, cardHeading, elapsed, gameIconUrl, partyText } from "../memberCard/gameCard";
export { CARD_PATTERNS, cardPattern, isTunable, PATTERN_GROUPS, patternId } from "../memberCard/patterns";
export type { CardPattern, PatternKind } from "../memberCard/patterns";
export { MARK_SIZE, patternLayers } from "../memberCard/patternSvg";
export type { PatternDraw, PatternLayers, PatternMark } from "../memberCard/patternSvg";
export type { RichActivity } from "../memberCard/richActivity";
export { scatter, seedFromId } from "../memberCard/scatter";
