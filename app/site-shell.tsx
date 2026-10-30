import { SiteHeader } from "./site-header";

/**
 * The outer site frame shared by every page. `chrome` (home, about, 404) adds
 * the page-border top rule; `post` is full-bleed. The variant used to be derived
 * in the root layout from a request header set by middleware; it is now chosen
 * per route group so every page renders statically. Only `chrome` renders the
 * site header, so post pages never download or hydrate it.
 */
export function SiteShell({
  variant,
  children,
}: {
  variant: "post" | "chrome";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        variant === "chrome"
          ? "min-h-screen overflow-clip border-t border-[var(--color-page-border)] bg-[var(--color-bg)]"
          : "min-h-screen bg-[var(--color-bg)]"
      }
    >
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-50 focus-visible:p-2 focus-visible:bg-[var(--color-bg)] focus-visible:text-[var(--color-text)]"
      >
        Skip to content
      </a>
      {/* The chrome pages (home, about, 404) run as one column 550px wide,
          so the reading measure stays constant however wide the window is.
          From 1120px up the column sits in a centred block with room for the
          home page's 300px coffee pouch beside it (CurrentlyDrinking),
          550 + 128 gap + 300 = 978px: extra width goes to the outer margins,
          not the gap. The block is the pouch's positioning context. Below
          1120px the column sits at the inset and the pouch flows underneath.
          Post pages are centred at full width, since their content template
          sets its own measure: 20px top, 40px bottom, 24px h-padding on
          mobile, 40px ≥768px. */}
      <div
        className={`relative z-10 min-h-[inherit] pb-10 ${
          variant === "chrome"
            ? "px-[var(--page-inset)] pt-[var(--page-top)]"
            : "mx-auto max-w-6xl px-6 pt-5 md:px-10"
        }`}
      >
        {variant === "chrome" ? (
          <div className="relative min-[1120px]:mx-auto min-[1120px]:max-w-[978px]">
            <div className="max-w-[550px]">
              <SiteHeader />
              <main id="main">{children}</main>
            </div>
          </div>
        ) : (
          <main id="main">{children}</main>
        )}
      </div>
    </div>
  );
}
