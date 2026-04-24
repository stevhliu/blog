"use client";

import { useEffect, useRef } from "react";

/**
 * Two-pose ASCII cat that swaps "arms" every 500ms.
 * Pose B is padded with a blank top row so both poses occupy 6 lines —
 * without this the layout jumps by one line-height every swap.
 *
 * Pauses entirely under prefers-reduced-motion.
 */
const POSE_A =
  "♪\n　　　　 ∧＿＿∧　　　♪\n　　　 （´・ω・｀∩\n　　 　　o　　　,ﾉ\n　　　　Ｏ＿　.ﾉ\n♪　　　 　 (ノ";

const POSE_B =
  "\n　　　　∧＿＿∧　♪\n　　　 ∩・ω・｀）\n　　　 |　　   ⊂ﾉ\n　　　｜　　 _⊃　　♪\n　　　 し ⌒";

const POSES = [POSE_A, POSE_B];

export function AsciiCat() {
  const catRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let pose = 0;
    const id = window.setInterval(() => {
      pose = (pose + 1) % POSES.length;
      if (catRef.current) {
        catRef.current.textContent = POSES[pose];
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <pre ref={catRef} className="ascii-cat" aria-hidden="true">
        {POSE_A}
      </pre>
      <span className="sr-only">Observation Log</span>
    </>
  );
}
