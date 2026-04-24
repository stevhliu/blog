"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AsciiCat } from "./ascii-cat";
import { EnvDatetime } from "./env-datetime";
import { isPostDetailPathname } from "./is-post-detail-pathname";

/**
 * Post detail URLs: no site header (post template provides title + local nav).
 * All other routes: top meta row (live PT datetime + total records) + ASCII cat hero.
 *
 * The hero is the dancing ASCII cat — "Observation Log" is kept for screen readers only.
 */
export function SiteHeader({ totalRecords }: { totalRecords: number }) {
  const pathname = usePathname() ?? "";
  if (isPostDetailPathname(pathname)) return null;

  const total = totalRecords.toString().padStart(3, "0");

  return (
    <header className="mb-8">
      <div className="flex justify-between items-end pb-4 md:pb-5 border-b border-[var(--color-rule)] gap-4">
        <span
          className="archive-meta text-[var(--color-text)] leading-[1.6] text-left whitespace-nowrap"
        >
          <EnvDatetime />
        </span>
        <span className="archive-meta text-[var(--color-text)]">
          Total Records: {total}
        </span>
      </div>

      <section className="mt-20 md:mt-28 pb-6 border-b-2 border-[var(--color-rule)]">
        <h1 className="archive-title text-[var(--color-text)] text-[56px] md:text-[96px] m-0">
          <Link href="/" className="nav-link no-underline text-inherit">
            <AsciiCat />
          </Link>
        </h1>
      </section>
    </header>
  );
}
