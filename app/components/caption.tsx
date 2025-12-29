import type { CSSProperties, ReactNode } from "react";

export function Caption({ children }: { children: ReactNode }) {
  return (
    <span
      className="block w-full text-xs my-3 font-mono text-gray-500 text-center leading-normal"
      style={{ textWrap: "balance" } as CSSProperties}
    >
      <span className="[&>a]:post-link">{children}</span>
    </span>
  );
}
