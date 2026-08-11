/* Hallmark · genre: modern-minimal · macrostructure: Catalogue (index) /
 * Long Document (content) / Component Playground (reference)
 * theme: custom (Gryt code-theme, OKLCH) · nav: N13 inline ⌘K search pill
 * footer: Ft2 inline single line · enrichment: none
 * design-system: design.md · designed-as-app
 */
import { ArrowSquareOut, List, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  CommandPalette,
  SearchPill,
  type PaletteEntry
} from "./components/CommandPalette";
import { DocsFooter } from "./components/DocsFooter";
import { componentNavSections } from "./pages/componentDocs";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Docs",
    items: [
      { href: "/", label: "Overview" },
      { href: "/installation", label: "Installation" },
      { href: "/theme", label: "Theme" }
    ]
  },
  ...componentNavSections.map((section) => ({
    title: section.title,
    items: section.items.map((item) => ({
      href: `/components/${item.slug}`,
      label: item.name
    }))
  })),
  {
    title: "Resources",
    items: [
      {
        href: "https://github.com/Gryt-chat/gryt",
        label: "Gryt",
        badge: "GitHub"
      },
      { href: "https://github.com/Gryt-chat/client", label: "Client" },
      { href: "https://github.com/Gryt-chat/code-theme", label: "Code theme" }
    ]
  }
];

const paletteEntries: PaletteEntry[] = navSections
  .filter((section) => section.title !== "Resources")
  .flatMap((section) =>
    section.items.map((item) => ({
      group: section.title,
      label: item.label,
      href: item.href
    }))
  );

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gryt-bg text-gryt-text">
      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/65"
            type="button"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative h-full w-[min(21rem,calc(100vw-3rem))] overflow-y-auto border-r border-gryt-border bg-gryt-bg px-3 py-4">
            <div className="mb-4 flex items-center justify-between gap-2 px-2">
              <BrandBlock />
              <button
                aria-label="Close navigation"
                className="grid size-10 shrink-0 place-items-center rounded-full text-gryt-muted transition-colors hover:bg-white/5 hover:text-gryt-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
                type="button"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-[92rem] grid-cols-1 px-4 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-0 flex h-dvh flex-col border-r border-gryt-border py-6 pr-6">
            <div className="mb-6 px-2">
              <BrandBlock />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-6">
              <Sidebar />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-40 -mx-4 flex items-center gap-3 border-b border-gryt-border bg-gryt-bg/90 px-4 py-3 backdrop-blur lg:mx-0 lg:px-0">
            <button
              aria-label="Open navigation"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-gryt-border text-gryt-muted transition-colors hover:text-gryt-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light lg:hidden"
              type="button"
              onClick={() => setDrawerOpen(true)}
            >
              <List size={18} />
            </button>
            <SearchPill onOpen={() => setPaletteOpen(true)} />
          </header>

          <main className="min-w-0 flex-1 py-(--space-xl)">
            <div className="mx-auto w-full max-w-5xl">
              <Outlet />
              <DocsFooter />
            </div>
          </main>
        </div>
      </div>

      {paletteOpen ? (
        <CommandPalette
          entries={paletteEntries}
          onClose={() => setPaletteOpen(false)}
        />
      ) : null}
    </div>
  );
}

function BrandBlock() {
  return (
    <Link
      className="block min-w-0 rounded-(--gryt-radius-md) px-2 py-1 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
      to="/"
    >
      <span className="block font-display text-xl font-semibold tracking-tight text-gryt-text">
        Gryt UI
      </span>
      <span className="block text-xs text-gryt-muted">
        Components for Gryt Chat
      </span>
    </Link>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation navigation" className="text-sm">
      {navSections.map((section) => (
        <section key={section.title} className="pb-4">
          <h2 className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
            {section.title}
          </h2>
          <ul>
            {section.items.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}

function SidebarLink({
  item,
  onNavigate
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const isExternal = item.href.startsWith("http");
  const isActive = useIsActive(item.href);

  // The active row is marked with an accent rule and a colour shift rather than
  // a filled pill. At 27 rows a filled pill is a block of accent in the corner
  // of every screen, which spends the whole accent budget on "you are here".
  const className = [
    "flex min-h-9 items-center justify-between gap-3 rounded-(--gryt-radius-md) border-l-2 px-3 py-1.5 transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
    isActive
      ? "border-l-gryt-accent bg-gryt-surface font-medium text-gryt-text"
      : "border-l-transparent text-gryt-muted hover:bg-white/4 hover:text-gryt-text"
  ].join(" ");

  const children = (
    <>
      <span className="truncate">{item.label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {item.badge ? (
          <span className="rounded-full border border-gryt-border px-2 py-0.5 text-[10px] text-gryt-muted">
            {item.badge}
          </span>
        ) : null}
        {isExternal ? (
          <ArrowSquareOut aria-hidden="true" className="opacity-70" size={14} />
        ) : null}
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        aria-label={`${item.label} (opens in a new tab)`}
        className={className}
        href={item.href}
        onClick={onNavigate}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={className}
      to={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

function useIsActive(href: string) {
  const location = useLocation();

  return useMemo(() => {
    if (href.startsWith("http")) {
      return false;
    }
    return location.pathname === href;
  }, [href, location.pathname]);
}
