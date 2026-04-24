"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type TocItem = { id: string; text: string };

function shouldReduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Left sidebar on post-detail pages.
 *
 * Changes from the previous design:
 *   • "INDEX" back link uses a real SVG arrow-left (not the `←` glyph) and
 *     sits in warm-gray (#b8b0a2) until hover.
 *   • The sidebar's heading is the POST TITLE (passed in as a prop), not a
 *     generic "Contents" label. It stays dim until the reader scrolls past
 *     the article header, then fades to --color-body via data-scrolled=true.
 *   • Inactive TOC items are warm-gray (#b8b0a2); active is --color-body.
 */
export function TocSidebar({ postTitle }: { postTitle?: string | null }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const activeIdRef = useRef<string | null>(null);
  const scrolledRef = useRef(false);
  const titleActive = scrolled && activeId === null;

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
        h.style.scrollMarginTop = "40px";
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

  // Scroll-spy: track which heading is "current" + whether we've passed the article header.
  useEffect(() => {
    const updateState = () => {
      const headerEl = document.querySelector("article > header");
      if (headerEl) {
        const { bottom } = headerEl.getBoundingClientRect();
        const nextScrolled = bottom < 40;
        if (nextScrolled !== scrolledRef.current) {
          scrolledRef.current = nextScrolled;
          setScrolled(nextScrolled);
        }
      }

      if (!items.length) return;
      const h = window.innerHeight;
      const line = 120 + 0.5 * h;
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top <= line) current = item.id;
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
      if (current !== activeIdRef.current) {
        activeIdRef.current = current;
        setActiveId(current);
      }
    };

    let frame = 0;
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateState();
      });
    };

    updateState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [items]);

  return (
    <aside
      id="post-sidebar-nav"
      className={[
        "hidden w-full min-w-0 [touch-action:manipulation] md:block",
        "md:sticky md:self-start",
        "md:top-8 md:-ml-9",
        "lg:top-10 lg:-ml-9",
        "xl:top-12 xl:-ml-9 2xl:-ml-9",
      ].join(" ")}
    >
      <Link
        href="/"
        aria-label="Back to index"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase leading-none tracking-[0.04em] text-[var(--color-dim)] no-underline mb-5 min-h-6 transition-[color] duration-200 max-md:min-h-11 max-md:items-center [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--color-body)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        <span>Index</span>
      </Link>

      <nav
        data-scrolled={scrolled ? "true" : "false"}
        aria-label="On this page"
        className="side-nav block"
      >
        {postTitle ? (
          <h2
            className={[
              "side-section font-mono text-[11px] font-medium uppercase tracking-[0.04em] leading-tight m-0 mb-2.5 transition-[color] duration-200 motion-reduce:transition-none",
              titleActive ? "text-[var(--color-body)]" : "text-[var(--color-dim)]",
            ].join(" ")}
          >
            {postTitle}
          </h2>
        ) : null}
        {items.length > 0 ? (
          <ul
            className={[
              "list-none p-0 m-0 font-mono leading-[1.9] [scrollbar-gutter:stable]",
              "text-[11px]",
              "max-md:max-h-[min(50dvh,22rem)] max-md:overflow-y-auto max-md:overscroll-y-contain max-md:pr-0.5",
              "md:max-h-[min(28rem,calc(100dvh-7rem))] md:overflow-y-auto md:overflow-x-hidden md:overscroll-y-contain",
              "lg:max-h-[min(32rem,calc(100dvh-8rem))] xl:max-h-[min(36rem,calc(100dvh-8.5rem))]",
            ].join(" ")}
          >
            {items.map((it) => {
              const active = it.id === activeId;
              return (
                <li key={it.id} data-active={active ? "true" : "false"}>
                  <a
                    href={`#${it.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      activeIdRef.current = it.id;
                      setActiveId(it.id);
                      document
                        .getElementById(it.id)
                        ?.scrollIntoView({
                          behavior: shouldReduceMotion() ? "auto" : "smooth",
                          block: "start",
                        });
                      history.replaceState(null, "", `#${it.id}`);
                    }}
                    className={[
                      "block break-words py-[2px] pr-0.5 no-underline transition-[color] duration-200",
                      "max-md:min-h-11 max-md:py-2.5 max-md:leading-snug",
                      "md:py-0.5 md:leading-snug lg:py-px",
                      active ? "text-[var(--color-body)]" : "text-[var(--color-dim)]",
                      "[@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--color-body)]",
                    ].join(" ")}
                  >
                    {it.text}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </nav>
    </aside>
  );
}
