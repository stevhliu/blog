"use client";

import { useEffect } from "react";

import { SEBASTOPOL_LAT, SEBASTOPOL_LON, lightDocument, skyContext } from "./sky-lighting";

// The sun moves a quarter of a degree a minute, about one level in 255 of
// any colour on the page, too small to see, so each step goes in at once.
// Only a visible step (the light/dark flip) eases, over eight seconds.
const REFRESH_MS = 60_000;

/**
 * Keeps the page lit by the sky as the afternoon goes on. The first
 * lighting is done by /sky-light.js before paint; this only refreshes
 * it. A page opened at a chosen hour (?sky=) stays there.
 */
export function SkyLighting() {
  useEffect(() => {
    if (skyContext().at) return;
    const refresh = () => lightDocument(SEBASTOPOL_LAT, SEBASTOPOL_LON);
    const timer = window.setInterval(refresh, REFRESH_MS);
    // A tab left open overnight and brought back in the morning shouldn't
    // wait up to a minute in the dark.
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
