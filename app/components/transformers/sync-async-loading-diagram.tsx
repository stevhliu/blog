"use client";

import { useState } from "react";
import { Caption } from "../caption";

const COLORS = {
  read: "#00ca48",
  readDark: "#00ca48",
  copy: "#0090ff",
  copyDark: "#0090ff",
  toggleAccent: "#0090ff",
  playhead: "#474645",
  done: "#474645",
  doneAccent: "#474645",
  queued: "#a8a59d",
};

const CYCLE = 14;
const TASK = 0.5;
const N_WEIGHTS = 12;
const SYNC_TIME = N_WEIGHTS * 1.0; // 12s
const PX_PER_S = 42;
const W = TASK * PX_PER_S; // 21px per task
const X0 = 100;
const X_END = X0 + SYNC_TIME * PX_PER_S; // 604

type BarKind = "read" | "copy";
type Task = { start: number; kind: BarKind };

function Bar({
  x,
  y,
  start,
  kind,
}: {
  x: number;
  y: number;
  start: number;
  kind: BarKind;
}) {
  const s = start / CYCLE;
  const e = (start + TASK) / CYCLE;
  const fillLight = kind === "read" ? COLORS.read : COLORS.copy;
  const fillDark = kind === "read" ? COLORS.readDark : COLORS.copyDark;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={0}
        y={0}
        width={W}
        height={14}
        rx={3}
        className="fill-[#f1f0ec] dark:fill-[#1f1f23] stroke-[#dad4c8] dark:stroke-[#33333a]"
        strokeWidth={0.6}
      />
      <rect
        x={0}
        y={0}
        width={0}
        height={14}
        rx={3}
        className="dark:hidden"
        fill={fillLight}
      >
        <animate
          attributeName="width"
          values={`0;0;${W};${W};0`}
          keyTimes={`0;${s};${e};0.97;1`}
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x={0}
        y={0}
        width={0}
        height={14}
        rx={3}
        className="hidden dark:block"
        fill={fillDark}
      >
        <animate
          attributeName="width"
          values={`0;0;${W};${W};0`}
          keyTimes={`0;${s};${e};0.97;1`}
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
        />
      </rect>
    </g>
  );
}

function QueuedBar({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={0}
        y={0}
        width={width}
        height={14}
        rx={3}
        fill="url(#queued-stripes)"
        className="stroke-[#dad4c8] dark:stroke-[#33333a]"
        strokeWidth={0.6}
      />
      <text
        x={width / 2}
        y={10}
        textAnchor="middle"
        className="fill-[#7c7a72] dark:fill-[#8a8780]"
        style={{ fontSize: "8.5px", fontWeight: 500, letterSpacing: "0.02em" }}
      >
        queued
      </text>
    </g>
  );
}

function TimeAxis({ y }: { y: number }) {
  const ticks = [0, 3, 6, 9, 12];
  return (
    <g transform={`translate(0,${y})`}>
      <line
        x1={X0}
        y1={0}
        x2={X_END}
        y2={0}
        className="stroke-[#dad4c8] dark:stroke-[#3a3a3e]"
        strokeWidth={0.8}
      />
      {ticks.map((t) => {
        const tx = X0 + t * PX_PER_S;
        return (
          <g key={t} transform={`translate(${tx},0)`}>
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={4}
              className="stroke-[#dad4c8] dark:stroke-[#3a3a3e]"
              strokeWidth={0.8}
            />
            <text
              x={0}
              y={14}
              textAnchor="middle"
              className="fill-[#555354] dark:fill-[#a8a59d]"
              style={{ fontSize: "9px", fontWeight: 400, letterSpacing: "0.02em" }}
            >
              {t}s
            </text>
          </g>
        );
      })}
    </g>
  );
}

function buildSchedule(N: number) {
  // Workers are staggered by a full task duration so disk reads on one
  // worker visibly overlap CPU→GPU copies on another (only 1 disk + 1
  // PCIe copy engine, so reads serialize and copies serialize).
  const STAGGER = TASK; // 0.5s
  if (N <= 4) {
    const workers = Array.from({ length: N }, (_, i) => {
      const myWeights: number[] = [];
      for (let w = i; w < N_WEIGHTS; w += N) myWeights.push(w);
      const offset = i * STAGGER;
      const tasks: Task[] = [];
      myWeights.forEach((_, idx) => {
        const start = offset + idx * 1.0;
        tasks.push({ start, kind: "read" });
        tasks.push({ start: start + TASK, kind: "copy" });
      });
      return { tasks, queued: false };
    });
    const maxWeights = Math.ceil(N_WEIGHTS / N);
    const totalTime = maxWeights * 1.0 + (N - 1) * STAGGER;
    return { workers, totalTime };
  }
  // N > 4: only 4 active workers handle the work, each does N_WEIGHTS/4 weights
  const perWorker = N_WEIGHTS / 4;
  const workers = Array.from({ length: N }, (_, i) => {
    if (i < 4) {
      const offset = i * STAGGER;
      const tasks: Task[] = [];
      for (let w = 0; w < perWorker; w++) {
        tasks.push({ start: offset + w * 1.0, kind: "read" });
        tasks.push({ start: offset + w * 1.0 + TASK, kind: "copy" });
      }
      return { tasks, queued: false };
    }
    return { tasks: [] as Task[], queued: true };
  });
  return { workers, totalTime: perWorker * 1.0 + 3 * STAGGER };
}

const ROW_H = 22;
const ASYNC_BARS_Y0 = 0;

export function SyncAsyncLoadingDiagram() {
  const [workerCount, setWorkerCount] = useState(4);
  const { workers, totalTime } = buildSchedule(workerCount);

  const syncTasks: Task[] = [];
  for (let i = 0; i < N_WEIGHTS; i++) {
    syncTasks.push({ start: i, kind: "read" });
    syncTasks.push({ start: i + TASK, kind: "copy" });
  }

  // Match the sync bar fill rate exactly: playhead reaches X_END at t = SYNC_TIME.
  const syncEndFrac = SYNC_TIME / CYCLE;
  const playheadKeyTimes = `0;${syncEndFrac};0.97;1`;
  const sweepValues = `${X0};${X_END};${X_END};${X0}`;

  const syncDoneAppear = SYNC_TIME / CYCLE;
  const asyncDoneAppear = totalTime / CYCLE;

  // Dynamic height: header (36) + N rows + axis(28) + footer(20)
  const asyncSectionHeight = ASYNC_BARS_Y0 + workerCount * ROW_H + 28;
  const SYNC_TOP = 38;
  const SYNC_HEIGHT = 44;
  const ASYNC_TOP = SYNC_TOP + SYNC_HEIGHT + 32;
  const TOGGLE_Y = ASYNC_TOP + asyncSectionHeight + 10;
  const TOGGLE_HEIGHT = 30;
  const VIEW_HEIGHT = TOGGLE_Y + TOGGLE_HEIGHT + 6;
  const VIEW_WIDTH = 690;

  const workerOptions = [2, 3, 4, 5, 6];

  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Animated diagram comparing synchronous and asynchronous weight loading"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <defs>
            <pattern
              id="queued-stripes"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" className="fill-[#ecebe6] dark:fill-[#1c1c20]" />
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={6}
                className="stroke-[#cfc9bc] dark:stroke-[#33333a]"
                strokeWidth={2}
              />
            </pattern>
          </defs>

          {/* Legend — centered above the diagram */}
          <g transform={`translate(${(VIEW_WIDTH - 160) / 2}, 14)`}>
            <circle cx={5} cy={5} r={4.5} fill={COLORS.read} className="dark:hidden" />
            <circle cx={5} cy={5} r={4.5} fill={COLORS.readDark} className="hidden dark:block" />
            <text
              x={16}
              y={8}
              className="fill-black dark:fill-[#ececec]"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              disk → CPU
            </text>
            <circle cx={95} cy={5} r={4.5} fill={COLORS.copy} className="dark:hidden" />
            <circle cx={95} cy={5} r={4.5} fill={COLORS.copyDark} className="hidden dark:block" />
            <text
              x={106}
              y={8}
              className="fill-black dark:fill-[#ececec]"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              CPU → GPU
            </text>
          </g>

          {/* ---------- Sync section ---------- */}
          <g transform={`translate(0, ${SYNC_TOP})`}>
            <text
              x={88}
              y={10}
              textAnchor="end"
              className="fill-[#555354] dark:fill-[#a8a59d]"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              thread
            </text>
            {syncTasks.map((t, i) => (
              <Bar
                key={i}
                x={X0 + t.start * PX_PER_S}
                y={0}
                start={t.start}
                kind={t.kind}
              />
            ))}

            <line
              x1={X0}
              y1={-4}
              x2={X0}
              y2={20}
              stroke={COLORS.playhead}
              strokeWidth={1.2}
              strokeDasharray="2,3"
              strokeLinecap="round"
            >
              <animate
                attributeName="x1"
                values={sweepValues}
                keyTimes={playheadKeyTimes}
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values={sweepValues}
                keyTimes={playheadKeyTimes}
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
              />
            </line>

            <g transform={`translate(${X_END + 8}, 0)`} opacity={0}>
              <text
                x={0}
                y={10}
                textAnchor="start"
                fill={COLORS.playhead}
                style={{ fontSize: "9px", fontWeight: 600 }}
              >
                12s
              </text>
              <animate
                attributeName="opacity"
                values={`0;0;1;1;0`}
                keyTimes={`0;${syncDoneAppear};${syncDoneAppear + 0.005};0.97;1`}
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
              />
            </g>

            <TimeAxis y={26} />
          </g>

          {/* Toggle (rendered via foreignObject so it's interactive HTML) */}
          <foreignObject x={0} y={TOGGLE_Y} width={VIEW_WIDTH} height={TOGGLE_HEIGHT}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontFamily:
                  "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
              }}
              {...({ xmlns: "http://www.w3.org/1999/xhtml" } as object)}
            >
              <span
                style={{ fontSize: "10px", fontWeight: 500 }}
                className="text-[#555354] dark:text-[#a8a59d]"
              >
                workers
              </span>
              <div
                className="inline-flex rounded-full border border-[#dad4c8] dark:border-[#33333a] bg-white dark:bg-[#1c1c20] p-[2px]"
                role="radiogroup"
                aria-label="Number of async workers"
              >
                {workerOptions.map((n) => {
                  const active = n === workerCount;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setWorkerCount(n)}
                      role="radio"
                      aria-checked={active}
                      className={
                        active
                          ? "rounded-full px-3 py-[3px] font-medium text-white"
                          : "rounded-full px-3 py-[3px] font-medium text-[#555354] dark:text-[#a8a59d] hover:text-black dark:hover:text-white"
                      }
                      style={{
                        fontSize: "11px",
                        background: active ? COLORS.toggleAccent : "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 120ms ease",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          </foreignObject>

          {/* ---------- Async section ---------- */}
          <g
            transform={`translate(0, ${ASYNC_TOP})`}
            key={`async-${workerCount}`}
          >
            {workers.map((w, wi) => {
              const y = ASYNC_BARS_Y0 + wi * ROW_H;
              return (
                <g key={wi}>
                  <text
                    x={88}
                    y={y + 10}
                    textAnchor="end"
                    className="fill-[#555354] dark:fill-[#a8a59d]"
                    style={{ fontSize: "10px", fontWeight: 500 }}
                  >
                    worker {wi}
                  </text>
                  {w.queued ? (
                    <QueuedBar x={X0} y={y} width={totalTime * PX_PER_S} />
                  ) : (
                    w.tasks.map((t, i) => (
                      <Bar
                        key={i}
                        x={X0 + t.start * PX_PER_S}
                        y={y}
                        start={t.start}
                        kind={t.kind}
                      />
                    ))
                  )}
                </g>
              );
            })}

            {(() => {
              const asyncEndX = X0 + totalTime * PX_PER_S;
              const bracketBottom = ASYNC_BARS_Y0 + workerCount * ROW_H - 4;
              const doneLabel = `~${totalTime.toFixed(1)}s`;
              return (
                <g>
                  <line
                    x1={X0}
                    y1={ASYNC_BARS_Y0 - 4}
                    x2={X0}
                    y2={bracketBottom}
                    stroke={COLORS.doneAccent}
                    strokeWidth={1.2}
                    strokeDasharray="2,3"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="x1"
                      values={`${X0};${asyncEndX};${asyncEndX};${X0}`}
                      keyTimes={`0;${asyncDoneAppear};0.97;1`}
                      dur={`${CYCLE}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="x2"
                      values={`${X0};${asyncEndX};${asyncEndX};${X0}`}
                      keyTimes={`0;${asyncDoneAppear};0.97;1`}
                      dur={`${CYCLE}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                  <g
                    transform={`translate(${asyncEndX + 6}, ${ASYNC_BARS_Y0 - 4})`}
                    opacity={0}
                  >
                    <text
                      x={0}
                      y={10}
                      textAnchor="start"
                      fill={COLORS.done}
                      style={{ fontSize: "9px", fontWeight: 600 }}
                    >
                      {doneLabel}
                    </text>
                    <animate
                      attributeName="opacity"
                      values={`0;0;1;1;0`}
                      keyTimes={`0;${asyncDoneAppear};${asyncDoneAppear + 0.005};0.97;1`}
                      dur={`${CYCLE}s`}
                      repeatCount="indefinite"
                    />
                  </g>
                </g>
              );
            })()}

            <TimeAxis y={ASYNC_BARS_Y0 + workerCount * ROW_H + 4} />
          </g>

        </svg>
      </div>
    </figure>
  );
}
