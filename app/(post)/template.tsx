import { Header } from "./header";
import { getPosts } from "../get-posts";

export const revalidate = 60;

export default async function Template({ children }) {
  const posts = await getPosts();

  return (
    <article className="text-[var(--color-text)] mb-10">
      <Header posts={posts} />

      {children}
    </article>
  );
}
