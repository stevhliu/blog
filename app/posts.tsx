import type { Post } from "./get-posts";
import { groupByYear } from "./archive-section";
import { PostIndexClient } from "./components/post-index-client";

export function Posts({ posts }: { posts: Post[] }) {
  const grouped = groupByYear(posts);

  return (
    <section className="mt-8 md:mt-12 flex flex-col min-h-[calc(100vh-20rem)]">
      <PostIndexClient grouped={grouped} />
    </section>
  );
}
