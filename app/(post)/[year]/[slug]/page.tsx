import { notFound } from "next/navigation";
import { allPosts } from "@/app/get-posts";
import { PostChrome } from "../../post-chrome";
import type { Metadata } from "next";

export const dynamicParams = false;

// Drafts stay statically generated and URL-reachable (today's behavior);
// they are excluded from the index and feed by getPublishedPosts().
export function generateStaticParams() {
  return allPosts.map(post => ({
    year: String(new Date(`${post.date} UTC`).getUTCFullYear()),
    slug: post.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ year: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = allPosts.find(p => p.id === slug);
  if (!post) return {};
  return {
    title: post.title,
    openGraph: { title: post.title, images: [{ url: `/og/${slug}` }] },
    twitter: { card: "summary_large_image", images: [`/og/${slug}`] },
  };
}

export default async function PostPage(props: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await props.params;
  // The page never shows view counts, so it reads the registry directly
  // rather than querying Supabase through getPosts().
  const post = allPosts.find(p => p.id === slug);
  if (!post) notFound();

  // Relative (not "@/...") so turbopack builds a module context from the static
  // prefix; the "@/" alias collides with package export maps under turbopack.
  const { default: Content } = await import(`../../../../posts/${year}/${slug}.mdx`);

  return (
    <PostChrome post={post}>
      <Content />
    </PostChrome>
  );
}
