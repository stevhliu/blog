import Link from "next/link";
import { HeaderInfo } from "./header-info";

export function Header() {
  return (
    <header className="mb-4 md:mb-6">
      <div className="flex gap-4 text-xs text-[var(--color-text)] font-medium tracking-wide">
        <div className="w-28 md:w-72 shrink-0 md:pr-16">
          Hugging&nbsp;Face
          <br />
          Open&nbsp;Source&nbsp;Team
          <br />
          Developer&nbsp;Docs
        </div>
        <div className="grow">
          North&nbsp;Bay&nbsp;Area
          <br />
          California
        </div>
        <div className="shrink-0 text-right">
          <a
            href="https://x.com/stevhliu"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-[color,transform] duration-150 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--color-blue)] active:scale-[0.97] motion-reduce:active:scale-100"
          >
            @stevhliu
          </a>
          <br />
          <HeaderInfo />
        </div>
      </div>

      <div className="mt-4 h-px bg-[var(--color-rule)]" />

      <h1 className="mt-2 text-4xl md:text-7xl font-bold tracking-tight text-[var(--color-text)] text-balance relative flex items-center md:items-start gap-3 md:gap-0">
        <picture>
          <source
            srcSet="/images/logo-dark-mode.png"
            media="(prefers-color-scheme: dark)"
          />
          <img
            src="/images/logo.png"
            alt=""
            width={192}
            height={128}
            fetchPriority="high"
            className="w-14 h-auto object-contain md:w-24 md:absolute md:right-full md:mr-8"
          />
        </picture>
        <Link href="/" className="nav-link">Steven&nbsp;Liu</Link>
      </h1>
    </header>
  );
}
