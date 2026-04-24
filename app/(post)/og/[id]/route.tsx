export const revalidate = 60;

import { ImageResponse } from "next/og";
import { getPosts } from "@/app/get-posts";
import { loadGeistFont, loadPublicImageDataUrl } from "@/app/og-assets";

export async function generateStaticParams() {
  return (await getPosts()).map(post => ({ id: post.id }));
}

const geistSansMedium = loadGeistFont("geist-medium.ttf");
const geistMono = loadGeistFont("geist-mono-regular.ttf");
const socialsImage = loadPublicImageDataUrl("images/socials.png", "image/png");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const posts = await getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col items-center justify-center p-[60px]"
        style={{
          backgroundImage: `url(${socialsImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          tw="text-white text-[52px] leading-tight mb-4 max-w-[900px] text-center"
          style={{ fontFamily: "Geist Medium", letterSpacing: "-0.02em" }}
        >
          {post.title}
        </div>
        <div
          tw="flex items-center text-[22px]"
          style={{ fontFamily: "Geist Mono", color: "rgba(255,255,255,0.6)" }}
        >
          <span tw="mr-6">{post.date}</span>
          <span tw="mr-6">·</span>
          <span>{post.viewsFormatted} views</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist Medium",
          data: geistSansMedium,
        },
        {
          name: "Geist Mono",
          data: geistMono,
        },
      ],
    }
  );
}
