import Link from "next/link";
import type { Post } from "../get-posts";
import { PostYearColumn } from "./post-year-column";
import { TreePineIcon } from "./tree-pine-icon";

// Single index page: every year is shown, stacked newest-first.
const PAGE_SIZE = 99;
const PAGINATION_LINK_CLASS =
  "archive-meta inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-[var(--color-text)] transition-[opacity,transform] duration-[160ms] ease-[var(--ease-out)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)] active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80 motion-reduce:transition-opacity motion-reduce:active:scale-100 [touch-action:manipulation]";
const PAGINATION_DISABLED_CLASS =
  "archive-meta inline-flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center rounded-md px-3 text-[var(--color-text)] opacity-30";

type Grouped = [number, Post[]][];

function pageHref(page: number): string {
  return page === 0 ? "/" : `/?page=${page + 1}`;
}

function parsePage(page: string | undefined, totalPages: number): number {
  const parsed = Number.parseInt(page ?? "1", 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(parsed - 1, 0), totalPages - 1);
}

function PaginationLink({
  page,
  disabled,
  children,
}: {
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={PAGINATION_DISABLED_CLASS}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={pageHref(page)}
      className={`${PAGINATION_LINK_CLASS} no-underline`}
    >
      {children}
    </Link>
  );
}

export function PostIndex({
  grouped,
  page,
}: {
  grouped: Grouped;
  page?: string;
}) {
  const total = grouped.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = parsePage(page, totalPages);

  const start = currentPage * PAGE_SIZE;
  const pageItems = grouped.slice(start, start + PAGE_SIZE);

  return (
    <>
      {/* 2-col grid (matching the header) so the list aligns under the bio. */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-7">
        <div className="hidden md:block" aria-hidden="true" />
        <div className="grid grid-cols-1 gap-10 md:gap-12">
          {pageItems.map(([year, yearPosts]) => {
            return (
              <PostYearColumn key={year} year={year} posts={yearPosts} />
            );
          })}
        </div>
      </div>

      <footer className="mt-auto pt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center md:gap-x-6">
        {/* Empty cell keeps pagination centered / Evergreen right in the 3-col grid. */}
        <div className="hidden md:block" aria-hidden="true" />
        {totalPages > 1 ? (
          <nav
            className="flex min-h-11 flex-wrap items-center justify-center gap-4 [touch-action:manipulation] md:justify-self-center"
            aria-label="Archive index pages"
          >
            <PaginationLink
              page={Math.max(0, currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </PaginationLink>
            <span
              className="archive-meta tabular-nums text-[var(--color-text)]"
              aria-live="polite"
              aria-atomic="true"
            >
              Page {String(currentPage + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </span>
            <PaginationLink
              page={Math.min(totalPages - 1, currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </PaginationLink>
          </nav>
        ) : (
          <div className="text-center tabular-nums md:justify-self-center archive-meta !normal-case text-[var(--color-text)]">
            Index 01 / 01
          </div>
        )}
        <div className="inline-flex items-center justify-end gap-1 text-right md:justify-self-end archive-meta !normal-case text-[var(--color-text)]">
          <TreePineIcon
            aria-hidden="true"
            className="h-[1em] w-[1em] shrink-0"
            strokeWidth={2}
          />
          <span>Evergreen</span>
        </div>
      </footer>
    </>
  );
}
