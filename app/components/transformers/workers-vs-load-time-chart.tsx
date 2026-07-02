import {
  buildTrimmedLinePath,
  pointLineGap,
} from "../chart-line-segments";
import {
  chartAnnotationStyle,
  chartLabelStyle,
  chartTickTabularStyle,
} from "../chart-typography";
import { Caption } from "../caption";
import {
  LOAD_TIME_AXIS_MAX,
  LOAD_TIME_DATA,
  LOAD_TIME_TICKS,
} from "./loading-benchmark-data";

const COLORS = {
  line: "#00ca48",
  dot: "#00ca48",
  highlightSoft: "rgba(71, 70, 69, 0.12)",
};

const DOT_RADIUS = 7;
const DOT_STROKE_WIDTH = 4.5;

function dotGap(_index: number) {
  return pointLineGap(DOT_RADIUS, DOT_STROKE_WIDTH);
}

const VIEW_WIDTH = 700;
const VIEW_HEIGHT = 300;

const CHART_X = 78;
const CHART_Y = 40;
const CHART_W = 560;
const CHART_H = 200;
const X_END = CHART_X + CHART_W;
const Y_END = CHART_Y + CHART_H;

const X_MIN = 1;
const X_MAX = 16;
const Y_MAX = LOAD_TIME_AXIS_MAX;

const xScale = (n: number) =>
  CHART_X + ((n - X_MIN) / (X_MAX - X_MIN)) * CHART_W;
const yScale = (t: number) => Y_END - (t / Y_MAX) * CHART_H;

const DATA = LOAD_TIME_DATA;

const SATURATION_N = 4;
const Y_TICKS = LOAD_TIME_TICKS;
const X_TICKS = DATA.map((d) => d.n);

const chartPoints = DATA.map(d => ({
  x: xScale(d.n),
  y: yScale(d.t),
}));

const linePath = buildTrimmedLinePath(chartPoints, dotGap);

export function WorkersVsLoadTimeChart() {
  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Chart of weight load time versus number of worker threads"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Y-axis label */}
          <text
            x={20}
            y={CHART_Y + CHART_H / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${CHART_Y + CHART_H / 2})`}
            className="fill-[#555354] dark:fill-[#a8a59d]"
            style={chartLabelStyle}
          >
            load time (s)
          </text>

          {/* Horizontal grid + Y-axis ticks */}
          {Y_TICKS.map((t) => {
            const y = yScale(t);
            return (
              <g key={`yt-${t}`}>
                <line
                  x1={CHART_X}
                  y1={y}
                  x2={X_END}
                  y2={y}
                  className="stroke-[#dad4c8] dark:stroke-[#2e2e33]"
                  strokeWidth={0.5}
                  strokeDasharray={t === 0 ? undefined : "2,3"}
                />
                <text
                  x={CHART_X - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#555354] dark:fill-[#a8a59d]"
                  style={chartTickTabularStyle}
                >
                  {t}s
                </text>
              </g>
            );
          })}

          {/* X-axis baseline */}
          <line
            x1={CHART_X}
            y1={Y_END}
            x2={X_END}
            y2={Y_END}
            className="stroke-[#dad4c8] dark:stroke-[#3a3a3e]"
            strokeWidth={0.8}
          />

          {/* X-axis ticks + labels */}
          {X_TICKS.map((n) => {
            const x = xScale(n);
            return (
              <g key={`xt-${n}`}>
                <line
                  x1={x}
                  y1={Y_END}
                  x2={x}
                  y2={Y_END + 4}
                  className="stroke-[#dad4c8] dark:stroke-[#3a3a3e]"
                  strokeWidth={0.8}
                />
                <text
                  x={x}
                  y={Y_END + 16}
                  textAnchor="middle"
                  className="fill-[#555354] dark:fill-[#a8a59d]"
                  style={chartTickTabularStyle}
                >
                  {n}
                </text>
              </g>
            );
          })}

          {/* X-axis title */}
          <text
            x={CHART_X + CHART_W / 2}
            y={Y_END + 36}
            textAnchor="middle"
            className="fill-[#555354] dark:fill-[#a8a59d]"
            style={chartLabelStyle}
          >
            workers
          </text>

          {/* The curve */}
          <path
            d={linePath}
            fill="none"
            stroke={COLORS.line}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {DATA.map((d) => {
            const isSaturation = d.n === SATURATION_N;
            return (
              <g key={d.n}>
                <circle
                  cx={xScale(d.n)}
                  cy={yScale(d.t)}
                  r={DOT_RADIUS}
                  fill={COLORS.dot}
                  className="stroke-[var(--color-bg)]"
                  strokeWidth={DOT_STROKE_WIDTH}
                />
                {/* Value label above the saturation dot */}
                {isSaturation && (
                  <text
                    x={xScale(d.n)}
                    y={yScale(d.t) - 13}
                    textAnchor="middle"
                    fill="#0090ff"
                    style={{
                      ...chartAnnotationStyle,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {d.t.toFixed(1)}s
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <Caption>
        Tested loading Mixtral-8x7B-v0.1 on a cluster of H100s.
      </Caption>
    </figure>
  );
}
