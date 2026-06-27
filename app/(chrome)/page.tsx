import { Posts } from "../posts";
import { getPosts } from "../get-posts";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [posts, params] = await Promise.all([getPosts(), searchParams]);
  return <Posts posts={posts} page={params.page} />;
}
