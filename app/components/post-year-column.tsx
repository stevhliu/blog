"use client";

import Link from "next/link";
import type { Post } from "../get-posts";

function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${mo}-${day}`;
}

export function PostYearColumn({
  year,
  section,
  posts,
}: {
  year: number;
  section: number;
  posts: Post[];
}) {
  return (
    <div className="flex flex-col">
      <div className="archive-col-header flex justify-between text-[11px] sm:text-xs text-[var(--color-text)] font-[var(--font-geist-mono),monospace] uppercase tracking-[0.04em]">
        <span>
          SEC.&nbsp;{String(section).padStart(2, "0")}&nbsp;/&nbsp;{year}
        </span>
      </div>
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/${year}/${post.id}`}
          className="post-link archive-entry text-[var(--color-text)] no-underline"
        >
          <span className="flex gap-2 max-w-[72%] items-baseline">
            <span className="shrink-0 text-[10px] sm:text-[11px] opacity-70 min-w-[48px] tabular-nums font-[var(--font-geist-mono),monospace] uppercase tracking-[0.04em]">
              {shortDate(post.date)}
            </span>
            <span className="post-title text-[11px] sm:text-xs uppercase tracking-[0.01em] leading-[1.3] font-normal font-[var(--font-geist-mono),monospace]">
              {post.title}
              {post.evergreen ? (
                <span className="archive-serif italic ml-1.5 opacity-70">†</span>
              ) : null}
            </span>
          </span>
          <span className="flex flex-col gap-[2px] text-right">
            <span className="text-[9px] sm:text-[10px] opacity-60 tabular-nums font-[var(--font-geist-mono),monospace]">
              {post.viewsFormatted}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
