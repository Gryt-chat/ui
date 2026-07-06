import { ArrowSquareOut, List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gryt-bg text-gryt-text">
      <button
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-40 grid size-11 place-items-center rounded-full border border-gryt-border bg-gryt-surface/95 text-gryt-muted shadow-[0_16px_48px_rgb(0_0_0/0.28)] backdrop-blur transition-colors hover:bg-white/5 hover:text-gryt-text lg:hidden"
        type="button"
        onClick={() => setDrawerOpen(true)}
      >
        <List size={19} />
      </button>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/55"
            type="button"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative h-full w-[min(22rem,calc(100vw-2rem))] overflow-y-auto border-r border-gryt-border bg-gryt-bg px-4 py-4 shadow-[0_24px_80px_rgb(0_0_0/0.42)]">
            <div className="mb-4 flex items-center justify-between px-2">
              <BrandBlock />
              <button
                aria-label="Close navigation"
                className="grid size-10 place-items-center rounded-full text-gryt-muted transition-colors hover:bg-white/5 hover:text-gryt-text"
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

      <div className="mx-auto grid w-full max-w-384 grid-cols-1 px-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10 lg:px-8 2xl:max-w-[104rem]">
        <aside className="hidden lg:block">
          <div className="sticky top-0 h-dvh overflow-y-auto border-r border-gryt-border/80 py-6 pr-5">
            <div className="mb-7 px-2">
              <BrandBlock />
            </div>
            <Sidebar />
          </div>
        </aside>

        <main className="min-w-0 py-10 lg:py-14">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function BrandBlock() {
  return (
    <Link
      className="block rounded-xl px-2 py-1 transition-colors hover:bg-white/5"
      to="/"
    >
      <span className="block text-xs font-semibold uppercase tracking-wider text-gryt-muted">
        Gryt Chat
      </span>
      <span className="mt-0.5 block text-2xl font-semibold tracking-normal text-gryt-text">
        Gryt UI
      </span>
    </Link>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation navigation" className="space-y-1 text-sm">
      {navSections.map((section) => (
        <section key={section.title} className="py-1">
          <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gryt-muted">
            {section.title}
          </h2>
          <ul className="space-y-0.5">
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
  const className = [
    "flex min-h-10 items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm transition-colors",
    isActive
      ? "bg-gryt-accent text-[#141126]"
      : "text-gryt-muted hover:bg-white/5 hover:text-gryt-text"
  ].join(" ");
  const children = (
    <>
      <span className="truncate">{item.label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {item.badge ? (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-gryt-muted">
            {item.badge}
          </span>
        ) : null}
        {isExternal ? (
          <ArrowSquareOut
            aria-hidden="true"
            className="opacity-75"
            size={15}
          />
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
    <Link className={className} to={item.href} onClick={onNavigate}>
      {children}
    </Link>
  );
}

function useIsActive(href: string) {
  const location = useLocation();
  const [path, hash = ""] = href.split("#");

  if (href.startsWith("http")) {
    return false;
  }

  if (hash) {
    return location.pathname === path && location.hash === `#${hash}`;
  }

  return location.pathname === path;
}
