import { headers } from "next/headers";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const postId = segments[segments.length - 1];

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
