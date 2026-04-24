"use client";

import { useState } from "react";
import type { Post } from "../get-posts";
import { PostYearColumn } from "./post-year-column";

const PAGE_SIZE = 2;

type Grouped = [number, Post[]][];

export function PostIndexClient({ grouped }: { grouped: Grouped }) {
  const total = grouped.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [page, setPage] = useState(0);

  const start = page * PAGE_SIZE;
  const pageItems = grouped.slice(start, start + PAGE_SIZE);
  const isSingleColumnLayout = pageItems.length === 1 && total > 1;

  return (
    <>
      <div
        className={
          isSingleColumnLayout
            ? "grid grid-cols-1 gap-6 md:gap-7 md:max-w-md"
            : "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7"
        }
      >
        {pageItems.map(([year, yearPosts], i) => {
          const globalIdx = start + i;
          const section = total - globalIdx;
          return (
            <PostYearColumn
              key={year}
              year={year}
              section={section}
              posts={yearPosts}
            />
          );
        })}
      </div>

      <footer className="mt-16 grid grid-cols-1 gap-4 border-t border-[var(--color-rule)] pt-5 md:grid-cols-3 md:items-center md:gap-x-6">
        <ul className="m-0 list-none p-0 leading-[1.6] md:justify-self-start archive-meta text-[var(--color-text)]">
          <li>
            <a
              href="https://x.com/stevhliu"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Twitter
            </a>
          </li>
        </ul>
        {totalPages > 1 ? (
          <nav
            className="flex min-h-11 flex-wrap items-center justify-center gap-4 [touch-action:manipulation] md:justify-self-center"
            aria-label="Archive index pages"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="archive-meta min-h-11 min-w-11 rounded-md px-3 text-[var(--color-text)] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)] disabled:cursor-not-allowed disabled:opacity-30 enabled:[@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80 [touch-action:manipulation]"
            >
              Previous
            </button>
            <span
              className="archive-meta tabular-nums text-[var(--color-text)]"
              aria-live="polite"
              aria-atomic="true"
            >
              Page {String(page + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="archive-meta min-h-11 min-w-11 rounded-md px-3 text-[var(--color-text)] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)] disabled:cursor-not-allowed disabled:opacity-30 enabled:[@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80 [touch-action:manipulation]"
            >
              Next
            </button>
          </nav>
        ) : (
          <div className="text-center tabular-nums md:justify-self-center archive-meta text-[var(--color-text)]">
            Index Page 01 / 01
          </div>
        )}
        <div className="text-right md:justify-self-end archive-meta text-[var(--color-text)]">
          <span className="archive-serif italic">†</span> denotes evergreen
        </div>
      </footer>
    </>
  );
}
