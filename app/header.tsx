import Link from "next/link";
import { HeaderInfo, HeaderInfoMobile } from "./header-info";

export function Header() {
  return (
    <header className="mb-4 md:mb-6">
      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-3 text-xs text-[var(--color-text)] font-medium tracking-wide md:hidden">
        <div>
          Hugging&nbsp;Face &middot; Open&nbsp;Source&nbsp;Team &middot; Developer&nbsp;Docs
        </div>
        <div className="flex justify-between">
          <span>North&nbsp;Bay&nbsp;Area, California</span>
          <span>
            <a href="https://x.com/stevhliu" target="_blank" rel="noopener noreferrer" className="transition-[color] duration-150 hover:text-[var(--color-blue)]">@stevhliu</a>
            <HeaderInfoMobile />
          </span>
        </div>
      </div>

      {/* Desktop: 3-column layout */}
      <div className="hidden md:flex text-xs text-[var(--color-text)] font-medium tracking-wide">
        <div className="w-72 shrink-0 pr-16">
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
          <a href="https://x.com/stevhliu" target="_blank" rel="noopener noreferrer" className="transition-[color] duration-150 hover:text-[var(--color-blue)]">@stevhliu</a>
          <br />
          <HeaderInfo />
        </div>
      </div>

      <div className="mt-4 h-px bg-[var(--color-rule)]" />

      <picture className="mt-2 md:hidden">
        <source
          srcSet="/images/logo-dark-mode.png"
          media="(prefers-color-scheme: dark)"
        />
        <img
          src="/images/logo.png"
          alt=""
          width={192}
          height={128}
          className="w-14 h-auto object-contain"
        />
      </picture>
      <h1 className="mt-2 text-4xl md:text-7xl font-bold tracking-tight text-[var(--color-text)] text-balance relative flex items-start">
        <picture className="hidden md:block">
          <source
            srcSet="/images/logo-dark-mode.png"
            media="(prefers-color-scheme: dark)"
          />
          <img
            src="/images/logo.png"
            alt=""
            width={192}
            height={128}
            className="w-24 h-auto object-contain absolute right-full mr-8"
          />
        </picture>
        <Link href="/" className="nav-link">Steven&nbsp;Liu</Link>
      </h1>
    </header>
  );
}
