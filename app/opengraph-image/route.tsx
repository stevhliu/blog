export const revalidate = 60;

import { ImageResponse } from "next/og";
import { loadFont, loadPublicImageDataUrl } from "@/app/og-assets";

// Satori reads TTF/OTF but not WOFF2, and not variable fonts, so the card
// uses Allo's static Medium.
const alloMedium = loadFont("allo/Allo-Medium.otf");

// The same dancing cat as the post cards, drawn near its native 373x368 so
// it stays crisp.
const dancingCat = loadPublicImageDataUrl("images/dancing-cat.png", "image/png");
const CAT_WIDTH = 360;
const CAT_HEIGHT = Math.round((CAT_WIDTH * 368) / 373);

export async function GET() {
  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full"
        style={{
          backgroundColor: "#faf9f7",
          color: "#000000",
          fontFamily: "Allo Medium",
        }}
      >
        {/* Left: the dancing cat */}
        <div tw="flex flex-1 items-center justify-center">
          <img alt="" src={dancingCat} width={CAT_WIDTH} height={CAT_HEIGHT} />
        </div>

        {/* Right: name */}
        <div tw="flex flex-1 items-center justify-center">
          <div
            tw="flex flex-col"
            style={{
              fontFamily: "Allo Medium",
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
      fonts: [{ name: "Allo Medium", data: alloMedium }],
    }
  );
}
