import Link from "next/link";
import { SiteShell } from "./site-shell";

export default function NotFound() {
  return (
    <SiteShell variant="chrome">
      <div className="mt-10">
        <h1 className="m-0 font-sans text-[44px] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--color-body)] md:text-[48px]">
          Not found
        </h1>
        <p className="mt-4 text-[var(--color-subtext)]">
          That page doesn&apos;t exist.{" "}
          <Link href="/" className="underline">
            Back to the index
          </Link>
          .
        </p>
      </div>
    </SiteShell>
  );
}
