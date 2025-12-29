import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "./analytics";
import { Header } from "./header";
import { Footer } from "./footer";
import { doge } from "./doge";

export const metadata = {
  title: "Steven Liu's blog",
  description:
    "Steven Liu is a technical writer at Hugging Face.",
  openGraph: {
    title: "Steven Liu's blog",
    description:
      "Steven Liu is a technical writer at Hugging Face.",
    url: "https://stevhliu.com",
    siteName: "Steven Liu's blog",
    images: ["/opengraph-image"]
  },
  twitter: {
    card: "summary_large_image",
    site: "@stevhliu",
    creator: "@stevhliu",
  },
  metadataBase: new URL("https://stevhliu.com"),
};

export const viewport = {
  themeColor: "transparent",
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

      <body className="dark:text-gray-100 max-w-2xl m-auto">
        <main className="p-6 pt-3 md:pt-6 min-h-screen">
          <Header />
          {children}
        </main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
