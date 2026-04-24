import { headers } from "next/headers";
import type { Metadata } from "next";
import { postIdFromPathname } from "./post-pathname";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const postId = postIdFromPathname(headersList.get("x-pathname") ?? "") ?? "";

  return {
    openGraph: {
      images: [{ url: `/og/${postId}` }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/og/${postId}`],
    },
  };
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
