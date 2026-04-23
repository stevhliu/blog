import Link from "next/link";
import { HeaderInfo } from "./header-info";

export function Header() {
  return (
    <header className="mb-8">
      {/* Top meta row — records count right-aligned */}
      <div className="flex justify-between items-end pb-4 md:pb-5 border-b border-[var(--color-rule)]">
        <span />
        <span className="archive-meta text-[var(--color-text)]">
          <HeaderInfo />
        </span>
      </div>

      {/* Huge serif title */}
      <section className="mt-20 md:mt-28 pb-6 border-b-2 border-[var(--color-rule)]">
        <h1 className="archive-title text-[var(--color-text)] text-[56px] md:text-[96px] leading-[0.82]">
          <Link href="/" className="nav-link">
            Observation&nbsp;Log
          </Link>
        </h1>
      </section>
    </header>
  );
}
