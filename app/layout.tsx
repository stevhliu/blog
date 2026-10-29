import "./globals.css";

import Script from "next/script";
import { Analytics } from "./analytics";
import { doge } from "./doge";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
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
      <body className="min-h-[100svh] bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
        <Script id="doge-console" strategy="lazyOnload">
          {`(${doge.toString()})();`}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
