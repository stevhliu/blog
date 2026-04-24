import type { Post } from "./get-posts";

export function groupByYear(posts: Post[]): [number, Post[]][] {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}

/** Same section index as the home index columns: SEC. nn / year */
export function archiveSecYearForPost(
  post: Post,
  allPosts: Post[]
): { section: number; year: number } | null {
  const grouped = groupByYear(allPosts);
  const year = new Date(post.date).getFullYear();
  const idx = grouped.findIndex(([y]) => y === year);
  if (idx === -1) return null;
  return { section: grouped.length - idx, year };
}
