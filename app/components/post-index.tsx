import Link from "next/link";
import type { Post } from "../get-posts";
import { PostYearColumn } from "./post-year-column";
import { TreePineIcon } from "./tree-pine-icon";

const PAGE_SIZE = 2;
const SOCIAL_LINK_CLASS =
  "nav-link inline-flex min-h-11 min-w-11 items-center justify-center rounded-md md:min-h-6 md:min-w-6";
const SOCIAL_ICON_CLASS = "h-[11px] w-[11px] fill-current";
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
  const isSingleColumnLayout = pageItems.length === 1 && total > 1;

  return (
    <>
      <div
        className={
          isSingleColumnLayout
            ? "grid grid-cols-1 gap-6 md:gap-7 md:max-w-md"
            : "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7"
        }
      >
        {pageItems.map(([year, yearPosts], i) => {
          const globalIdx = start + i;
          const section = total - globalIdx;
          return (
            <PostYearColumn
              key={year}
              year={year}
              section={section}
              posts={yearPosts}
            />
          );
        })}
      </div>

      <footer className="mt-16 grid grid-cols-1 gap-4 border-t border-[var(--color-rule)] pt-5 md:grid-cols-3 md:items-center md:gap-x-6">
        <ul className="m-0 flex list-none items-center gap-2 p-0 leading-[1.6] md:justify-self-start archive-meta text-[var(--color-text)]">
          <li>
            <a
              href="https://x.com/stevhliu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Steven Liu on X"
              className={SOCIAL_LINK_CLASS}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className={SOCIAL_ICON_CLASS}
              >
                <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://github.com/stevhliu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Steven Liu on GitHub"
              className={SOCIAL_LINK_CLASS}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className={SOCIAL_ICON_CLASS}
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </li>
        </ul>
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
          <div className="text-center tabular-nums md:justify-self-center archive-meta text-[var(--color-text)]">
            Index Page 01 / 01
          </div>
        )}
        <div className="inline-flex items-center justify-end gap-1 text-right md:justify-self-end archive-meta text-[var(--color-text)]">
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
