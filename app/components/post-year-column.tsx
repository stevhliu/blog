import Link from "next/link";
import type { Post } from "../get-posts";
import { formatShortPostDate } from "../post-format";
import { TreePineIcon } from "./tree-pine-icon";

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
          <span className="flex min-w-0 max-w-[72%] items-baseline gap-2">
            <span className="shrink-0 text-[10px] sm:text-[11px] opacity-70 min-w-[48px] tabular-nums font-[var(--font-geist-mono),monospace] uppercase tracking-[0.04em]">
              {formatShortPostDate(post.date)}
            </span>
            <span className="post-title min-w-0 break-words text-[11px] sm:text-xs uppercase tracking-[0.01em] leading-[1.3] font-normal font-[var(--font-geist-mono),monospace]">
              {post.title}
              {post.evergreen ? (
                <span className="ml-1.5 inline-flex align-[-0.1em] opacity-70">
                  <TreePineIcon
                    aria-hidden="true"
                    className="h-[1em] w-[1em] shrink-0"
                    strokeWidth={2}
                  />
                  <span className="sr-only">Evergreen</span>
                </span>
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
