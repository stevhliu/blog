// Post page header — thin top meta row only (the title now lives inside template.tsx's article column).
import Link from "next/link";
import { HeaderInfo } from "../header-info";

export function Header({ title }: { title: string | null }) {
  return (
    <header className="flex justify-between items-baseline pb-4 border-b border-[var(--color-blue)] archive-meta text-[var(--color-blue)]">
      <Link href="/" className="nav-link">← Observation Log</Link>
      <span>
        <HeaderInfo />
      </span>
    </header>
  );
}
