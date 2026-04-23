import Link from "next/link";
import type { Post } from "./get-posts";

function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${mo}-${day}`;
}

export function Posts({ posts }: { posts: Post[] }) {
  const hasEvergreen = posts.some((post) => post.evergreen);
  const grouped = groupByYear(posts);
  const total = grouped.length;

  return (
    <section className="mt-8 md:mt-12 flex flex-col min-h-[calc(100vh-20rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
        {grouped.map(([year, yearPosts], idx) => (
          <YearColumn
            key={year}
            year={year}
            section={total - idx}
            posts={yearPosts}
          />
        ))}
      </div>

      <footer className="mt-16 pt-5 border-t border-[var(--color-rule)] flex justify-between items-start">
        <ul className="list-none p-0 m-0 archive-meta text-[var(--color-text)] leading-[1.6]">
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
        <div className="flex gap-5 archive-meta text-[var(--color-text)]">
          <span>Index Page 01/01</span>
        </div>
        <div className="archive-meta text-[var(--color-text)] text-right">
          <span className="archive-serif italic">†</span> denotes evergreen
        </div>
      </footer>
    </section>
  );
}

function YearColumn({
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
      <div className="archive-col-header archive-meta text-[var(--color-text)] flex justify-between">
        <span>SEC.&nbsp;{String(section).padStart(2, "0")}&nbsp;/&nbsp;{year}</span>
      </div>
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/${year}/${post.id}`}
          className="post-link archive-entry text-[var(--color-text)] no-underline"
        >
          <span className="flex gap-2 max-w-[72%] items-baseline">
            <span className="archive-meta opacity-70 min-w-[46px] tabular-nums">
              {shortDate(post.date)}
            </span>
            <span className="post-title text-[10px] uppercase tracking-[0.01em] leading-[1.25] font-normal archive-mono">
              {post.title}
              {post.evergreen ? (
                <span className="archive-serif italic ml-1.5 opacity-70">†</span>
              ) : null}
            </span>
          </span>
          <span className="flex flex-col gap-[2px] text-right">
            <span className="text-[8px] opacity-60 tabular-nums archive-mono">
              {post.viewsFormatted}
            </span>
          </span>
        </Link>
      ))}
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
  // Newest year first — column order matches descending section numbering
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}
