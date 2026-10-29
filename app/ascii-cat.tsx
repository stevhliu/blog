"use client";

import { useEffect, useRef } from "react";

/**
 * Two-pose ASCII cat that swaps "arms" every 500ms.
 * Pose B is padded with a blank top row so both poses occupy 6 lines —
 * without this the layout jumps by one line-height every swap.
 *
 * Pauses entirely under prefers-reduced-motion, and stops ticking while the
 * cat is scrolled out of view, like the home page tiles.
 */
const POSE_A =
  "♪\n　　   ∧＿＿∧　　   ♪\n　   （´・ω・｀∩\n　　   o　　　,ﾉ\n　　  Ｏ＿　.ﾉ\n♪　　    (ノ";

const POSE_B =
  "\n　　   ∧＿＿∧　　   ♪\n　    ∩・ω・｀）\n　    |　　   ⊂ﾉ\n　   ｜　　 _⊃　　  ♪\n　    し ⌒";

const POSES = [POSE_A, POSE_B];

// Each ♪ is tinted a different color, cycling through this palette in the
// order the notes appear in the pose.
const NOTE_COLORS = ["#64c6ff", "#00c978", "#ff58ae"];

function colorizeNotes(pose: string): string {
  let i = 0;
  return pose.replace(/♪/g, () => {
    const color = NOTE_COLORS[i % NOTE_COLORS.length];
    i += 1;
    return `<span style="color:${color}">♪</span>`;
  });
}

export function AsciiCat() {
  const catRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const cat = catRef.current;
    if (!cat) return;

    let pose = 0;
    let id: number | null = null;
    const start = () => {
      if (id === null) {
        id = window.setInterval(() => {
          pose = (pose + 1) % POSES.length;
          cat.innerHTML = colorizeNotes(POSES[pose]);
        }, 500);
      }
    };
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };

    const observer = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop()
    );
    observer.observe(cat);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  return (
    <>
      <pre
        ref={catRef}
        className="ascii-cat font-extended-mono"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: colorizeNotes(POSE_A) }}
      />
      <span className="sr-only">Observation Log</span>
    </>
  );
}
