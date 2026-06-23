import "./globals.css";

import { headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import { Analytics } from "./analytics";
import { Header } from "./header";
import { doge } from "./doge";
import { isPostDetailPathname } from "./post-routing";
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
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isPost = isPostDetailPathname(pathname);

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSans.className} antialiased`}
      suppressHydrationWarning={true}
    >
      <body
        className={
          isPost
            ? "min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
            : "min-h-screen bg-[var(--color-page-chrome)] text-[var(--color-text)]"
        }
      >
        <div
          className={
            isPost
              ? "min-h-screen bg-[var(--color-bg)]"
              : "min-h-screen overflow-clip border-t border-[var(--color-page-border)] bg-[var(--color-bg)]"
          }
        >
          <a
            href="#main"
            className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-50 focus-visible:p-2 focus-visible:bg-[var(--color-bg)] focus-visible:text-[var(--color-text)]"
          >
            Skip to content
          </a>
          {/* Matches preview: 20px top, 40px bottom; 24px h-padding on mobile, 40px ≥768px. */}
          <div className="relative z-10 mx-auto min-h-[inherit] max-w-6xl px-6 pb-10 pt-5 md:px-10">
            <Header />
            <main id="main">
              {children}
            </main>
          </div>
        </div>
        <Script id="doge-console" strategy="lazyOnload">
          {`(${doge.toString()})();`}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
