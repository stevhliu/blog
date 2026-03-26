"use client";

import { usePathname } from "next/navigation";
import type { Post } from "@/app/get-posts";
import { ViewCounter } from "./view-counter";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return rtf.format(-diffMinutes, "minute");
    }
    return rtf.format(-diffHours, "hour");
  } else if (diffDays < 30) {
    return rtf.format(-diffDays, "day");
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return rtf.format(-diffMonths, "month");
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return rtf.format(-diffYears, "year");
  }
}

export function Header({ posts }: { posts: Post[] }) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const postId = segments[segments.length - 1];
  const post = posts.find(p => p.id === postId) ?? null;

  if (post == null) return null;

  const relativeTime = getRelativeTime(post.date);

  return (
    <header className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-[var(--color-text)] text-balance">
        {post.title}
      </h1>

      <div className="flex items-center text-xs font-mono text-[var(--color-subtext)] tracking-wide">
        <span className="flex-grow flex items-center gap-2">
          <span className="hidden md:inline">
            <a
              href="https://twitter.com/stevhliu"
              className="transition-colors duration-150 hover:text-[var(--color-blue)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              @stevhliu
            </a>
            <span className="mx-2 text-[var(--color-rule)]">|</span>
          </span>

          <span suppressHydrationWarning>
            {post.date} ({relativeTime})
          </span>
        </span>

        <span>
          <ViewCounter id={post.id} initialViews={post.viewsFormatted} />
        </span>
      </div>

      <div className="mt-4 h-px bg-[var(--color-rule)]" />
    </header>
  );
}
