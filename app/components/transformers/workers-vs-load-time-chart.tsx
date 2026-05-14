import { Caption } from "../caption";

const COLORS = {
  line: "#c1b0ff", // Ube Haze
  lineEdge: "#8d77e8",
  dot: "#c1b0ff",
  dotEdge: "#8d77e8",
  highlight: "#ff7614", // Tangerine — saturation marker
  highlightSoft: "rgba(255, 118, 20, 0.12)",
};

const CYCLE = 9;

const VIEW_WIDTH = 700;
const VIEW_HEIGHT = 300;

const CHART_X = 78;
const CHART_Y = 40;
const CHART_W = 560;
const CHART_H = 200;
const X_END = CHART_X + CHART_W;
const Y_END = CHART_Y + CHART_H;

const X_MIN = 1;
const X_MAX = 8;
const Y_MAX = 9; // seconds

const xScale = (n: number) =>
  CHART_X + ((n - X_MIN) / (X_MAX - X_MIN)) * CHART_W;
const yScale = (t: number) => Y_END - (t / Y_MAX) * CHART_H;

const DATA = [
  { n: 1, t: 8.0 },
  { n: 2, t: 4.5 },
  { n: 3, t: 4.0 },
  { n: 4, t: 3.5 },
  { n: 5, t: 3.55 },
  { n: 6, t: 3.65 },
  { n: 7, t: 3.8 },
  { n: 8, t: 4.0 },
];

const SATURATION_N = 4;
const Y_TICKS = [0, 2, 4, 6, 8];
const X_TICKS = DATA.map((d) => d.n);

const linePath = DATA.map(
  (d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.n)} ${yScale(d.t)}`,
).join(" ");

// Approximate path length for dash animation
const pathLengthFraction = 0.7; // draw-in lasts 70% of cycle

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
            style={{ fontSize: "10px", fontWeight: 500 }}
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
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 400,
                    fontVariantNumeric: "tabular-nums",
                  }}
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
                  style={{
                    fontSize: "10px",
                    fontWeight: 400,
                    fontVariantNumeric: "tabular-nums",
                  }}
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
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            workers
          </text>

          {/* The curve — drawn in via stroke-dashoffset */}
          <path
            d={linePath}
            fill="none"
            stroke={COLORS.lineEdge}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100}
          >
            <animate
              attributeName="stroke-dashoffset"
              values="100;100;0;0;100"
              keyTimes={`0;0.04;${pathLengthFraction};0.97;1`}
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
            />
          </path>

          {/* Data points — appear sequentially as the line passes */}
          {DATA.map((d, i) => {
            const isSaturation = d.n === SATURATION_N;
            const appearAt = 0.04 + (i / (DATA.length - 1)) * (pathLengthFraction - 0.04);
            return (
              <g key={d.n} opacity={0}>
                <circle
                  cx={xScale(d.n)}
                  cy={yScale(d.t)}
                  r={isSaturation ? 5 : 3.6}
                  fill={isSaturation ? COLORS.highlight : COLORS.dot}
                  stroke={isSaturation ? COLORS.highlight : COLORS.dotEdge}
                  strokeWidth={1.2}
                />
                {/* Value label above the saturation dot */}
                {isSaturation && (
                  <text
                    x={xScale(d.n)}
                    y={yScale(d.t) - 10}
                    textAnchor="middle"
                    fill={COLORS.highlight}
                    style={{
                      fontSize: "9.5px",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {d.t.toFixed(1)}s
                  </text>
                )}
                <animate
                  attributeName="opacity"
                  values="0;0;1;1;0"
                  keyTimes={`0;${appearAt};${appearAt + 0.005};0.97;1`}
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
