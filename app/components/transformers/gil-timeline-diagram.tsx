import {
  chartLabelStyle,
  chartTextClassName,
} from "../chart-typography";

const COLORS = {
  read: "#00ca48",
  copy: "#0090ff",
  playhead: "#474645",
};

const GIL_FILL_CLASS = "fill-[#474645] dark:fill-[#d6d3ca]";

const CYCLE = 8;
// The GIL is held only for the brief Python moments: submitting the job,
// stepping between native calls, and wrapping the finished result. The long
// read and copy stretches run in native code with the GIL released.
const SLIVER = 0.07;
const READ = 1.2;
const COPY = 1.2;
const STAGGER = 0.35;
const AXIS_MAX = 4;

const X0 = 100;
const X_END = 604;
const PX_PER_S = (X_END - X0) / AXIS_MAX;

const ROW_H = 24;
const BAR_H = 14;
const ROW_LABEL_X = 34;

const THREADS = ["A", "B", "C", "D"];

type SpanKind = "read" | "copy";
type Span = { start: number; dur: number; kind: SpanKind };

const SCHEDULE = THREADS.map((_, i) => {
  const submitAt = i * STAGGER;
  const readStart = submitAt + SLIVER;
  const betweenAt = readStart + READ;
  const copyStart = betweenAt + SLIVER;
  const wrapAt = copyStart + COPY;
  const spans: Span[] = [
    { start: readStart, dur: READ, kind: "read" },
    { start: copyStart, dur: COPY, kind: "copy" },
  ];
  // Grab the GIL to submit, to hand the read off to the copy, and to wrap
  // the result. The stagger keeps grabs from ever colliding on the GIL lane.
  const slivers = [submitAt, betweenAt, wrapAt];
  return { spans, slivers };
});

const LAST_T =
  (THREADS.length - 1) * STAGGER + 3 * SLIVER + READ + COPY;

function SpanBar({ x, y, span }: { x: number; y: number; span: Span }) {
  const w = span.dur * PX_PER_S;
  const s = span.start / CYCLE;
  const e = (span.start + span.dur) / CYCLE;
  const fill = span.kind === "read" ? COLORS.read : COLORS.copy;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={0}
        y={0}
        width={w}
        height={BAR_H}
        rx={3}
        className="fill-[#f1f0ec] dark:fill-[#1f1f23] stroke-[#dad4c8] dark:stroke-[#33333a]"
        strokeWidth={0.6}
      />
      <rect x={0} y={0} width={0} height={BAR_H} rx={3} fill={fill}>
        <animate
          attributeName="width"
          values={`0;0;${w};${w};0`}
          keyTimes={`0;${s};${e};0.97;1`}
          dur={`${CYCLE}s`}
          repeatCount="indefinite"
        />
      </rect>
    </g>
  );
}

function GilSliver({ x, y, at }: { x: number; y: number; at: number }) {
  const s = at / CYCLE;
  const e = Math.min((at + SLIVER) / CYCLE, 0.96);
  return (
    <rect
      x={x}
      y={y}
      width={SLIVER * PX_PER_S}
      height={BAR_H}
      rx={1.5}
      className={GIL_FILL_CLASS}
      opacity={0}
    >
      <animate
        attributeName="opacity"
        values={`0;0;1;1;0`}
        keyTimes={`0;${s};${e};0.97;1`}
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
      />
    </rect>
  );
}

export function GilTimelineDiagram() {
  const LANES_TOP = 40;
  const GIL_Y = LANES_TOP + THREADS.length * ROW_H + 12;
  const VIEW_WIDTH = 690;
  const VIEW_HEIGHT = GIL_Y + BAR_H + 16;

  const sweepEndX = X0 + LAST_T * PX_PER_S;
  const sweepFrac = LAST_T / CYCLE;
  const sweepValues = `${X0};${sweepEndX};${sweepEndX};${X0}`;
  const sweepKeyTimes = `0;${sweepFrac};0.97;1`;

  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Animated timeline of four loader threads and a GIL lane that stays mostly empty"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Legend */}
          <g transform={`translate(168, 14)`}>
            <circle cx={5} cy={5} r={4.5} fill={COLORS.read} />
            <text
              x={16}
              y={8}
              className="fill-black dark:fill-[#ececec]"
              style={chartLabelStyle}
            >
              disk → CPU
            </text>
            <circle cx={120} cy={5} r={4.5} fill={COLORS.copy} />
            <text
              x={131}
              y={8}
              className="fill-black dark:fill-[#ececec]"
              style={chartLabelStyle}
            >
              CPU → GPU
            </text>
            <rect
              x={255}
              y={0.5}
              width={9}
              height={9}
              rx={1.5}
              className={GIL_FILL_CLASS}
            />
            <text
              x={270}
              y={8}
              className="fill-black dark:fill-[#ececec]"
              style={chartLabelStyle}
            >
              GIL held
            </text>
          </g>

          {/* Thread lanes */}
          {SCHEDULE.map((thread, i) => {
            const y = LANES_TOP + i * ROW_H;
            return (
              <g key={i}>
                <text
                  x={ROW_LABEL_X}
                  y={y + 10}
                  textAnchor="start"
                  className={chartTextClassName}
                  style={chartLabelStyle}
                >
                  thread {THREADS[i]}
                </text>
                {thread.spans.map((span, j) => (
                  <SpanBar
                    key={j}
                    x={X0 + span.start * PX_PER_S}
                    y={y}
                    span={span}
                  />
                ))}
                {thread.slivers.map((at, j) => (
                  <GilSliver key={j} x={X0 + at * PX_PER_S} y={y} at={at} />
                ))}
              </g>
            );
          })}

          {/* GIL lane — one interpreter, shared by every thread */}
          <g>
            <text
              x={ROW_LABEL_X}
              y={GIL_Y + 10}
              textAnchor="start"
              className={chartTextClassName}
              style={chartLabelStyle}
            >
              GIL
            </text>
            <rect
              x={X0}
              y={GIL_Y}
              width={X_END - X0}
              height={BAR_H}
              rx={3}
              className="fill-[#f1f0ec] dark:fill-[#1f1f23] stroke-[#dad4c8] dark:stroke-[#33333a]"
              strokeWidth={0.6}
            />
            {SCHEDULE.flatMap((thread, i) =>
              thread.slivers.map((at, j) => (
                <GilSliver
                  key={`${i}-${j}`}
                  x={X0 + at * PX_PER_S}
                  y={GIL_Y}
                  at={at}
                />
              )),
            )}
          </g>

          {/* Playhead sweeping across all lanes */}
          <line
            x1={X0}
            y1={LANES_TOP - 6}
            x2={X0}
            y2={GIL_Y + BAR_H + 4}
            stroke={COLORS.playhead}
            strokeWidth={1.2}
            strokeDasharray="2,3"
            strokeLinecap="round"
          >
            <animate
              attributeName="x1"
              values={sweepValues}
              keyTimes={sweepKeyTimes}
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values={sweepValues}
              keyTimes={sweepKeyTimes}
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
            />
          </line>
        </svg>
      </div>
    </figure>
  );
}
