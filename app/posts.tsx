import Link from "next/link";
import { TreePine } from "lucide-react";
import type { Post } from "./get-posts";

export const bgStyle = {
  backgroundImage: "url(/images/background.jpg)",
  backgroundSize: "cover",
  backgroundPosition: "center",
} as const;

function EvergreenIcon() {
  return (
    <TreePine aria-hidden="true" className="inline-block w-4 h-4 ml-1.5 mb-0.5 text-green-600 dark:text-green-500" />
  );
}

export function Posts({ posts }: { posts: Post[] }) {
  const hasEvergreen = posts.some((post) => post.evergreen);
  return (
    <section className="relative max-w-2xl m-auto mb-10 text-sm text-black dark:text-gray-100">
      <div
        className="fixed inset-0 -z-10"
        style={bgStyle}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <List posts={posts} />
        {hasEvergreen ? (
          <div className="mt-8">
            <span className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-400">
              <EvergreenIcon />
              <span>evergreen posts are updated with new content</span>
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function List({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map((post, i: number) => {
        const year = getYear(post.date);
        const firstOfYear = !posts[i - 1] || getYear(posts[i - 1].date) !== year;
        const lastOfYear = !posts[i + 1] || getYear(posts[i + 1].date) !== year;

        return (
          <li key={post.id}>
            <Link href={`/${new Date(post.date).getFullYear()}/${post.id}`}>
              <span
                className={`flex
                ${!firstOfYear ? "border-t-0" : ""}
                ${lastOfYear ? "border-b-0" : ""}
              `}
              >
                <span
                  className={`py-2 flex grow items-baseline ${
                    !firstOfYear ? "ml-14" : ""
                  }`}
                >
                  {firstOfYear && (
                    <span className="w-14 inline-block shrink-0 text-neutral-700 text-xs dark:text-neutral-400">
                      {year}
                    </span>
                  )}

                  <span className="grow min-w-0 dark:text-gray-100">
                    <span className="post-title text-base py-0.5 px-1.5 inline-block break-words">
                      {post.title}
                      {post.evergreen ? <EvergreenIcon /> : null}
                    </span>
                  </span>

                  <span className="text-neutral-700 dark:text-neutral-400 text-xs tabular-nums">
                    {post.viewsFormatted}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function getYear(date: string) {
  return new Date(date).getFullYear();
}
