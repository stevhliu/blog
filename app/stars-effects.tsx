"use client";

import { useEffect } from "react";

// How long into a visit a shooting star may fall, and the odds it does at all.
const METEOR_ODDS = 0.35;
const METEOR_EARLIEST_MS = 15_000;
const METEOR_WINDOW_MS = 45_000;

/**
 * The small amount of JavaScript the star field needs. It pauses the
 * twinkle when the sky is scrolled out of view (a long post leaves it
 * behind after 45svh) and by day, when every star is at zero anyway, so
 * the six layers cost nothing then. And, once a visit at most and only
 * on a dark, clear night, it lets one shooting star fall.
 */
export function StarsEffects() {
  useEffect(() => {
    const field = document.querySelector<HTMLElement>(".sky-stars");
    if (!field) return;
    const root = document.documentElement;
    const number = (name: string, fallback: number) => {
      const value = parseFloat(getComputedStyle(root).getPropertyValue(name));
      return isNaN(value) ? fallback : value;
    };

    let onScreen = true;
    const watcher = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      field.classList.toggle("is-offscreen", !onScreen);
    });
    watcher.observe(field);

    // The first class of star shows with the sun 3.6° down (globals.css);
    // above that the field is empty, and its animations can rest.
    const byDay = () => field.classList.toggle("is-day", number("--sky-sun", 90) > -3.6);
    byDay();
    document.addEventListener("sky-light", byDay);

    let meteor = 0;
    try {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce && !sessionStorage.getItem("sky-meteor") && Math.random() < METEOR_ODDS) {
        meteor = window.setTimeout(() => {
          // Only across a dark, mostly clear sky the reader can see.
          const dark = number("--sky-sun", 90) < -8 && number("--sky-clouds", 0) < 0.5;
          if (!dark || !onScreen || document.hidden) return;
          sessionStorage.setItem("sky-meteor", "1");
          const streak = field.querySelector<HTMLElement>(".sky-meteor");
          if (!streak) return;
          streak.style.setProperty("--mx", `${(20 + Math.random() * 60).toFixed(1)}%`);
          streak.style.setProperty("--my", `${(5 + Math.random() * 30).toFixed(1)}%`);
          streak.classList.add("is-live");
        }, METEOR_EARLIEST_MS + Math.random() * METEOR_WINDOW_MS);
      }
    } catch {
      // no storage: no shooting star this visit
    }

    return () => {
      watcher.disconnect();
      document.removeEventListener("sky-light", byDay);
      window.clearTimeout(meteor);
    };
  }, []);
  return null;
}
