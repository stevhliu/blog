import Link from "next/link";

export function Logo() {
  return (
    <span className="text-md md:text-lg whitespace-nowrap font-bold">
      <Link
        href="/"
        className="hover:bg-neutral-200 dark:hover:bg-neutral-700 p-2 rounded-2xl -ml-2 transition-[background-color]"
      >
        Steven Liu
      </Link>
    </span>
  );
}
