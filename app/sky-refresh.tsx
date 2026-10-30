"use client";

import { useEffect } from "react";

import { SEBASTOPOL_LAT, SEBASTOPOL_LON, applyPageLight, pageLight, skyInstant, sunPosition } from "./sky-lighting";

// The sun moves a quarter of a degree a minute, about one level in 255 of
// any colour on the page; globals.css eases each step over eight seconds,
// so the day passes without a visible step.
const REFRESH_MS = 60_000;

/**
 * Keeps the page lit by the sky as the afternoon goes on. The first
 * lighting is done by the inline script in layout.tsx before paint; this
 * only refreshes it. A page opened at a chosen hour (?sky=) stays there.
 */
export function SkyLighting() {
  useEffect(() => {
    if (skyInstant()) return;
    const refresh = () =>
      applyPageLight(pageLight(sunPosition(new Date(), SEBASTOPOL_LAT, SEBASTOPOL_LON)));
    const timer = window.setInterval(refresh, REFRESH_MS);
    // A tab left open overnight and brought back in the morning shouldn't
    // wait up to five minutes in the dark.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
