import { headers } from "next/headers";
import { Header } from "./header";
import { TocSidebar } from "./toc-sidebar";
import { getPosts } from "../get-posts";

export const revalidate = 60;

export default async function Template({ children }) {
  const [posts, headersList] = await Promise.all([
    getPosts(),
    headers(),
  ]);
  const pathname = headersList.get("x-pathname") ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const postId = segments[segments.length - 1];
  const post = posts.find((p) => p.id === postId);

  return (
    <div className="text-[var(--color-text)]">
      <Header title={post?.title ?? null} />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-[220px_minmax(0,560px)] md:gap-20 gap-8">
        <TocSidebar />
        <article className="min-w-0">
          {post?.title ? (
            <header className="mb-7">
              <h1 className="font-[Times_New_Roman,serif] text-[44px] md:text-[48px] leading-[0.95] tracking-[-0.03em] font-normal text-black dark:text-white m-0">
                {post.title}
              </h1>
            </header>
          ) : null}
          <div className="post-body text-black dark:text-white">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
