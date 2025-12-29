import type { Post } from "@/app/get-posts";
import { ViewCounter } from "./view-counter";

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

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

export function Header({ post }: { post: Post | null }) {
  if (post == null) return null;

  const relativeTime = getRelativeTime(post.date);

  return (
    <>
      <h1 className="text-2xl font-bold mb-1 dark:text-gray-100">
        {post.title}
      </h1>

      <p className="font-mono flex text-xs text-neutral-500 dark:text-neutral-500">
        <span className="flex-grow">
          <span className="hidden md:inline">
            <span>
              <a
                href="https://twitter.com/stevhliu"
                className="hover:text-neutral-800 dark:hover:text-neutral-400"
                target="_blank"
              >
                @stevhliu
              </a>
            </span>

            <span className="mx-2">|</span>
          </span>

          <span>
            {post.date} ({relativeTime})
          </span>
        </span>

        <span className="pr-1.5">
          <ViewCounter id={post.id} initialViews={post.viewsFormatted} />
        </span>
      </p>
    </>
  );
}
