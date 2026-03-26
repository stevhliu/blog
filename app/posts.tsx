import Link from "next/link";
import { TreePine } from "lucide-react";
import type { Post } from "./get-posts";

function EvergreenIcon() {
  return (
    <TreePine aria-hidden="true" strokeWidth={2.5} className="inline-block w-3.5 h-3.5 ml-1.5 mb-0.5 text-[var(--color-blue)]" />
  );
}

export function Posts({ posts }: { posts: Post[] }) {
  const hasEvergreen = posts.some((post) => post.evergreen);
  const grouped = groupByYear(posts);

  return (
    <section className="mt-[38vh] flex flex-col min-h-[calc(100vh-120px)]">
      {grouped.map(([year, yearPosts]) => (
        <YearGroup key={year} year={year} posts={yearPosts} />
      ))}

      {hasEvergreen ? (
        <div className="mt-auto pt-12">
          <span className="flex items-center gap-1.5 text-xs text-[#64a70b] font-medium uppercase tracking-wide">
            <EvergreenIcon />
            <span>evergreen posts are updated with new content</span>
          </span>
        </div>
      ) : null}
    </section>
  );
}

function YearGroup({ year, posts }: { year: number; posts: Post[] }) {
  return (
    <div className="flex border-t border-[var(--color-rule)]">
      <div className="w-72 shrink-0 pt-3 pr-16">
        <span className="text-sm font-medium">{year}</span>
      </div>

      <div className="grow">
        {posts.map((post, i) => (
          <Link key={post.id} href={`/${new Date(post.date).getFullYear()}/${post.id}`} className="post-link">
            <div className={`flex items-baseline py-2.5 ${i < posts.length - 1 ? "border-b border-[var(--color-rule)]" : ""}`}>
              <span className="grow min-w-0">
                <span className="post-title text-sm inline-block">
                  {post.title}
                  {post.evergreen ? <EvergreenIcon /> : null}
                </span>
              </span>
              <span className="text-[var(--color-text)] text-xs tabular-nums font-mono ml-4 shrink-0">
                {post.viewsFormatted}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function groupByYear(posts: Post[]): [number, Post[]][] {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return Array.from(map.entries());
}
