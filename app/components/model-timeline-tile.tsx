"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Clay square at the foot of the index, linking to the model timeline Space.
 *
 * The names sit on a 3D cylinder rather than in a scrolling list. Each one is
 * rotated onto its own facet and pushed out to the radius; the drum is pulled
 * back by that same radius so the front facet lands at z=0. Stepping the
 * drum's rotateX by one facet rolls the next name into place, which reads as a
 * mechanism turning over rather than a marquee sliding past.
 */
const NAMES = [
  "Kimi K2.7",
  "Inkling",
  "Muse Glimmer",
  "GLM 5.3 Flash",
  "DiffusionGemma",
  "DeepSeek V4 Flash",
  "Gemma 4",
  "Laguna XS.2",
  "Mistral 4",
  "Qwen 3.5",
  "Nemotron H",
];

const SPACE_URL = "https://stevhliu-model-timeline.hf.space/";
/**
 * The list runs twice around the drum. Radius is set by the circumference,
 * which is facet count times spacing, so with a single pass the only way to
 * make the cylinder big enough to fill the tile was to space the names far
 * apart. Going around twice buys the same radius at half the gap. It is the
 * same trick superlogical.com uses, where 24 facets carry 12 phrases.
 */
const FACETS = [...NAMES, ...NAMES];
/** Facet spacing, matching the 15px line box in .tl-drum span. */
const ITEM_HEIGHT = 15;
const STEP_MS = 1700;

/**
 * Both of these are rounded before they ever reach a style string. The
 * server serializes inline styles to six significant figures while the
 * client writes full precision, so an unrounded 52.16364578830105 renders as
 * 52.1636 in the HTML and mismatches on hydration. Rounding first leaves
 * nothing for either side to round.
 */
const round = (n: number) => Number(n.toFixed(3));

const FACET_ANGLE = round(360 / FACETS.length);
/** Radius that makes the facets meet exactly at the line height. */
const RADIUS = round(ITEM_HEIGHT / 2 / Math.tan(Math.PI / FACETS.length));

function drumTransform(index: number): string {
  return `translateZ(${-RADIUS}px) rotateX(${round(-index * FACET_ANGLE)}deg)`;
}

export function ModelTimelineTile() {
  // Starts at 0 so the server and client agree on the first paint; the
  // interval only starts after mount.
  const [index, setIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  // Set while the card is turned. The drum keeps its interval but skips
  // its beats, so a cylinder is never rotating on a face nobody can see.
  const turnedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = stageRef.current;
    if (!stage) return;

    // The tile lives at the very bottom of the page, so it would otherwise
    // tick away unseen for the whole visit. Only turn while it is on screen.
    let id: number | null = null;
    const start = () => {
      if (id === null) {
        id = window.setInterval(() => {
          if (!turnedRef.current) setIndex((i) => i + 1);
        }, STEP_MS);
      }
    };
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "0px" },
    );
    observer.observe(stage);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  const hold = () => {
    turnedRef.current = true;
  };
  const release = () => {
    turnedRef.current = false;
  };

  return (
    <div
      ref={stageRef}
      className="tl-stage"
      onPointerEnter={hold}
      onPointerLeave={release}
    >
      <a
        href={SPACE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="tl-card"
        aria-label="Model timeline, every model added to Transformers by month"
        onFocus={hold}
        onBlur={release}
      >
        <div className="tl-face tl-face-front">
          {/* The rolling names are decoration over a link that already
              names itself, so they stay out of the accessibility tree. */}
          <div className="tl-wheel" aria-hidden="true">
            <div className="tl-drum-stage">
              <div className="tl-drum" style={{ transform: drumTransform(index) }}>
                {FACETS.map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    style={{
                      transform: `rotateX(${round(-i * FACET_ANGLE)}deg) translateZ(${RADIUS}px)`,
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="tl-label">Model timeline</div>
        </div>

        <div className="tl-face tl-face-back">
          <div className="tl-blurb">
            Every architecture ever added to Transformers, by the month it
            landed. About one a week, for six years.
          </div>
          <div className="tl-label">Model timeline</div>
        </div>
      </a>
    </div>
  );
}
