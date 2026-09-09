import Link from "next/link";
import type { Post } from "../get-posts";
import { EnvDatetime } from "../env-datetime";
import { PostYearGroup } from "./post-year-group";
import { ModelTimelineTile } from "./model-timeline-tile";

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
      {/* One continuous list: the year gutter marks each group, so the
          groups run together rather than sitting in separate blocks. The
          list fills the centred column the shell already sets, so it needs
          no column structure of its own. */}
      <div className="post-lists">
        {pageItems.map(([year, yearPosts]) => (
          <PostYearGroup key={year} year={year} posts={yearPosts} />
        ))}
      </div>

      {/* Set like the header's own type rather than as a heading face the
          page does not otherwise have: the metrics of the "Steven Liu"
          line, dimmed to the 0.70 the bio copy runs at. */}
      <section className="mt-14 flex flex-col gap-5" aria-labelledby="projects-heading">
        <h2
          id="projects-heading"
          className="m-0 text-[14px] font-normal leading-[1.7] opacity-70 text-[var(--color-text)]"
        >
          Projects
        </h2>
        <ModelTimelineTile />
      </section>

      {/* The 3-column grid exists only to hold pagination in the centre, so it
          is used only when there are pages to show. With a single page the
          meta line gets the full width instead of a third of it, which it
          needs now that it carries the location as well as the time. */}
      <footer
        className={`mt-auto items-center pt-16 ${
          totalPages > 1
            ? "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-3 md:gap-x-6"
            : "flex"
        }`}
      >
        {/* Location + live PT datetime. The location is static so it
            server-renders, while the timestamp fades in on hydration. */}
        {/* The pair barely exceeds a 375px viewport, so rather than let it
            wrap mid-line it stacks below sm and sits on one line above it,
            where the gap alone separates the two. */}
        <div className="archive-meta !text-[13px] !normal-case opacity-70 min-w-0 flex flex-col items-start gap-x-4 justify-self-start text-left text-[var(--color-text)] sm:flex-row sm:items-baseline">
          <span>Sebastopol, California</span>
          <EnvDatetime />
        </div>
        {totalPages > 1 ? (
          <nav
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 justify-self-center [touch-action:manipulation] md:gap-4"
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
        ) : null}
      </footer>
    </>
  );
}
