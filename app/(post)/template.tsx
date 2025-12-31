import { headers } from "next/headers";
import { Header } from "./header";
import { getPosts } from "../get-posts";

export const revalidate = 60;

export default async function Layout({ children }) {
  const posts = await getPosts();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";
  
  // Extract post ID from pathname (e.g., /2025/my-post -> my-post)
  const segments = pathname.split("/").filter(Boolean);
  const postId = segments[segments.length - 1];
  const post = posts.find(p => p.id === postId) ?? null;

  return (
    <article className="text-gray-800 dark:text-gray-300 mb-10">
      <Header post={post} />

      {children}
    </article>
  );
}
