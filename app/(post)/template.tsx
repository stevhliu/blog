import { headers } from "next/headers";
import { Header } from "./header";
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
    <article className="text-[var(--color-text)] mb-10">
      <Header title={post?.title ?? null} />

      {children}
    </article>
  );
}
