import { CodeBlock } from "./CodeBlock";
import { isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";

function textFromNode(node: ReactNode): string {
  if (typeof node === "string") {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(textFromNode).join("");
  }

  return "";
}

function Pre(props: ComponentProps<"pre">) {
  const child = props.children;

  if (isValidElement<ComponentProps<"code">>(child)) {
    const className = child.props.className ?? "";
    const language = className.replace(/^language-/, "") || "text";
    const code = textFromNode(child.props.children).trimEnd();

    return <CodeBlock code={code} language={language} />;
  }

  return <pre {...props} />;
}

function Code(props: ComponentProps<"code">) {
  return (
    <code
      {...props}
      className={[
        "rounded-md bg-gryt-surface-raised px-1.5 py-0.5 text-gryt-accent-light",
        props.className
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export const mdxComponents = {
  pre: Pre,
  code: Code
};
