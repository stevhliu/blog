"use client";

import { useEffect } from "react";

import { SEBASTOPOL_LAT, SEBASTOPOL_LON, lightDocument, skyContext } from "./sky-lighting";

// The sun moves a quarter of a degree a minute, about one level in 255 of
// any colour on the page, too small to see, so each step goes in at once.
// Only a visible step (dusk, clouds arriving) eases, over eight seconds.
const REFRESH_MS = 60_000;
// Cloud cover over Sebastopol from Open-Meteo (no key, no account). Half
// an hour matches how often the forecast itself updates.
const WEATHER_MS = 30 * 60_000;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${SEBASTOPOL_LAT}&longitude=${SEBASTOPOL_LON}&current=cloud_cover`;

/**
 * Keeps the page lit by the sky as the afternoon goes on. The first
 * lighting is done by /sky-light.js before paint; this only refreshes
 * it, and brings in the weather: the cloud cover is kept in
 * sessionStorage so the next page's first paint has it too. A page
 * opened at a chosen hour (?sky=) stays there.
 */
export function SkyLighting() {
  useEffect(() => {
    if (skyContext().at) return;
    const refresh = () => lightDocument(SEBASTOPOL_LAT, SEBASTOPOL_LON);
    const weather = async () => {
      try {
        const kept = JSON.parse(sessionStorage.getItem("sky-clouds") || "null");
        if (kept && Date.now() - kept.at < WEATHER_MS) return;
        const data = await (await fetch(WEATHER_URL)).json();
        const cover = Number(data?.current?.cloud_cover);
        if (!isNaN(cover)) {
          sessionStorage.setItem("sky-clouds", JSON.stringify({ cover: cover / 100, at: Date.now() }));
          refresh();
        }
      } catch {
        // offline, or the service is down: the sky stays clear, and the
        // stars stop waiting for it
        settle();
      }
    };
    // The stars hold until the cover is known (sky-lighting.ts, skyContext),
    // but not for long: two seconds, and a slow forecast is taken as clear.
    const settle = () => {
      try {
        if (!sessionStorage.getItem("sky-clouds")) sessionStorage.setItem("sky-clouds-tried", "1");
      } catch {
        // no storage: the context already counts the cover as known
      }
      refresh();
    };
    weather();
    const hold = window.setTimeout(settle, 2_000);
    const timer = window.setInterval(refresh, REFRESH_MS);
    const forecast = window.setInterval(weather, WEATHER_MS);
    // A tab left open overnight and brought back in the morning shouldn't
    // wait up to a minute in the dark.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
        weather();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(hold);
      window.clearInterval(timer);
      window.clearInterval(forecast);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
