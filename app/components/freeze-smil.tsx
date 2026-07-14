"use client";

import { useEffect, useRef } from "react";

/**
 * Pauses all SMIL animations inside the wrapped SVG and seeks to
 * `freezeAt` seconds when the user prefers reduced motion, so looping
 * diagrams render as a static "finished" frame instead of moving forever.
 */
export function FreezeSmilOnReducedMotion({
  freezeAt,
  children,
}: {
  freezeAt: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mql.matches) {
        svg.pauseAnimations();
        svg.setCurrentTime(freezeAt);
      } else {
        svg.unpauseAnimations();
      }
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [freezeAt]);

  return <div ref={ref}>{children}</div>;
}
