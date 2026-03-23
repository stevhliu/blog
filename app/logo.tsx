import Link from "next/link";

export function Logo() {
  return (
    <span className="text-md md:text-lg whitespace-nowrap font-bold">
      <Link
        href="/"
        className="nav-link p-2 rounded-2xl -ml-2"
      >
        steven liu
      </Link>
    </span>
  );
}
