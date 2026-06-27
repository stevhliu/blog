import { notFound } from "next/navigation";
import postsData from "@/app/posts.json";
import { getPosts } from "@/app/get-posts";
import { PostChrome } from "../../post-chrome";
import type { Metadata } from "next";

export const dynamicParams = false;

// Drafts stay statically generated and URL-reachable (today's behavior);
// they are excluded from the index and feed by getPosts().
export function generateStaticParams() {
  return postsData.posts.map(post => ({
    year: String(new Date(`${post.date} UTC`).getUTCFullYear()),
    slug: post.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ year: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = postsData.posts.find(p => p.id === slug);
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
  const registryEntry = postsData.posts.find(p => p.id === slug);
  if (!registryEntry) notFound();

  const posts = await getPosts();
  const post =
    posts.find(p => p.id === slug) ??
    { ...registryEntry, views: 0, viewsFormatted: "0" }; // drafts: not in getPosts()

  // Relative (not "@/...") so turbopack builds a module context from the static
  // prefix; the "@/" alias collides with package export maps under turbopack.
  const { default: Content } = await import(`../../../../posts/${year}/${slug}.mdx`);

  return (
    <PostChrome post={post}>
      <Content />
    </PostChrome>
  );
}
