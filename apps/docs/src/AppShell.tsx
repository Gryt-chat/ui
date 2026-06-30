import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/installation", label: "Installation" },
  { href: "/theme", label: "Theme" },
  { href: "/components", label: "Components" },
  { href: "/components/button", label: "Button" },
  { href: "/components/inputs", label: "Inputs" },
  { href: "/components/chat", label: "Chat" },
  { href: "/components/message-bubble", label: "MessageBubble" }
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-gryt-bg text-gryt-text">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gryt-border bg-gryt-surface px-5 py-6 lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gryt-muted">
            Gryt Chat
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Gryt UI</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  "block rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gryt-accent text-[#141126]"
                    : "text-gryt-muted hover:bg-white/5 hover:text-gryt-text"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
