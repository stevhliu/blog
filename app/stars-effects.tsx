"use client";

import { useEffect } from "react";

// How long into a visit a shooting star may fall, and the odds it does at all.
const METEOR_ODDS = 0.35;
const METEOR_EARLIEST_MS = 15_000;
const METEOR_WINDOW_MS = 45_000;
// The streak's shape and flight, as globals.css draws it (.sky-meteor and
// @keyframes sky-meteor): this long, turned this far about its head, and
// carried this far along that line.
const METEOR_LENGTH = 110;
const METEOR_ANGLE = (153 * Math.PI) / 180;
const METEOR_TRAVEL = 240;
// Room kept between the streak and the field's edge.
const METEOR_MARGIN = 8;

/**
 * Where the streak's head may start so that all of it, tail and flight,
 * stays inside a field this size: the head as `left`/`top` for the
 * element, in pixels, or null when the field is too small to hold it.
 */
function meteorStart(width: number, height: number): { left: number; top: number } | null {
  // Every point of the streak over the flight lies on the line through the
  // head, from METEOR_LENGTH behind it (the tail before it moves) to
  // METEOR_TRAVEL ahead (the head when it lands).
  const dx = Math.cos(METEOR_ANGLE), dy = Math.sin(METEOR_ANGLE);
  const xs = [-METEOR_LENGTH * dx, METEOR_TRAVEL * dx], ys = [-METEOR_LENGTH * dy, METEOR_TRAVEL * dy];
  const minX = METEOR_MARGIN - Math.min(...xs), maxX = width - METEOR_MARGIN - Math.max(...xs);
  const minY = METEOR_MARGIN - Math.min(...ys), maxY = height - METEOR_MARGIN - Math.max(...ys);
  if (maxX < minX || maxY < minY) return null;
  const headX = minX + Math.random() * (maxX - minX), headY = minY + Math.random() * (maxY - minY);
  // The element's box starts METEOR_LENGTH left of its head, at the head's height.
  return { left: headX - METEOR_LENGTH, top: headY };
}

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
          // Only across a dark sky the reader can see.
          const dark = number("--sky-sun", 90) < -8;
          if (!dark || !onScreen || document.hidden) return;
          const streak = field.querySelector<HTMLElement>(".sky-meteor");
          if (!streak) return;
          // Placed in pixels from the field's real size, so the whole flight
          // shows: the field clips, and a streak placed by percentage near
          // the right edge of a phone lost its tail.
          const start = meteorStart(field.clientWidth, field.clientHeight);
          if (!start) return;
          sessionStorage.setItem("sky-meteor", "1");
          streak.style.setProperty("--mx", `${start.left.toFixed(1)}px`);
          streak.style.setProperty("--my", `${start.top.toFixed(1)}px`);
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
