"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TocItem = { id: string; text: string };

export function TocSidebar() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Collect h2s from the article body after mount
  useEffect(() => {
    const collect = () => {
      const article = document.querySelector("article");
      if (!article) return;
      const hs = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2"));
      const next = hs.map((h) => {
        // MDX `## … [#anchor]` places `id` on the inner <span> (see withHeadingId); that is the #hash target.
        const fromSpan = h.querySelector<HTMLElement>("span[id]")?.id;
        if (!h.id && !fromSpan) {
          h.id = h.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-") ?? "";
        }
        (h.style as any).scrollMarginTop = "40px";
        const id = fromSpan || h.id;
        const text = (h.textContent ?? "").replace(/^\s*#\s*/m, "").replace(/\s+/g, " ").trim();
        return { id, text };
      });
      setItems(next);
    };
    collect();
    // Re-collect after route changes / MDX hydration
    const id = window.setTimeout(collect, 200);
    return () => window.clearTimeout(id);
  }, []);

  // Scroll-spy: track which heading is "current" (last section whose title has passed a reader line).
  // A fixed 120px line fails on tall viewports: the in-view h2 is often 200px+ from the top, so 07
  // never "wins" over 06. Scale the line with viewport height and pick the last heading with top <= line.
  useEffect(() => {
    if (!items.length) return;

    const updateActive = () => {
      const h = window.innerHeight;
      // Reader line: a heading is “in play” for active state while its top is at or above this (px from viewport top).
      // 100px + 45% of viewport is enough for ~250px in-view h2s on common laptop sizes (fixed 120 was too tight).
      const line = 120 + 0.5 * h;
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top <= line) {
          current = item.id;
        }
      }
      if (!current) {
        for (const item of items) {
          const el = document.getElementById(item.id);
          if (!el) continue;
          const { top, bottom } = el.getBoundingClientRect();
          if (top < h && bottom > 0) {
            current = item.id;
            break;
          }
        }
      }
      setActiveId(current ?? items[0]!.id);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  return (
    <aside
      id="post-sidebar-nav"
      className={[
        "hidden w-full min-w-0 [touch-action:manipulation] md:block",
        "md:sticky md:self-start",
        "md:top-8 md:-ml-3",
        "lg:top-10 lg:-ml-5",
        "xl:top-12 xl:-ml-7 2xl:-ml-8",
      ].join(" ")}
    >
      <Link
        href="/"
        aria-label="Back to home"
        className="inline-flex items-baseline gap-1.5 font-mono text-[10px] uppercase leading-none tracking-[0.04em] text-black dark:text-white opacity-30 no-underline mb-3 min-h-6 -ml-0.5 pl-0.5 transition-[color,opacity] duration-200 sm:mb-4 lg:text-[11px] max-md:mb-3 max-md:min-h-11 max-md:items-center [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-100"
      >
        <span className="select-none" aria-hidden>
          ←
        </span>
        <span>INDEX</span>
      </Link>
      {items.length > 0 ? (
        <>
          <div className="font-mono text-[10px] uppercase leading-none tracking-[0.04em] text-black dark:text-white max-md:mt-0.5 lg:text-[11px]">
            Contents
          </div>
          <ul
            className={[
              "list-none p-0 mt-2.5 font-mono leading-[1.8] [scrollbar-gutter:stable]",
              "text-[10px] lg:text-[11px] lg:leading-[1.75]",
              "max-md:max-h-[min(50dvh,22rem)] max-md:overflow-y-auto max-md:overscroll-y-contain max-md:pr-0.5",
              "md:max-h-[min(28rem,calc(100dvh-7rem))] md:overflow-y-auto md:overflow-x-hidden md:overscroll-y-contain",
              "lg:max-h-[min(32rem,calc(100dvh-8rem))] xl:max-h-[min(36rem,calc(100dvh-8.5rem))]",
            ].join(" ")}
          >
            {items.map((it) => {
              const active = it.id === activeId;
              return (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveId(it.id);
                      document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.replaceState(null, "", `#${it.id}`);
                    }}
                    className={[
                      "block break-words py-[2px] pl-0 pr-0.5 no-underline transition-[color,opacity] duration-200",
                      "max-md:min-h-11 max-md:py-2.5 max-md:leading-snug",
                      "md:py-0.5 md:leading-snug lg:py-px",
                      active
                        ? "text-black dark:text-white font-medium"
                        : "text-black dark:text-white opacity-30",
                    ].join(" ")}
                  >
                    {it.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </aside>
  );
}
