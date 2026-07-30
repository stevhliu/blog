import { buildTrimmedLinePath, pointLineGap } from "../chart-line-segments";
import { Caption } from "../caption";
import {
  chartAnnotationStyle,
  chartTickTabularStyle,
} from "../chart-typography";

const DATA = [
  { date: "2022-11-15", name: "Switch Transformers", cumulative: 1 },
  { date: "2023-03-27", name: "NLLB-MoE", cumulative: 2 },
  { date: "2023-12-11", name: "Mixtral", cumulative: 3 },
  { date: "2024-03-27", name: "Qwen2MoE", cumulative: 4 },
  { date: "2024-04-18", name: "DBRX", cumulative: 5 },
  { date: "2024-04-18", name: "Jamba", cumulative: 6 },
  { date: "2024-05-14", name: "JetMoE", cumulative: 7 },
  { date: "2024-09-03", name: "OLMoE", cumulative: 8 },
  { date: "2024-09-20", name: "GraniteMoE", cumulative: 9 },
  { date: "2024-10-04", name: "PhiMoE", cumulative: 10 },
  { date: "2024-12-06", name: "Aria", cumulative: 11 },
  { date: "2025-01-08", name: "ViTPose++", cumulative: 12 },
  { date: "2025-02-14", name: "GraniteMoeShared", cumulative: 13 },
  { date: "2025-03-28", name: "DeepSeek-V3", cumulative: 14 },
  { date: "2025-03-31", name: "Qwen3 MoE", cumulative: 15 },
  { date: "2025-04-05", name: "Llama 4", cumulative: 16 },
  { date: "2025-05-05", name: "GraniteMoeHybrid", cumulative: 17 },
  { date: "2025-06-04", name: "MiniMax", cumulative: 18 },
  { date: "2025-06-25", name: "dots.llm1", cumulative: 19 },
  { date: "2025-07-08", name: "Doge", cumulative: 20 },
  { date: "2025-07-09", name: "DeepSeek-V2", cumulative: 21 },
  { date: "2025-07-21", name: "ERNIE 4.5 MoE", cumulative: 22 },
  { date: "2025-07-21", name: "GLM-4 MoE", cumulative: 23 },
  { date: "2025-08-05", name: "gpt-oss", cumulative: 24 },
  { date: "2025-08-08", name: "GLM-4V MoE", cumulative: 25 },
  { date: "2025-08-22", name: "Hunyuan V1 MoE", cumulative: 26 },
  { date: "2025-09-10", name: "Qwen3-Next", cumulative: 27 },
  { date: "2025-09-15", name: "Qwen3-VL MoE", cumulative: 28 },
  { date: "2025-09-17", name: "LongCat Flash", cumulative: 29 },
  { date: "2025-09-18", name: "FlexOlmo", cumulative: 30 },
  { date: "2025-09-21", name: "Qwen3-Omni MoE", cumulative: 31 },
  { date: "2025-10-07", name: "LFM2-MoE", cumulative: 32 },
  { date: "2025-11-29", name: "AFMoE", cumulative: 33 },
  { date: "2025-12-19", name: "ERNIE 4.5 VL MoE", cumulative: 34 },
  { date: "2026-01-09", name: "MiniMax M2", cumulative: 35 },
  { date: "2026-01-13", name: "GLM4 MoE Lite", cumulative: 36 },
  { date: "2026-01-22", name: "SolarOpen", cumulative: 37 },
  { date: "2026-02-04", name: "EXAONE MoE", cumulative: 38 },
  { date: "2026-02-09", name: "GLM MoE DSA", cumulative: 39 },
  { date: "2026-02-09", name: "Qwen3.5 MoE", cumulative: 40 },
  { date: "2026-03-16", name: "Mistral 4", cumulative: 41 },
  { date: "2026-04-02", name: "Gemma 4", cumulative: 42 },
  { date: "2026-04-22", name: "HY V3", cumulative: 43 },
  { date: "2026-04-28", name: "Laguna", cumulative: 44 },
  { date: "2026-05-02", name: "DeepSeek-V4", cumulative: 45 },
  { date: "2026-05-05", name: "Gemma 4 Assistant", cumulative: 46 },
  { date: "2026-05-20", name: "Cohere2 MoE", cumulative: 47 },
  { date: "2026-05-28", name: "Mellum", cumulative: 48 },
  { date: "2026-06-02", name: "DeepSeek-OCR-2", cumulative: 49 },
  { date: "2026-06-11", name: "DeepSeek-V3.2", cumulative: 50 },
  { date: "2026-06-12", name: "MiniMax M3-VL", cumulative: 51 },
  { date: "2026-07-01", name: "ZAYA", cumulative: 52 },
].map(d => ({
  ...d,
  time: Date.parse(`${d.date}T00:00:00Z`),
}));

const VIEW_WIDTH = 760;
const VIEW_HEIGHT = 340;
const CHART_X = 74;
const CHART_Y = 44;
const CHART_W = 626;
const CHART_H = 210;
const X_END = CHART_X + CHART_W;
const Y_END = CHART_Y + CHART_H;
const Y_MAX = 60;

const COLORS = {
  line: "#00ca48",
  dot: "#00ca48",
  grid: "#dad4c8",
  gridDark: "#2e2e33",
  text: "#555354",
  textDark: "#a8a59d",
  marker: "#474645",
};

const DOT_RADIUS = 3.5;
const DOT_STROKE_WIDTH = 3;
const DOT_LINE_GAP = pointLineGap(DOT_RADIUS, DOT_STROKE_WIDTH);

const minTime = Date.parse("2025-01-01T00:00:00Z");
const maxTime = DATA[DATA.length - 1].time;

const xScale = (time: number) =>
  CHART_X + ((time - minTime) / (maxTime - minTime)) * CHART_W;

const yScale = (value: number) => Y_END - (value / Y_MAX) * CHART_H;

const Y_TICKS = [0, 15, 30, 45, 60];
const X_TICKS = [
  { label: "2025", time: Date.parse("2025-01-01T00:00:00Z") },
  { label: "2026", time: Date.parse("2026-01-01T00:00:00Z") },
];
const CONVERTER_DATE = "2025-11-13";
const converterTime = Date.parse(`${CONVERTER_DATE}T00:00:00Z`);

const chartData = DATA.filter(d => d.time >= minTime);

const chartPoints = chartData.map(d => ({
  x: xScale(d.time),
  y: yScale(d.cumulative),
}));

const linePath = buildTrimmedLinePath(chartPoints, () => DOT_LINE_GAP);

const first2025 = DATA.find(d => d.date.startsWith("2025"))!;
const finalPoint = DATA[DATA.length - 1];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function MoEModelsOverTimeChart() {
  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Linear line chart showing the cumulative number of mixture-of-experts models added to Transformers over time"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <style>
            {`
              .moe-point-label {
                opacity: 0;
                pointer-events: none;
                transition: opacity 120ms ease;
              }

              .moe-point-guide {
                opacity: 0;
                pointer-events: none;
                transition: opacity 120ms ease;
              }

              .moe-point:hover .moe-point-label,
              .moe-point:focus .moe-point-label {
                opacity: 1;
              }

              .moe-point:hover .moe-point-guide,
              .moe-point:focus .moe-point-guide {
                opacity: 1;
              }

              .moe-point:focus {
                outline: none;
              }
            `}
          </style>
          <text
            x={CHART_X}
            y={22}
            className="fill-[#474645] dark:fill-[#eee7db]"
            style={{ fontSize: "15px", fontWeight: 650 }}
          >
            MoE models in Transformers
          </text>

          {Y_TICKS.map(tick => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={CHART_X}
                  y1={y}
                  x2={X_END}
                  y2={y}
                  className="stroke-[#dad4c8] dark:stroke-[#2e2e33]"
                  strokeWidth={0.6}
                  strokeDasharray={tick === 0 ? undefined : "2,3"}
                />
                <text
                  x={CHART_X - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#555354] dark:fill-[#a8a59d]"
                  style={chartTickTabularStyle}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {X_TICKS.map(tick => {
            const x = xScale(tick.time);
            return (
              <g key={tick.label}>
                <line
                  x1={x}
                  y1={CHART_Y}
                  x2={x}
                  y2={Y_END}
                  className="stroke-[#dad4c8] dark:stroke-[#2e2e33]"
                  strokeWidth={0.5}
                  strokeDasharray="2,4"
                />
                <text
                  x={x}
                  y={Y_END + 20}
                  textAnchor="middle"
                  className="fill-[#555354] dark:fill-[#a8a59d]"
                  style={chartTickTabularStyle}
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          <g>
            <line
              x1={xScale(converterTime)}
              y1={CHART_Y}
              x2={xScale(converterTime)}
              y2={Y_END}
              className="stroke-[#0090ff]"
              strokeWidth={0.9}
              strokeDasharray="3,4"
            />
            <text
              x={xScale(converterTime) + 8}
              y={CHART_Y + 12}
              className="fill-[#0090ff]"
              style={chartAnnotationStyle}
            >
              dynamic weight converter
            </text>
          </g>

          <path
            d={linePath}
            fill="none"
            stroke={COLORS.line}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {chartData.map(d => {
            const x = xScale(d.time);
            const y = yScale(d.cumulative);
            const isNearRightEdge = x > X_END - 92;
            const labelBelow = y < CHART_Y + 34;
            const labelX = x + (isNearRightEdge ? -12 : 12);
            const labelY = y + (labelBelow ? 22 : -16);

            return (
              <g
                key={`${d.date}-${d.name}`}
                className="moe-point"
                tabIndex={0}
                aria-label={`${d.name}: ${d.cumulative} by ${formatDate(
                  d.date
                )}`}
              >
                <line
                  x1={CHART_X}
                  y1={y}
                  x2={x}
                  y2={y}
                  className="moe-point-guide stroke-[#00ca48]"
                  strokeWidth={0.8}
                  strokeDasharray="2,3"
                />
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={Y_END}
                  className="moe-point-guide stroke-[#00ca48]"
                  strokeWidth={0.8}
                  strokeDasharray="2,3"
                />
                <circle cx={x} cy={y} r={8} fill="transparent" stroke="none" />
                <circle
                  cx={x}
                  cy={y}
                  r={DOT_RADIUS}
                  fill={COLORS.dot}
                  className="stroke-[var(--color-bg)]"
                  strokeWidth={DOT_STROKE_WIDTH}
                />
                <g className="moe-point-label">
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor={isNearRightEdge ? "end" : "start"}
                    className="fill-[#00ca48]"
                    style={chartAnnotationStyle}
                  >
                    {d.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      <Caption>
        Cumulative mixture-of-experts architectures added to Transformers through July 1, 2026.
      </Caption>
    </figure>
  );
}
