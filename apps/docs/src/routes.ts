/* Every concrete path this site serves, as plain data.
 *
 * There used to be two lists that had to agree and had no way of noticing when
 * they did not: the router's, in main.tsx, and `ogPages`, which is only the
 * subset of routes that get a share card. nginx papered over the gap by falling
 * back to /index.html, so a path that did not exist answered 200 and rendered
 * React Router's own "404 Not Found". A status check called a missing page fine,
 * and crawlers indexed every typo as a duplicate of the front page.
 *
 * nginx now returns a real 404 for anything it cannot find on disk, which only
 * works if the filesystem holds every real route. This is that list.
 * scripts/prerender.ts writes a file per entry and fails the build if `ogPages`
 * names a route that is not here. Adding a route means adding it here too.
 *
 * No @gryt/ui import, for the same reason componentMeta.ts has none: a Bun build
 * script reads this, and @gryt/ui imports CSS.
 */

import { componentDocs } from "./componentMeta";
import { exampleDocs } from "./exampleMeta";

/**
 * Routes with nothing substituted into them. "" is the root.
 *
 * `components` and `examples` redirect into their first child the moment React
 * takes over, but they still need a file. Without one nginx would 404 a path
 * the router handles perfectly well.
 */
export const staticRoutes = [
  "",
  "installation",
  "theme",
  "theme/generator",
  "avatars",
  "avatars/drawing",
  "components",
  "examples"
];

/** Every path nginx should serve, without leading slashes. */
export const docsRoutes: string[] = [
  ...staticRoutes,
  ...componentDocs.map((doc) => `components/${doc.slug}`),
  ...exampleDocs.flatMap((doc) => [
    `examples/${doc.slug}`,
    // The full-screen variant lives outside the shell and is the same example,
    // so it is written to disk but kept out of search results.
    `examples/${doc.slug}/full`
  ])
];
