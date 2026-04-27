import type { Post } from "./get-posts";
import { groupByYear } from "./archive-section";
import { PostIndex } from "./components/post-index";

export function Posts({ posts, page }: { posts: Post[]; page?: string }) {
  const grouped = groupByYear(posts);

  return (
    <section className="mt-8 md:mt-12 flex flex-col min-h-[calc(100vh-20rem)]">
      <PostIndex grouped={grouped} page={page} />
    </section>
  );
}
