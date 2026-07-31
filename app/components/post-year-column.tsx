import Link from "next/link";
import type { Post } from "../get-posts";
import { formatShortPostDate } from "../post-format";

export function PostYearColumn({
  year,
  posts,
}: {
  year: number;
  posts: Post[];
}) {
  return (
    <div className="flex flex-col">
      <div className="archive-col-header flex justify-between text-[14px] text-[var(--color-text)] uppercase tracking-[0.04em]">
        <span>{year}</span>
      </div>
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/${year}/${post.id}`}
          className="post-link archive-entry text-[var(--color-text)] no-underline"
        >
          <span className="flex min-w-0 max-w-[72%] items-baseline gap-6">
            <span className="shrink-0 text-[14px] opacity-70 min-w-[48px] tabular-nums uppercase tracking-[0.04em]">
              {formatShortPostDate(post.date)}
            </span>
            <span className="post-title min-w-0 break-words text-[14px] tracking-[0.01em] leading-[1.3] font-normal ">
              {post.title}
            </span>
          </span>
          <span className="flex flex-col gap-[2px] text-right">
            <span className="text-[14px] opacity-60 tabular-nums ">
              {post.viewsFormatted}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
