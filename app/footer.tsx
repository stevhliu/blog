import { A } from "@/app/components/a";

export function Footer() {
  return (
    <footer className="relative z-10 p-6 pt-3 pb-6 flex text-xs text-center mt-3">
      <div className="grow text-left font-medium text-[#64a70b]">
        Steven Liu (
        <A target="_blank" href="https://twitter.com/stevhliu">
          @stevhliu
        </A>
        )
      </div>
    </footer>
  );
}
