"use client";

import { useEffect, useRef } from "react";

/**
 * Second clay square in the Projects row, linking to the quantization Space.
 *
 * The front face is a bar chart made of unit squares, one square to a
 * gigabyte, with a row per quantization format and a dashed rule at the
 * card's capacity. Reading it is counting: FP16 needs fifteen squares and
 * the card only holds twelve.
 *
 * It shares the clay shell (.tl-stage / .tl-card / .tl-face) with the model
 * timeline tile rather than restating it. Only the drawing is new.
 */

/** Reference load, chosen because the numbers are memorable and it fails on a common card. */
const MODEL = "Llama 3.1 8B";
const VRAM_GB = 12;

const SPACE_URL = "https://huggingface.co/spaces/stevhliu/quantization-picker";

/**
 * Footprint per format, in GB, for the model above. Tones are indices into
 * the clay ramp (--qz-t1 lightest to --qz-t6 darkest); the spread of tones
 * within a row stands in for how many distinct values that format allows,
 * which is the thing the shading has always encoded here.
 */
const ROWS: { label: string; gb: number; tones: number[] }[] = [
  { label: "FP16", gb: 15.0, tones: [1, 3, 4, 2, 5, 3, 1, 4, 2, 5, 3, 4, 2, 1, 5] },
  { label: "INT8", gb: 8.1, tones: [2, 5, 4, 3, 5, 2, 4, 3] },
  { label: "NF4", gb: 4.5, tones: [4, 6, 2, 4, 6] },
  { label: "INT2", gb: 2.6, tones: [6, 1, 6] },
];

const TOTAL_SQUARES = ROWS.reduce((n, row) => n + row.tones.length, 0);

/** Must match the --qz-cycle in globals.css. */
const CYCLE_MS = 4500;

/**
 * Rounded before it reaches a style string. The server serializes inline
 * styles to six significant figures while the client writes full precision,
 * so an unrounded delay renders differently on each side and mismatches on
 * hydration. Rounding first leaves nothing for either side to round.
 */
const round = (n: number) => Number(n.toFixed(2));

/**
 * Phases are spread evenly across the cycle rather than randomised. With
 * random phases the dips clump, and several squares fade at once, which
 * reads as the whole field breathing. Spacing them makes the dip travel
 * along the rows instead, which is the point: one square at a time losing
 * its value is what quantization does.
 *
 * Negative delays start each square part-way through its cycle, so the
 * sequence is already distributed on the first frame instead of waiting
 * out a dead beat.
 */
const PHASE_STEP = CYCLE_MS / TOTAL_SQUARES;

export function QuantizationTile() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = stageRef.current;
    if (!stage) return;

    /**
     * The tile sits at the foot of the page, so without this the squares
     * would blink away unseen for the whole visit. The animation is paused
     * in CSS by default and only runs while the tile is on screen, the same
     * gate the timeline tile puts on its drum.
     */
    const observer = new IntersectionObserver(
      ([entry]) => stage.classList.toggle("qz-live", entry.isIntersecting),
      { rootMargin: "0px" },
    );
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  let squareIndex = 0;

  return (
    <div ref={stageRef} className="tl-stage">
      <a
        href={SPACE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="tl-card"
        aria-label={`Quantization strategies, how much memory ${MODEL} needs at each precision on a ${VRAM_GB}GB card`}
      >
        <div className="tl-face tl-face-front">
          {/* The chart restates the label and the blurb, so it stays out of
              the accessibility tree rather than read out as 31 empty spans. */}
          <div className="qz-art" aria-hidden="true">
            <div className="qz-rows">
              {ROWS.map((row) => {
                const whole = Math.floor(row.gb);
                const remainder = row.gb - whole;

                return (
                  <div key={row.label} className="qz-row">
                    <div className="qz-label">{row.label}</div>
                    <div className="qz-cells">
                      {row.tones.map((tone, i) => {
                        const delay = round(-squareIndex * PHASE_STEP);
                        squareIndex += 1;

                        return (
                          <span
                            key={i}
                            className="qz-sq"
                            style={{
                              background: `var(--qz-t${tone})`,
                              animationDelay: `${delay}ms`,
                              // The last square of a fractional row is only
                              // as wide as the gigabytes actually left over.
                              ...(i === whole && remainder > 0
                                ? { width: `${round(Math.max(2, remainder * 5))}px` }
                                : null),
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The capacity mark never animates. It is the reference the rows
                are read against, so it has to sit still while they move. */}
            <div className="qz-capacity" />
            <div className="qz-caplabel">{VRAM_GB} GB</div>
          </div>

          <div className="tl-label qz-title">Quantization strategies</div>
        </div>

        <div className="tl-face tl-face-back">
          <div className="tl-blurb">Picking a quantization strategy.</div>
          <div className="tl-label tl-open">
            Open
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}
