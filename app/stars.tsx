import type { CSSProperties } from "react";

import { StarsEffects } from "./stars-effects";

/**
 * The stars over the top of the page, behind the sky's wash.
 *
 * A fixed field of points, drawn once on the server, in three brightness
 * classes the way a real dusk fills in: a handful of bright stars first,
 * then the ordinary ones, then the faint dust last. Which class shows,
 * and how much, is decided in CSS (globals.css, .sky-stars) from the
 * sun's altitude (`--sky-sun`), the cloud cover (`--sky-clouds`) and the
 * moonlight (`--sky-moon`), all set on the root by sky-lighting.ts. So
 * this file knows nothing about time; it only lays the stars out.
 *
 * The field is six SVGs stacked, not one. A circle inside an SVG can't
 * have a compositor layer of its own, so twinkling 170 of them one by
 * one meant repainting the whole sky every frame for the whole visit.
 * Each SVG here is one layer, twinkled as a whole on the compositor, and
 * nothing is painted again. The six are interleaved across the sky and
 * breathe on six different clocks, so no region pulses together. Which
 * layer a star lands in leans on its height: the lower layers twinkle
 * deeper, and a star near the horizon, seen through more air, is more
 * likely to land in one. The fade toward the horizon is baked into each
 * low star's own opacity (`--h`), in place of a mask over the field.
 *
 * Positions are percentages so the field stretches with the viewport
 * while each star stays the same size in pixels. The random generator is
 * seeded, so the server and the client draw the same sky.
 */

type StarClass = "bright" | "mid" | "faint";

const CLASSES: { name: StarClass; count: number; radius: [number, number] }[] = [
  { name: "bright", count: 14, radius: [1.1, 1.5] },
  { name: "mid", count: 46, radius: [0.7, 1.0] },
  { name: "faint", count: 110, radius: [0.4, 0.65] },
];

/** Per layer: how far its twinkle dips (the opacity at the bottom of a
 * breath, before deep night steadies it) and how long a breath takes.
 * Odd layers glint, a quick dip, rather than breathe. */
const LAYERS = [
  { low: 0.86, seconds: [5, 7] },
  { low: 0.82, seconds: [6, 9] },
  { low: 0.78, seconds: [4.5, 6.5] },
  { low: 0.72, seconds: [6, 9] },
  { low: 0.64, seconds: [4, 6] },
  { low: 0.56, seconds: [5, 8] },
];

/** mulberry32: a small, good-enough PRNG that gives the same sky every build. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { cls: StarClass; cx: number; cy: number; r: number; h: number };

export function Stars() {
  const random = seeded(38402122);
  const layers: Star[][] = LAYERS.map(() => []);
  for (const { name, count, radius } of CLASSES) {
    for (let i = 0; i < count; i++) {
      // Stars thin out toward the horizon on a real night, so the field
      // is weighted toward the top of its box.
      const cx = random() * 100;
      const cy = Math.pow(random(), 1.4) * 100;
      const r = radius[0] + random() * (radius[1] - radius[0]);
      // Below 45% of the way down, a star fades toward the horizon the way
      // the sky's wash dissolves into the paper.
      const h = cy < 45 ? 1 : Math.pow(1 - (cy - 45) / 55, 1.6);
      // Half the choice is height, half is chance, so the layers interleave.
      const layer = Math.min(LAYERS.length - 1, Math.floor(((0.5 * cy) / 100 + 0.5 * random()) * LAYERS.length));
      layers[layer].push({ cls: name, cx, cy, r, h });
    }
  }
  return (
    <div className="sky-stars" aria-hidden="true">
      {layers.map((stars, i) => {
        const { low, seconds } = LAYERS[i];
        const duration = seconds[0] + random() * (seconds[1] - seconds[0]);
        // A negative delay starts each layer mid-breath, so none begin in step.
        const style = {
          "--twinkle-base": low,
          animationDuration: `${duration.toFixed(2)}s`,
          animationDelay: `-${(random() * duration).toFixed(2)}s`,
        } as CSSProperties;
        return (
          <svg key={i} className={i % 2 ? "sky-stars-layer glint" : "sky-stars-layer"} style={style} focusable="false">
            {stars.map((s, j) => (
              <circle
                key={j}
                className={s.cls}
                cx={`${s.cx.toFixed(2)}%`}
                cy={`${s.cy.toFixed(2)}%`}
                r={s.r.toFixed(2)}
                style={s.h < 1 ? ({ "--h": s.h.toFixed(2) } as CSSProperties) : undefined}
              />
            ))}
          </svg>
        );
      })}
      {/* The once-a-visit shooting star; stars-effects.tsx sets it off. */}
      <span className="sky-meteor" />
      <StarsEffects />
    </div>
  );
}
