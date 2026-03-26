import type { ReactNode } from "react";

export function Blockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-5 text-[var(--color-subtext)] pl-4 border-l-[3px] border-[var(--color-blue)]">
      {children}
    </blockquote>
  );
}
