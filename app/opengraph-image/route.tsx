export const revalidate = 60;

import { ImageResponse } from "next/og";
import { loadGeistFont } from "@/app/og-assets";

const geistSansMedium = loadGeistFont("geist-medium.ttf");
const geistMono = loadGeistFont("geist-mono-regular.ttf");

// Pose A of the home page's dancing ASCII cat, rendered as a stack of
// div rows so Satori preserves the exact spacing (it won't respect
// whitespace in a single <pre>/<div>).
const CAT_LINES = [
  "*",
  "     /\\_/\\   *",
  "   ( o.o )/",
  "     > ^ <",
  "    /     \\",
  "*  /_/   \\_\\",
];

export async function GET() {
  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full"
        style={{
          backgroundColor: "#faf9f7",
          color: "#000000",
          fontFamily: "Geist Medium",
        }}
      >
        {/* Left: giant ASCII cat */}
        <div tw="flex flex-1 items-center justify-center">
          <div
            tw="flex flex-col"
            style={{
              fontFamily: "Geist Mono",
              fontSize: 54,
              lineHeight: 1.06,
              whiteSpace: "pre",
            }}
          >
            {CAT_LINES.map((line, i) => (
              <div key={i} style={{ whiteSpace: "pre" }}>{line}</div>
            ))}
          </div>
        </div>

        {/* Right: name */}
        <div tw="flex flex-1 items-center justify-center">
          <div
            tw="flex flex-col"
            style={{
              fontFamily: "Geist Medium",
              fontSize: 160,
              letterSpacing: "-0.055em",
              lineHeight: 0.9,
            }}
          >
            <div>steven</div>
            <div>liu</div>
          </div>
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
