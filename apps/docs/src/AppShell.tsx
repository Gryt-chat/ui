/* Hallmark · genre: modern-minimal · macrostructure: Catalogue (index) /
 * Long Document (content) / Component Playground (reference)
 * theme: custom (Gryt code-theme, OKLCH) · nav: N13 inline ⌘K search pill
 * footer: Ft2 inline single line · enrichment: none
 * design-system: design.md · designed-as-app
 */
import { ScrollArea } from "@gryt/ui";
import { ArrowSquareOut, List, X } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  CommandPalette,
  SearchPill,
  type PaletteEntry
} from "./components/CommandPalette";
import { DocsFooter } from "./components/DocsFooter";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { componentNavSections } from "./pages/componentDocs";
import { exampleNavSection } from "./pages/examples";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
  /**
   * The version this page arrived in. It wears a New tag until the library has
   * moved on a minor — so a patch keeps it and 0.12 clears it, without anybody
   * having to remember to take the tag off.
   */
  since?: string;
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
      { href: "/theme", label: "Theme" },
      { href: "/theme/generator", label: "Theme generator", since: "0.11.0" },
      { href: "/avatars", label: "Avatars", since: "0.19.0" },
      { href: "/avatars/drawing", label: "Drawing a cosmetic", since: "0.20.0" }
    ]
  },
  // Above the components, not below them. Someone arriving at a component
  // library wants to see it built into something before they read the props
  // table for Button.
  {
    title: exampleNavSection.title,
    items: exampleNavSection.items.map((item) => ({
      href: `/examples/${item.slug}`,
      label: item.name
    }))
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

/** Routes that render a tool rather than a document, and want the full width. */
const WIDE_ROUTES = ["/theme/generator"];

/**
 * Whether a page added in `since` is still new.
 *
 * Same major and minor as the version being documented, so a patch keeps the
 * tag and the next minor takes it off. Nobody has to remember, which is the
 * only way a "New" tag stays honest — the alternative is the one that is still
 * on the page a year later.
 */
function isNewIn(since: string | undefined, version: string): boolean {
  if (since === undefined) return false;
  const minor = (value: string) => value.split(".").slice(0, 2).join(".");
  return minor(since) === minor(version);
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();
  const wide = WIDE_ROUTES.includes(pathname);

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
          <aside className="relative flex h-full w-[min(21rem,calc(100vw-3rem))] flex-col border-r border-gryt-border bg-gryt-bg px-3 py-4">
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
            <ScrollArea.Root className="min-h-0 flex-1">
              <ScrollArea.Viewport>
                <ScrollArea.Content>
                  <Sidebar onNavigate={() => setDrawerOpen(false)} />
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" />
            </ScrollArea.Root>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-[92rem] grid-cols-1 px-4 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-0 flex h-dvh flex-col border-r border-gryt-border py-6 pr-6">
            <div className="mb-6 px-2">
              <BrandBlock />
            </div>
            <ScrollArea.Root className="min-h-0 flex-1">
              <ScrollArea.Viewport className="pb-6">
                <ScrollArea.Content>
                  <Sidebar />
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" />
            </ScrollArea.Root>
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
            {/* Not decoration. A component library that can only be read in
                its own colours is asking to be taken on trust. */}
            <div className="ml-auto hidden shrink-0 sm:block">
              <ThemeSwitcher />
            </div>
          </header>

          <main className="min-w-0 flex-1 py-(--space-xl)">
            {/* Prose wants a measure; a two-pane tool wants the room. The
                generator is the only page where the column cap is the wrong
                shape, so it opts out by name rather than every page carrying a
                width prop it does not need. */}
            <div
              className={
                wide ? "w-full" : "mx-auto w-full max-w-5xl"
              }
            >
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

/**
 * The sidebar, with the accent pill from vertical Tabs sliding between rows.
 *
 * Not the Tabs component itself, though it is the same effect and the same
 * spring. These are links: they change the URL, and a screen reader announcing
 * "tab" for something you can middle-click into a new window is a worse trade
 * than reimplementing thirty lines of measurement. So the pill is measured off
 * whichever row is current, the same way Base UI measures its own.
 */
function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navRef = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);
  // The first placement jumps rather than animating. Without this the pill
  // flies down from the top of the list on every page load, which reads as the
  // page still loading. State rather than a ref, because it decides what gets
  // rendered and a ref read during render is a stale read waiting to happen.
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (nav === null) return;

    const measure = () => {
      const active = nav.querySelector<HTMLElement>('[data-active="true"]');
      if (active === null) {
        setPill(null);
        setAnimate(false);
        return;
      }
      setPill({ top: active.offsetTop, height: active.offsetHeight });
    };

    measure();

    // The rows move when the sidebar is resized or a font finally loads, and a
    // pill measured against the old layout sits half a row off.
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [pathname]);

  // One frame after the pill first lands, so the class that would have
  // animated it into place arrives too late to do so.
  useEffect(() => {
    if (pill === null) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [pill]);

  return (
    <nav
      ref={navRef}
      aria-label="Documentation navigation"
      className="relative text-sm"
    >
      {pill ? (
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-x-0 z-0 rounded-(--gryt-radius-md) bg-gryt-accent",
            animate
              ? "transition-[translate,height] duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none"
              : ""
          ].join(" ")}
          style={{ height: pill.height, translate: `0 ${pill.top}px` }}
        />
      ) : null}
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

  // The fill lives on the pill in Sidebar so it can travel between rows, so the
  // row itself only changes its text colour — the same split Tabs makes between
  // Tab and Indicator. relative z-10 keeps the label above the pill rather than
  // under it.
  const className = [
    "relative z-10 flex min-h-9 items-center justify-between gap-3 rounded-(--gryt-radius-md) px-3 py-1.5 transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
    isActive
      ? "font-medium text-gryt-on-accent"
      : "text-gryt-muted hover:bg-white/4 hover:text-gryt-text"
  ].join(" ");

  const children = (
    <>
      <span className="truncate">{item.label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {isNewIn(item.since, __UI_VERSION__) ? (
          <span
            className={[
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              // On the accent pill the row already carries when it is current,
              // a filled tag would be a second fill on top of a fill.
              isActive
                ? "bg-gryt-on-accent/15 text-gryt-on-accent"
                : "bg-gryt-accent-3 text-gryt-accent-11"
            ].join(" ")}
          >
            New
          </span>
        ) : null}
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
      // What the pill measures against. aria-current would do, but only for
      // internal links — external ones are never current and the attribute
      // would have to be read as "absent means not active", which is one more
      // thing to get wrong than a boolean that is always there.
      data-active={isActive ? "true" : "false"}
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
