export const revalidate = 60;

import { ImageResponse } from "next/og";
import { getPosts } from "@/app/get-posts";
import { readFileSync } from "fs";
import { join } from "path";

export async function generateStaticParams() {
  return (await getPosts()).map(post => ({ id: post.id }));
}

const fontsDir = join(process.cwd(), "fonts");

const geistSansMedium = readFileSync(join(fontsDir, "geist-medium.ttf"));
const geistMono = readFileSync(join(fontsDir, "geist-mono-regular.ttf"));

const socialsImageData = readFileSync(
  join(process.cwd(), "public/images/socials.png")
);
const socialsImageBase64 = `data:image/png;base64,${socialsImageData.toString("base64")}`;

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
      <div tw="flex h-full w-full relative">
        {/* Background */}
        <img
          src={socialsImageBase64}
          tw="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover" }}
        />

        {/* Overlay */}
        <div
          tw="absolute inset-0 flex flex-col justify-end p-[60px]"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.0) 55%)" }}
        >
          <div
            tw="text-white text-[52px] leading-tight mb-4 max-w-[900px]"
            style={{ fontFamily: "Geist Medium", letterSpacing: "-0.02em" }}
          >
            {post.title}
          </div>
          <div
            tw="flex items-center gap-6 text-[22px]"
            style={{ fontFamily: "Geist Mono", color: "rgba(255,255,255,0.6)" }}
          >
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.viewsFormatted} views</span>
          </div>
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
