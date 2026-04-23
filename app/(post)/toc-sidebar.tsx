"use client";

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
        if (!h.id) {
          // Auto-generate a stable id from the text
          h.id = h.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-") ?? "";
        }
        (h.style as any).scrollMarginTop = "40px";
        return { id: h.id, text: h.textContent ?? "" };
      });
      setItems(next);
    };
    collect();
    // Re-collect after route changes / MDX hydration
    const id = window.setTimeout(collect, 200);
    return () => window.clearTimeout(id);
  }, []);

  // Scroll-spy: track which heading is currently active
  useEffect(() => {
    if (!items.length) return;
    const THRESHOLD = 120; // px from top of viewport

    const onScroll = () => {
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= THRESHOLD) {
          current = item.id;
        }
      }
      setActiveId(current ?? items[0].id);
    };

    // Set initial active on mount
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (!items.length) return <aside className="hidden md:block" />;

  return (
    <aside className="hidden md:block sticky top-10 self-start">
      <div className="archive-meta text-black dark:text-white">Contents</div>
      <ol className="list-none p-0 mt-2.5 font-mono text-[10px] leading-[1.8]">
        {items.map((it, i) => {
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
                  "block py-[2px] pl-2.5 no-underline transition-[color,border-color,opacity] duration-200",
                  "border-l-2",
                  active
                    ? "border-black dark:border-white text-black dark:text-white font-medium"
                    : "border-transparent text-black dark:text-white opacity-30",
                ].join(" ")}
              >
                {String(i + 1).padStart(2, "0")} · {it.text}
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
