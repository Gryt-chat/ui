import { Check, Copy } from "lucide-react";
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
        "gryt-code-block not-prose my-6 overflow-hidden rounded-[28px] border border-gryt-border bg-[#0d0f13]",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-gryt-border bg-gryt-surface px-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gryt-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gryt-muted transition-colors hover:bg-white/8 hover:text-gryt-text"
          aria-label="Copy code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
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
