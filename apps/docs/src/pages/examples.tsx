import { Chip, Tabs } from "@gryt/ui";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";

import type { ExampleDoc } from "../exampleMeta";
import { exampleDocs } from "../exampleMeta";

import { ChatPanel } from "../examples/ChatPanel";
import { ServerSidebar } from "../examples/ServerSidebar";
import { SettingsBody, SettingsModal } from "../examples/SettingsModal";
import { SignInScreen } from "../examples/SignInScreen";
import { VoicePanel } from "../examples/VoicePanel";

// The source is read from the files above rather than retyped into a string.
// A component page can get away with a hand-written snippet because it is five
// lines; an example is two hundred, and the first time one of them drifted
// nobody would notice.
import chatPanelSource from "../examples/ChatPanel.tsx?raw";
import serverSidebarSource from "../examples/ServerSidebar.tsx?raw";
import settingsModalSource from "../examples/SettingsModal.tsx?raw";
import shaderBackgroundSource from "../examples/ShaderBackground.tsx?raw";
import shaderSource from "../examples/shader.ts?raw";
import signInCssSource from "../examples/signIn.css?raw";
import signInSource from "../examples/SignInScreen.tsx?raw";
import voicePanelSource from "../examples/VoicePanel.tsx?raw";

export type { ExampleDoc } from "../exampleMeta";
export { exampleDocs } from "../exampleMeta";

interface SourceFile {
  name: string;
  language: string;
  code: string;
}

interface ExampleParts {
  render: () => ReactElement;
  files: SourceFile[];
}

const tsx = (name: string, code: string): SourceFile => ({
  name,
  language: "tsx",
  code
});

const partsBySlug: Record<string, ExampleParts> = {
  "sign-in": {
    render: () => <SignInScreen />,
    files: [
      tsx("SignInScreen.tsx", signInSource),
      { name: "signIn.css", language: "css", code: signInCssSource },
      tsx("ShaderBackground.tsx", shaderBackgroundSource),
      { name: "shader.ts", language: "typescript", code: shaderSource }
    ]
  },
  "settings-modal": {
    // The dialog is rendered open and inline rather than behind its trigger.
    // A page whose preview is one button, with everything worth looking at
    // behind a click, is not showing you the example.
    render: () => (
      <div className="h-full bg-gryt-bg p-4">
        <div className="mx-auto h-full max-w-4xl overflow-hidden rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface">
          <SettingsBody />
        </div>
      </div>
    ),
    files: [tsx("SettingsModal.tsx", settingsModalSource)]
  },
  "chat-panel": {
    render: () => <ChatPanel />,
    files: [tsx("ChatPanel.tsx", chatPanelSource)]
  },
  "voice-panel": {
    render: () => <VoicePanel />,
    files: [tsx("VoicePanel.tsx", voicePanelSource)]
  },
  "server-sidebar": {
    // Shown against an empty channel area. A sidebar on its own in a wide box
    // is not what it looks like in use, and it is the pairing that shows the
    // rail is a fixed width while the rest gives.
    render: () => (
      <div className="flex h-full bg-gryt-bg">
        <ServerSidebar />
        <div className="hidden flex-1 items-center justify-center p-6 text-sm text-gryt-muted sm:flex">
          The channel goes here.
        </div>
      </div>
    ),
    files: [tsx("ServerSidebar.tsx", serverSidebarSource)]
  }
};

export const exampleNavSection = {
  title: "Examples",
  items: exampleDocs.map((doc) => ({ name: doc.name, slug: doc.slug }))
};

const docsBySlug = new Map(exampleDocs.map((doc) => [doc.slug, doc]));

const stageHeight: Record<ExampleDoc["stage"], string> = {
  tall: "h-[40rem] max-h-[80vh]",
  medium: "h-[32rem] max-h-[75vh]",
  auto: "min-h-[20rem]"
};

export function ExamplePage() {
  const { example } = useParams();
  const doc = example ? docsBySlug.get(example) : undefined;

  if (!doc) {
    return <Navigate replace to={`/examples/${exampleDocs[0].slug}`} />;
  }

  const parts = partsBySlug[doc.slug];
  const index = exampleDocs.findIndex((entry) => entry.slug === doc.slug);
  const previous = exampleDocs[index - 1];
  const next = exampleDocs[index + 1];

  return (
    <article>
      <header className="pb-(--space-md)">
        <p className="m-0 font-mono text-xs tracking-wide text-gryt-accent">
          Example
        </p>
        <h1 className="mt-2 font-display text-[length:var(--text-2xl)] font-semibold leading-tight tracking-[-0.022em] text-gryt-text">
          {doc.name}
        </h1>
        <p className="mt-2 max-w-[62ch] text-[length:var(--text-md)] leading-7 text-gryt-muted">
          {doc.description}
        </p>
      </header>

      <p className="m-0 max-w-[68ch] text-[length:var(--text-md)] leading-7 text-gryt-muted">
        {doc.blurb}
      </p>

      <ul className="mt-(--space-md) flex list-none flex-wrap gap-2 p-0">
        {doc.uses.map((name) => (
          <li key={name}>
            <Link to={`/components/${slugFor(name)}`}>
              <Chip label={name} />
            </Link>
          </li>
        ))}
      </ul>

      {/* The example runs at whatever width the page gives it. The full-screen
          link is not decoration: the sign-in screen is a page, and judging a
          page inside a 700px column is judging the wrong thing. */}
      <div className="mt-(--space-md) overflow-hidden rounded-(--gryt-radius-xl) border border-gryt-border">
        <div className={`${stageHeight[doc.stage]} w-full`}>
          {parts.render()}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gryt-muted">
        <span>Live, not a screenshot. Everything here is interactive.</span>
        <a
          className="inline-flex items-center gap-1.5 rounded-(--gryt-radius-md) px-2 py-1 text-gryt-text hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
          href={`/examples/${doc.slug}/full`}
          rel="noreferrer"
          target="_blank"
        >
          Open full screen
          <ArrowSquareOut aria-hidden="true" size={13} />
        </a>
      </div>

      <SourceTabs files={parts.files} />

      <nav
        aria-label="Example pagination"
        className="mt-(--space-lg) flex flex-col gap-2 border-t border-gryt-border pt-(--space-md) sm:flex-row sm:justify-between"
      >
        {previous ? (
          <Link className={pagerClass} to={`/examples/${previous.slug}`}>
            <span className="block text-xs text-gryt-muted">Previous</span>
            <span className="block font-medium text-gryt-text">
              {previous.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            className={`${pagerClass} sm:text-right`}
            to={`/examples/${next.slug}`}
          >
            <span className="block text-xs text-gryt-muted">Next</span>
            <span className="block font-medium text-gryt-text">{next.name}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

/** The example on its own, for the full-screen route. No docs chrome. */
export function ExampleFullPage() {
  const { example } = useParams();
  const doc = example ? docsBySlug.get(example) : undefined;

  if (!doc) {
    return <Navigate replace to={`/examples/${exampleDocs[0].slug}`} />;
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-gryt-bg">
      {doc.slug === "settings-modal" ? (
        <FullSettings />
      ) : (
        partsBySlug[doc.slug].render()
      )}
    </div>
  );
}

/** Full screen is the one place the settings dialog can be its real self. */
function FullSettings() {
  return (
    <div className="grid h-full place-items-center p-6">
      <SettingsModal />
    </div>
  );
}

function SourceTabs({ files }: { files: SourceFile[] }) {
  const [active, setActive] = useState(files[0].name);

  if (files.length === 1) {
    return (
      <CodeBlock
        code={files[0].code}
        language={files[0].language}
        title={files[0].name}
      />
    );
  }

  return (
    <div className="mt-(--space-md)">
      <Tabs value={active} onValueChange={(value) => setActive(String(value))}>
        <Tabs.List aria-label="Source files">
          {files.map((file) => (
            <Tabs.Tab key={file.name} value={file.name}>
              {file.name}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
        {files.map((file) => (
          <Tabs.Panel key={file.name} value={file.name}>
            <CodeBlock
              code={file.code}
              language={file.language}
              title={file.name}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

const pagerClass =
  "min-w-0 rounded-(--gryt-radius-md) border border-gryt-border px-4 py-2.5 text-sm transition-colors hover:border-gryt-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light";

/** Component name to its docs slug — the same kebab-case the routes use. */
function slugFor(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
