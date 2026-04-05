import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "./analytics";
import { Header } from "./header";
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
    images: ["/images/socials.png"]
  },
  twitter: {
    card: "summary_large_image",
    site: "@stevhliu",
    creator: "@stevhliu",
    images: ["/images/socials.png"],
  },
  metadataBase: new URL("https://stevhliu.com"),
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(${doge.toString()})();`,
          }}
        />
      </head>

      <body className="text-[var(--color-text)] max-w-2xl m-auto">
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-50 focus-visible:p-2 focus-visible:bg-[var(--color-bg)] focus-visible:text-[var(--color-text)]"
        >
          Skip to content
        </a>
        <div className="relative z-10 p-6 pt-3 md:pt-6 min-h-screen">
          <Header />
          <main id="main">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
