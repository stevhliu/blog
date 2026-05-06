import { headers } from "next/headers";
import { archiveSecYearForPost } from "../archive-section";
import { TocSidebar } from "./toc-sidebar";
import { ViewCounter } from "./view-counter";
import { getPosts } from "../get-posts";
import { postIdFromPathname } from "../post-routing";

export const revalidate = 60;

export default async function Template({ children }: { children: React.ReactNode }) {
  const [posts, headersList] = await Promise.all([
    getPosts(),
    headers(),
  ]);
  const postId = postIdFromPathname(headersList.get("x-pathname") ?? "");
  const post = postId ? posts.find((p) => p.id === postId) : null;
  const secYear = post ? archiveSecYearForPost(post, posts) : null;

  return (
    <div className="text-[var(--color-text)]">
      <div
        className={[
          "mt-6 flex flex-col gap-5 sm:mt-8 sm:gap-6",
          "md:mt-10 md:grid md:items-start md:gap-x-8 md:gap-y-0",
          "md:grid-cols-[12.5rem_minmax(0,35rem)]",
          "lg:grid-cols-[13.75rem_minmax(0,35rem)] lg:gap-x-10",
          "xl:grid-cols-[15rem_minmax(0,35rem)] xl:gap-x-14",
          "2xl:grid-cols-[16rem_minmax(0,35rem)] 2xl:gap-x-20",
        ].join(" ")}
      >
        <TocSidebar postTitle={post?.title ?? null} />
        <article className="min-w-0">
          {post?.title ? (
            <header className="mb-7">
              {secYear ? (
                /* Sec row is dimmed warm-gray, not black, on post pages. */
                <div className="mb-2 archive-meta flex justify-between text-[var(--color-dim)]">
                  <span>
                    SEC.&nbsp;{String(secYear.section).padStart(2, "0")}
                    &nbsp;/&nbsp;{secYear.year}
                  </span>
                </div>
              ) : null}
              {/* Geist sans, medium weight, tight tracking — NOT Times New Roman. */}
              <h1 className="m-0 text-balance font-sans text-[44px] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--color-body)] md:text-[48px]">
                {post.title}
              </h1>
              {post.date ? (
                <p className="m-0 mt-3 font-mono text-[11px] uppercase leading-none tracking-[0.04em] text-[var(--color-dim)]">
                  <time className="tabular-nums">{post.date}</time>
                </p>
              ) : null}
            </header>
          ) : null}
          <div className="post-body text-[var(--color-body)]">
            {children}
          </div>
          {post ? <ViewCounter id={post.id} /> : null}
        </article>
      </div>
    </div>
  );
}
