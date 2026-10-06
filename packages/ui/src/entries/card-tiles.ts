/* Every tile pattern's paths, about 600 KB of source, apart from card-core so only an
   app that draws tiles pays for them. The web card loads the same file lazily. */
export { TILES } from "../memberCard/patterns/tiles.generated";
export type { Tile } from "../memberCard/patterns/tileTypes";
