import { Logo } from "./logo";
import Link from "next/link";

export function Header() {
  return (
    <header className="mb-10 md:mb-16">
      <div className="flex justify-between text-xs text-[#64a70b] font-medium tracking-wide">
        <div>
          Hugging Face
          <br />
          Developer Docs
        </div>
        <div>
          <a href="https://x.com/stevhliu" target="_blank" rel="noopener noreferrer" className="transition-colors duration-150 hover:text-[var(--color-blue)]">@stevhliu</a>
          <br />
          2024
        </div>
      </div>

      <div className="mt-2 h-px bg-[var(--color-text)]" />

      <div className="mt-1 h-px bg-[var(--color-text)]" />

      <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-[#64a70b] text-balance">
        <Link href="/" className="nav-link">Steven Liu</Link>
      </h1>
    </header>
  );
}
