import { A } from "@/app/components/a";
import { GeistSans } from "geist/font/sans";

export function Footer() {
  return (
    <footer className="relative z-10 p-6 pt-3 pb-6 flex text-xs text-center mt-3 font-mono">
      <div className={`grow text-left ${GeistSans.className}`}>
        Steven Liu (
        <A target="_blank" href="https://twitter.com/stevhliu">
          @stevhliu
        </A>
        )
      </div>
    </footer>
  );
}
