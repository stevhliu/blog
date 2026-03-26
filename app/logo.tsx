import Link from "next/link";

export function Logo() {
  return (
    <span className="text-lg md:text-xl whitespace-nowrap font-bold tracking-tight">
      <Link
        href="/"
        className="nav-link inline-flex items-center gap-2"
      >
        <span>Steven Liu</span>
      </Link>
    </span>
  );
}
