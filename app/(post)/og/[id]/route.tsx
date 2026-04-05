
export const revalidate = 60;

import { ImageResponse } from "next/og";
import { getPosts } from "@/app/get-posts";
import { readFileSync } from "fs";
import { join } from "path";

export async function generateStaticParams() {
  return (await getPosts()).map(post => ({ id: post.id }));
}

// fonts
const fontsDir = join(process.cwd(), "fonts");

const geistSans = readFileSync(
  join(fontsDir, "geist-regular.ttf")
);

const geistSansMedium = readFileSync(
  join(fontsDir, "geist-medium.ttf")
);

const geistSansBold = readFileSync(
  join(fontsDir, "geist-bold.ttf")
);

const geistMono = readFileSync(join(fontsDir, "geist-mono-regular.ttf"));

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
        tw="flex h-full w-full flex-col bg-white p-10"
        style={font("Geist")}
      >
        <header tw="mb-6 flex w-full text-[36px]">
          <div tw="font-bold" style={font("Geist Medium")}>
            Steven Liu
          </div>
          <div tw="grow" />
          <div tw="text-[28px] text-gray-600">stevhliu.com</div>
        </header>

        <main tw="flex grow flex-col justify-center">
          <div tw="mb-10 flex flex-col items-center px-6">
            <div
              tw="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-gray-400"
              style={font("Geist Mono")}
            >
              Title
            </div>
            <div
              tw="max-w-[1000px] text-center text-[52px] font-medium leading-tight text-gray-900"
              style={font("Geist Medium")}
            >
              {post.title}
            </div>
          </div>

          <div tw="flex w-full flex-row items-start justify-center gap-20">
            <div tw="flex flex-col items-center">
              <div
                tw="mb-2 text-sm font-medium uppercase tracking-[0.15em] text-gray-400"
                style={font("Geist Mono")}
              >
                Published
              </div>
              <div tw="text-[32px] font-medium text-gray-900" style={font("Geist Medium")}>
                {post.date}
              </div>
            </div>
            <div tw="flex flex-col items-center">
              <div
                tw="mb-2 text-sm font-medium uppercase tracking-[0.15em] text-gray-400"
                style={font("Geist Mono")}
              >
                Views
              </div>
              <div tw="text-[32px] text-gray-900" style={font("Geist Mono")}>
                {post.viewsFormatted}
              </div>
            </div>
          </div>
        </main>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist",
          data: geistSans,
        },
        {
          name: "Geist Medium",
          data: geistSansMedium,
        },
        {
          name: "Geist Bold",
          data: geistSansBold,
        },
        {
          name: "Geist Mono",
          data: geistMono,
        },
      ],
    }
  );
}

// lil helper for more succinct styles
function font(fontFamily: string) {
  return { fontFamily };
}
