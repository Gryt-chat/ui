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
import { grytShikiTheme } from "../lib/grytShikiTheme";

const highlighterPromise = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  themes: [grytShikiTheme],
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
}

export function CodeBlock({
  code,
  language = "text",
  title,
  className,
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
          theme: "gryt-dark"
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
      {highlightedHtml ? (
        <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      ) : (
        <pre className="m-0 overflow-x-auto p-4 text-[13px] leading-6 text-gryt-text">
          <code className="font-mono">{code}</code>
        </pre>
      )}
    </div>
  );
}
