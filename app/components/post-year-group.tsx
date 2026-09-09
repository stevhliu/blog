import Link from "next/link";
import type { Post } from "../get-posts";
import { formatIsoPostDate, formatShortPostDate } from "../post-format";

/**
 * One year's worth of entries, rendered as rows in a shared grid:
 * year gutter, title, date, views.
 *
 * The year is printed once per group, on the group's first row, and is
 * visually hidden on the rows below it. It stays in the markup so every
 * row keeps the same column widths, and visibility:hidden also drops the
 * repeated year from the accessibility tree. Each row carries a machine
 * readable <time> with the full date regardless.
 */
export function PostYearGroup({ year, posts }: { year: number; posts: Post[] }) {
  return (
    <ul className="post-list m-0 list-none p-0">
      {posts.map((post, index) => (
        <li key={post.id}>
          <Link
            href={`/${year}/${post.id}`}
            className="post-link archive-entry text-[var(--color-text)] no-underline"
          >
            <span
              className="archive-year tabular-nums"
              aria-hidden={index > 0 || undefined}
              data-repeated={index > 0 ? "true" : undefined}
            >
              {year}
            </span>
            <span className="post-title min-w-0 break-words text-[14px] font-normal leading-[1.3] tracking-[0.01em]">
              {post.title}
            </span>
            <time
              dateTime={formatIsoPostDate(post.date)}
              className="archive-date tabular-nums"
            >
              {formatShortPostDate(post.date)}
            </time>
            <span className="archive-views tabular-nums">
              {post.viewsFormatted}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
