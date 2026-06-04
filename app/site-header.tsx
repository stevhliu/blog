"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AsciiCat } from "./ascii-cat";
import { HuggingFaceLogo } from "./components/hugging-face-logo";
import { SocialLinks } from "./components/social-links";
import { isPostDetailPathname } from "./post-routing";

/**
 * Post detail URLs: no site header (post template provides title + local nav).
 * All other routes: top meta row (live PT datetime + total records) + ASCII cat hero.
 *
 * The hero is the dancing ASCII cat — "Observation Log" is kept for screen readers only.
 */
export function SiteHeader() {
  const pathname = usePathname() ?? "";
  if (isPostDetailPathname(pathname)) return null;

  return (
    <header className="mb-8">
      <section className="mt-20 md:mt-28 pb-6 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-7 md:items-start">
        <h1 className="archive-title text-[var(--color-text)] text-[56px] md:text-[96px] m-0">
          <Link href="/" className="nav-link no-underline text-inherit">
            <AsciiCat />
          </Link>
        </h1>

        <aside className="font-mono text-[var(--color-text)]">
          <p className="m-0 text-[13px] leading-[1.7]">
            <span className="block">Steven Liu</span>
            <span className="mt-3 block">
            <span className="opacity-70">
            I maintain the developer docs at{" "}
            </span>
            <HuggingFaceLogo className="mr-1" />
            <span className="opacity-70">
            <a
              href="https://huggingface.co"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link underline underline-offset-2"
            >
              Hugging Face
            </a>
            , an open-source ML platform. Most of my work is on{" "}
            <a
              href="https://huggingface.co/docs/transformers"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link underline underline-offset-2"
            >
              Transformers
            </a>, the ecosystem standard for models,
            and I occasionally dabble in{" "}
            <a
              href="https://huggingface.co/docs/diffusers"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link underline underline-offset-2"
            >
              Diffusers
            </a>
            .
            </span>
            </span>
          </p>
          <SocialLinks className="mt-3 text-[var(--color-text)]" />
        </aside>
      </section>
    </header>
  );
}
