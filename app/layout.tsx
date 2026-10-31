import "./globals.css";

import Script from "next/script";
import { Analytics } from "./analytics";
import { doge } from "./doge";
import { pageLightScript } from "./sky-lighting";
import { SkyLighting } from "./sky-refresh";
import { Stars } from "./stars";

// A short hash of the lighting script, for its URL.
const skyLightVersion = (() => {
  let hash = 5381;
  for (const char of pageLightScript()) hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  return hash.toString(36);
})();

export const metadata = {
  title: "steven liu",
  description:
    "Steven Liu is a technical writer at Hugging Face.",
  openGraph: {
    title: "steven liu",
    description:
      "Steven Liu is a technical writer at Hugging Face.",
    url: "https://stevhliu.com",
    siteName: "steven liu",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@stevhliu",
    creator: "@stevhliu",
    images: ["/opengraph-image"],
  },
  metadataBase: new URL("https://stevhliu.com"),
  alternates: {
    types: { "application/atom+xml": "/atom" },
  },
};

export const viewport = {
  // Paints the right canvas before the CSS loads, so dark mode never flashes white.
  colorScheme: "light dark",
  // The browser chrome and the overscroll area above the page take this
  // colour, so it must be --color-bg exactly or a band shows at the top.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="antialiased"
      suppressHydrationWarning={true}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/geist-sans-core.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist-mono-core.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* The page is lit by the sky over Sebastopol at this hour (see
            sky-lighting.ts). A blocking script in the head, so it runs
            before the stylesheet paints and a night-time reader never sees
            the page white first; its own file so it is cached across pages,
            with the URL versioned by its content so a deploy is never served
            the old one. The CSS palettes remain the no-script fallback. */}
        {/* Synchronous on purpose: it must run before first paint, and it
            is 15KB from the same origin, cached after the first page. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script id="sky-light" src={`/sky-light.js?v=${skyLightVersion}`} />
      </head>
      <body className="min-h-[100svh] bg-[var(--color-bg)] text-[var(--color-text)]">
        <SkyLighting />
        <Stars />
        {children}
        <Script id="doge-console" strategy="lazyOnload">
          {`(${doge.toString()})();`}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
