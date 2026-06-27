import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSans.className} antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
        <Script id="doge-console" strategy="lazyOnload">
          {`(${doge.toString()})();`}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
