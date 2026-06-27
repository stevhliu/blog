import { Header } from "./header";

/**
 * The outer site frame shared by every page. `chrome` (home, about, 404) adds
 * the page-border top rule; `post` is full-bleed. The variant used to be derived
 * in the root layout from a request header set by middleware; it is now chosen
 * per route group so every page renders statically.
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
      {/* Matches preview: 20px top, 40px bottom; 24px h-padding on mobile, 40px ≥768px. */}
      <div className="relative z-10 mx-auto min-h-[inherit] max-w-6xl px-6 pb-10 pt-5 md:px-10">
        <Header />
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
