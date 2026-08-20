import { Link } from "react-router-dom";

/**
 * Reached two ways, and it has to read the same from both: an in-app
 * navigation to a path that matches nothing, and a cold load of a URL that does
 * not exist, which nginx answers with dist/404.html and a real 404 status.
 *
 * Before this existed the second case answered 200 with the front page, so
 * neither a status check nor a link checker could tell a typo from a page.
 */
export function NotFoundPage() {
  return (
    <article className="prose prose-invert max-w-[68ch] prose-headings:font-display prose-headings:tracking-[-0.022em] prose-h1:text-[length:var(--text-2xl)] prose-p:text-gryt-muted prose-p:leading-7 prose-a:text-gryt-text prose-a:decoration-gryt-border hover:prose-a:decoration-gryt-accent">
      <h1>Page not found</h1>
      <p className="lead text-[length:var(--text-md)]">
        There is nothing at this address.
      </p>
      <p>
        The component reference starts at{" "}
        <Link to="/components/button">Button</Link>, the whole screens are under{" "}
        <Link to="/examples">Examples</Link>, and{" "}
        <Link to="/installation">Installation</Link> is one package and one
        stylesheet import.
      </p>
    </article>
  );
}
