export const revalidate = 60;

import { ImageResponse } from "next/og";
import { getPosts } from "@/app/get-posts";
import { loadGeistFont } from "@/app/og-assets";
import { formatShortPostDate, getPostYear } from "@/app/post-format";

export async function generateStaticParams() {
  return (await getPosts()).map(post => ({ id: post.id }));
}

const geistSansMedium = loadGeistFont("geist-medium.ttf");
const geistMono = loadGeistFont("geist-mono-regular.ttf");

// Pose A of the dancing ASCII cat, rendered as rows instead of one <pre>.
const CAT_LINES = [
  "*",
  "     /\\_/\\   *",
  "   ( o.o )/",
  "     > ^ <",
  "    /     \\",
  "*  /_/   \\_\\",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [{ id }, posts] = await Promise.all([params, getPosts()]);
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return new Response("Not found", { status: 404 });

  const post = posts[idx];

  // Section number = newest-first index + 1 (matches the home page's SEC. NN label).
  const section = String(posts.length - idx).padStart(2, "0");
  const year = getPostYear(post.date);

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col"
        style={{
          backgroundColor: "#faf9f7",
          color: "#000000",
          fontFamily: "Geist Medium",
          padding: "48px 64px 40px",
        }}
      >
        {/* Body: cat + title */}
        <div tw="flex flex-1 items-start" style={{ gap: 36 }}>
          <div
            tw="flex flex-col"
            style={{
              fontFamily: "Geist Mono",
              fontSize: 24,
              lineHeight: 1.08,
              flexShrink: 0,
              opacity: 0.9,
              whiteSpace: "pre",
            }}
          >
            {CAT_LINES.map((line, i) => (
              <div key={i} style={{ whiteSpace: "pre" }}>{line}</div>
            ))}
          </div>

          <div tw="flex flex-1 flex-col">
            <div
              tw="flex"
              style={{
                fontFamily: "Geist Mono",
                fontSize: 18,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                opacity: 0.65,
              }}
            >
              ENTRY&nbsp;·&nbsp;{formatShortPostDate(post.date)}&nbsp;·&nbsp;{year}
            </div>
            <div style={{ height: 18 }} />
            <div
              style={{
                fontFamily: "Geist Medium",
                fontSize: 88,
                letterSpacing: "-0.05em",
                lineHeight: 0.95,
                display: "flex",
              }}
            >
              {post.title}
            </div>
          </div>
        </div>

        {/* Footer meta row */}
        <div
          tw="flex items-end justify-between"
          style={{
            borderTop: "1px solid #000000",
            paddingTop: 20,
            marginTop: 24,
            fontFamily: "Geist Mono",
            fontSize: 18,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <div tw="flex">STEVHLIU.COM</div>
          <div tw="flex">SEC.&nbsp;{section}&nbsp;/&nbsp;{year}</div>
          <div tw="flex">{post.viewsFormatted}&nbsp;VIEWS</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist Medium", data: geistSansMedium },
        { name: "Geist Mono", data: geistMono },
      ],
    }
  );
}
