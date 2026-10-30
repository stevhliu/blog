import Link from "next/link";

/**
 * Header for the chrome pages (home, about, 404): the name and the bio.
 * Post pages don't render it; SiteShell only includes it for `chrome`.
 * The name is the page's h1, so the pages below it start at h2.
 */
export function SiteHeader() {
  return (
    <header className="mb-8">
      <section className="pb-6">
        <aside className="text-[var(--color-text)] text-[18px] leading-[1.5]">
          {/* text-box trims the half-leading above the cap height, so the
              top inset is measured to the letters, like the left one is.
              Browsers without text-box sit about 7px lower. */}
          <h1 className="m-0 text-[18px] font-normal leading-[1.5] [text-box:trim-start_cap_alphabetic]">
            <Link href="/" className="nav-link no-underline text-inherit">
              Steven Liu
            </Link>
          </h1>
          <p className="m-0 mt-3">
            <span className="opacity-70">
              I work on all things related to developer docs at{" "}
              <a
                href="https://huggingface.co"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link underline underline-offset-2"
              >
                Hugging Face
              </a>{" "}
              for{" "}
              <a
                href="https://huggingface.co/docs/transformers/main/en/index"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link underline underline-offset-2"
              >
                Transformers
              </a>{" "}
              and{" "}
              <a
                href="https://huggingface.co/docs/diffusers/main/en/index"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link underline underline-offset-2"
              >
                Diffusers
              </a>
              .
            </span>
          </p>
          <p className="m-0 mt-3 opacity-70">
            I enjoy writing, reading, brewing coffee, and messing with my cats.
          </p>
          <p className="m-0 mt-3 opacity-70">
            Say hi on{" "}
            <a
              href="https://x.com/stevhliu"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link underline underline-offset-2"
            >
              X
            </a>
            .
          </p>
        </aside>
      </section>
    </header>
  );
}
