"use client";

import { useEffect, useRef } from "react";

/**
 * Pauses all SMIL animations inside the wrapped SVG and seeks to
 * `freezeAt` seconds when the user prefers reduced motion, so looping
 * diagrams render as a static "finished" frame instead of moving forever.
 * It also pauses them while the diagram is off screen: SMIL runs on the
 * main thread, and a loop nobody can see shouldn't cost every frame.
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
    let onScreen = false;
    const apply = () => {
      if (mql.matches) {
        svg.pauseAnimations();
        svg.setCurrentTime(freezeAt);
      } else if (onScreen) {
        svg.unpauseAnimations();
      } else {
        svg.pauseAnimations();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      apply();
    });
    observer.observe(svg);
    apply();
    mql.addEventListener("change", apply);
    return () => {
      observer.disconnect();
      mql.removeEventListener("change", apply);
    };
  }, [freezeAt]);

  return <div ref={ref}>{children}</div>;
}
