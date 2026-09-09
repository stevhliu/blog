"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AsciiCat } from "./ascii-cat";
import { HuggingFaceLogo } from "./components/hugging-face-logo";
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
      {/* One column at every width: the cat sits above the bio rather than
          beside it, so the header reads down the same centred measure the
          archive and footer use. */}
      <section className="mt-20 md:mt-24 pb-6 flex flex-col gap-8">
        {/* The cat is centred across the text column rather than set flush
            left. Its art carries leading whitespace on most lines, so flush
            left reads as an accidental indent against the bio below it. */}
        <h1 className="archive-title text-[var(--color-text)] text-[56px] md:text-[96px] m-0 mx-auto w-fit">
          <Link href="/" className="nav-link no-underline text-inherit">
            <AsciiCat />
          </Link>
        </h1>

        <aside className=" text-[var(--color-text)]">
          <p className="m-0 text-[14px] leading-[1.7]">
            <span className="block">Steven Liu</span>
            <span className="mt-3 block">
            <span className="opacity-70">
            I work on developer docs at{" "}
            </span>
            <span className="whitespace-nowrap">
              <a
                href="https://huggingface.co"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link hf-chip"
              >
                <HuggingFaceLogo decorative />
                Hugging Face
              </a>
              <span className="opacity-70">,</span>
            </span>
            <span className="opacity-70">
            {" "}the open-source ML platform. Most of my work is on{" "}
            <a
              href="https://huggingface.co/docs/transformers"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link underline underline-offset-2"
            >
              Transformers
            </a>, the standard model definition of the ecosystem.
            </span>
            </span>
            <span className="mt-3 block opacity-70">
              Feel free to holla at me on{" "}
              <a
                href="https://x.com/stevhliu"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link underline underline-offset-2"
              >
                X
              </a>{" "}.
            </span>
          </p>
        </aside>
      </section>
    </header>
  );
}
