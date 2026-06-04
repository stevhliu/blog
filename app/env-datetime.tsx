"use client";

import { useEffect, useState } from "react";

/**
 * Live America/Los_Angeles timestamp that ticks every 30s.
 *
 * Rendered SSR with an em-dash placeholder so the layout doesn't shift on
 * hydration; the real value appears on first client tick.
 */
const TZ = "America/Los_Angeles";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TZ,
});

function format(now: Date): string {
  const date = dateFormatter.format(now);
  const time = timeFormatter.format(now);
  return `${date} ${time} PT`;
}

export function EnvDatetime() {
  const [stamp, setStamp] = useState<string>("—");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const tick = () => setStamp(format(new Date()));
    tick();
    setRevealed(true);
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Fade in once on first reveal (—  →  timestamp); subsequent 30s ticks keep
  // opacity at 1, so the value swaps silently without flashing.
  return (
    <span
      aria-live="polite"
      suppressHydrationWarning
      data-revealed={revealed}
      className="inline-block opacity-0 transition-opacity duration-200 ease-[var(--ease-out)] data-[revealed=true]:opacity-100 motion-reduce:transition-none"
    >
      {stamp}
    </span>
  );
}
