export const revalidate = 60;

import { ImageResponse } from "next/og";
import { getPosts } from "@/app/get-posts";
import { loadGeistFont, loadPublicImageDataUrl } from "@/app/og-assets";

export async function generateStaticParams() {
  return (await getPosts()).map(post => ({ id: post.id }));
}

const geistSansMedium = loadGeistFont("geist-medium.ttf");

// Pose A of the home page's dancing cat, captured from the live page
// (scripts/shoot-dancing-cat.mjs) so the card shows the real thing.
const dancingCat = loadPublicImageDataUrl("images/dancing-cat.png", "image/png");

// The capture is cropped to the cat, and CAT_SCALE keeps it at the size it drew
// at when the source was the full 831px-wide screenshot (300px across).
const CAT_SRC_WIDTH = 373;
const CAT_SRC_HEIGHT = 368;
const CAT_SCALE = 300 / 831;
const CAT_WIDTH = Math.round(CAT_SRC_WIDTH * CAT_SCALE);
const CAT_HEIGHT = Math.round(CAT_SRC_HEIGHT * CAT_SCALE);

// Six cats zigzag along the bottom, evenly spread across the inset row with
// every other one dropped by ZIGZAG.
const SIDE_INSET = 64;
const BOTTOM_INSET = 40;
const TILE_COUNT = 6;
const ZIGZAG = 34;
const ROW_WIDTH = 1200 - SIDE_INSET * 2;

// The ♪ notes are images for the same reason the cat is: Satori has no system
// font fallback and Geist carries no ♪ glyph.
const NOTE_ASPECT = 254 / 174;
const notes = {
  blue: loadPublicImageDataUrl("images/note-blue.png", "image/png"),
  green: loadPublicImageDataUrl("images/note-green.png", "image/png"),
  pink: loadPublicImageDataUrl("images/note-pink.png", "image/png"),
};

// Scattered above the row: x is measured from the row's left edge, y up from
// the row's top, and width sets the note's size.
const FLOATING_NOTES = [
  { src: notes.blue, x: 96, y: 52, width: 20 },
  { src: notes.pink, x: 268, y: 18, width: 15 },
  { src: notes.green, x: 430, y: 60, width: 18 },
  { src: notes.blue, x: 636, y: 26, width: 14 },
  { src: notes.pink, x: 812, y: 56, width: 19 },
  { src: notes.green, x: 984, y: 22, width: 16 },
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [{ id }, posts] = await Promise.all([params, getPosts()]);
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return new Response("Not found", { status: 404 });

  const post = posts[idx];

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
        {/* Body: title */}
        <div tw="flex flex-1 items-start">
          <div tw="flex flex-1 flex-col">
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

        {/* A few ♪ notes floating above the cats */}
        <div
          tw="flex"
          style={{
            position: "absolute",
            bottom: BOTTOM_INSET + CAT_HEIGHT + ZIGZAG,
            left: SIDE_INSET,
            width: ROW_WIDTH,
            height: 90,
          }}
        >
          {FLOATING_NOTES.map((note, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={i}
              alt=""
              src={note.src}
              width={note.width}
              height={Math.round(note.width * NOTE_ASPECT)}
              style={{ position: "absolute", left: note.x, bottom: note.y }}
            />
          ))}
        </div>

        {/* Repeated cats zigzagging along the bottom, inset from the card edges */}
        <div
          tw="flex items-start justify-between"
          style={{
            position: "absolute",
            bottom: BOTTOM_INSET,
            left: SIDE_INSET,
            width: ROW_WIDTH,
            height: CAT_HEIGHT + ZIGZAG,
          }}
        >
          {Array.from({ length: TILE_COUNT }, (_, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={i}
              alt=""
              src={dancingCat}
              width={CAT_WIDTH}
              height={CAT_HEIGHT}
              style={{ flexShrink: 0, marginTop: i % 2 === 0 ? 0 : ZIGZAG }}
            />
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Geist Medium", data: geistSansMedium }],
    }
  );
}
