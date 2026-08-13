import { ScrollArea } from "@gryt/ui";
import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import { grytShikiTheme, grytShikiThemeLight } from "../lib/grytShikiTheme";

const highlighterPromise = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  themes: [grytShikiTheme, grytShikiThemeLight],
  langs: [tsx, typescript, javascript, bash, css, json, markdown, html],
  langAlias: {
    js: "javascript",
    ts: "typescript",
    jsx: "tsx",
    md: "markdown",
    sh: "bash",
    shell: "bash",
    shellscript: "bash",
    shellsession: "bash"
  }
});

function normalizeLanguage(language: string) {
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "tsx",
    md: "markdown",
    sh: "bash",
    shell: "bash",
    shellscript: "bash",
    shellsession: "bash",
    markdown: "markdown"
  };

  return aliases[language] ?? language;
}

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  title?: string;
  /**
   * How tall the block is allowed to get before it scrolls instead. Any CSS
   * length. The examples ship two hundred lines of source apiece, and a block
   * that just keeps going buries the rest of the page under it.
   */
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language = "text",
  title,
  className,
  maxHeight = "30rem",
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const label = title ?? language;

  useEffect(() => {
    let active = true;

    highlighterPromise
      .then((highlighter) => {
        const lang = normalizeLanguage(language);
        const loadedLanguages = highlighter.getLoadedLanguages();

        return highlighter.codeToHtml(code, {
          lang: loadedLanguages.includes(lang) ? lang : "text",
          // Both, as custom properties rather than a colour. defaultColor off
          // means neither wins in the markup and the stylesheet decides, which
          // is what lets the header's toggle change a hundred code blocks
          // without re-highlighting one of them.
          themes: { light: "gryt-light", dark: "gryt-dark" },
          defaultColor: false
        });
      })
      .then((html) => {
        if (active) {
          setHighlightedHtml(html);
        }
      })
      .catch(() => {
        if (active) {
          setHighlightedHtml(null);
        }
      });

    return () => {
      active = false;
    };
  }, [code, language]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      className={[
        "gryt-code-block not-prose my-(--space-md) overflow-hidden rounded-(--gryt-radius-lg) border border-gryt-border bg-(--color-code-paper)",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* A language label and a working copy button — not a mock title bar.
          No traffic lights: the browser already supplies real chrome. */}
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-gryt-border px-4">
        <span className="font-mono text-[11px] tracking-wide text-gryt-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] text-gryt-muted transition-colors hover:bg-white/8 hover:text-gryt-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
          aria-label={copied ? "Copied to clipboard" : "Copy code"}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* The library's own ScrollArea rather than the browser's bars: a code
          block on a dark surface is exactly where a default macOS scrollbar
          looks pasted on, and both axes scroll here. */}
      <ScrollArea.Root style={{ maxHeight }}>
        <ScrollArea.Viewport style={{ maxHeight }}>
          <ScrollArea.Content>
            {highlightedHtml ? (
              <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            ) : (
              <pre className="m-0 p-4 text-[13px] leading-6 text-gryt-text">
                <code className="font-mono">{code}</code>
              </pre>
            )}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
        <ScrollArea.Scrollbar orientation="horizontal" />
      </ScrollArea.Root>
    </div>
  );
}
