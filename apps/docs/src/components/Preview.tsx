import type { ReactNode } from "react";

export interface PreviewProps {
  children: ReactNode;
}

export function Preview({ children }: PreviewProps) {
  return (
    <div className="my-6 rounded-[28px] border border-gryt-border bg-gryt-surface p-6">
      {children}
    </div>
  );
}
