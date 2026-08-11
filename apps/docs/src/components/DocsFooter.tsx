import { componentDocs } from "../pages/componentDocs";

// Ft2 · Inline single line. A hairline, a wordmark, a real count, one credit.
// No four-column link index — that footer is the AI fingerprint, and every
// destination it would list is already in the sidebar two inches to the left.
export function DocsFooter() {
  return (
    <footer className="mt-(--space-3xl) border-t border-gryt-border pt-(--space-md) pb-(--space-xl)">
      <div className="flex flex-col gap-2 text-sm text-gryt-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0">
          <span className="font-semibold text-gryt-text">Gryt UI</span> ·{" "}
          {componentDocs.length} components on Base UI and Tailwind
        </p>
        <p className="m-0">
          <a
            className="rounded-sm text-gryt-muted underline decoration-gryt-border underline-offset-4 transition-colors hover:text-gryt-text hover:decoration-gryt-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
            href="https://github.com/Gryt-chat/ui"
            rel="noreferrer"
            target="_blank"
          >
            Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
