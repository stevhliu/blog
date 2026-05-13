import { Caption } from "../caption";

const COLORS = {
  malloc: "#ff7614",
  mallocSoft: "rgba(255, 118, 20, 0.16)",
  mallocSofter: "rgba(255, 118, 20, 0.08)",
  tensor: "#c1b0ff",
  tensorEdge: "#8d77e8",
  done: "#0a8a4a",
  doneAccent: "#26b56a",
};

const CYCLE = 10;

// Memory grid — chunky blocks
const COLS = 10;
const ROWS = 4;
const CELL = 22;
const CELL_GAP = 3;
const STRIDE = CELL + CELL_GAP; // 25
const GRID_W = COLS * STRIDE - CELL_GAP; // 247
const GRID_H = ROWS * STRIDE - CELL_GAP; // 97

type TensorSpec = { row: number; col: number; span: number };
const TENSORS: TensorSpec[] = [
  { row: 0, col: 0, span: 3 },
  { row: 0, col: 3, span: 4 },
  { row: 0, col: 7, span: 3 },
  { row: 1, col: 0, span: 5 },
  { row: 1, col: 5, span: 5 },
  { row: 2, col: 0, span: 4 },
  { row: 2, col: 4, span: 6 },
  { row: 3, col: 0, span: 10 },
];
const N = TENSORS.length;

function rectFor(t: TensorSpec) {
  return {
    x: t.col * STRIDE,
    y: t.row * STRIDE,
    width: t.span * STRIDE - CELL_GAP,
    height: CELL,
  };
}

// ---- Timing ----
const COLD_START = 0.4;
const COLD_INTERVAL = 0.95;
const WARMUP_START = 0;
const WARMUP_DUR = 0.9;
const WARM_TENSOR_START = WARMUP_DUR + 0.2;
const WARM_INTERVAL = 0.28;

const COLD_TENSOR_AT = (i: number) => COLD_START + i * COLD_INTERVAL;
const WARM_TENSOR_AT = (i: number) => WARM_TENSOR_START + i * WARM_INTERVAL;

const COLD_DONE = COLD_TENSOR_AT(N - 1) + 0.4;
const WARM_DONE = WARM_TENSOR_AT(N - 1) + 0.4;

// ---- Layout ----
const VIEW_WIDTH = 700;
const SIDE_MARGIN = 32;
const SIDE_WIDTH = (VIEW_WIDTH - SIDE_MARGIN * 2 - 40) / 2; // 40px gutter
const COLD_X = SIDE_MARGIN;
const WARM_X = SIDE_MARGIN + SIDE_WIDTH + 40;
const GRID_OFFSET_X = (SIDE_WIDTH - GRID_W) / 2;

const LEGEND_Y = 14;
const SECTION_HEADER_Y = 42;
const TAG_ROW_Y = 60;
const GRID_TOP_Y = 84;
const GRID_BOTTOM_Y = GRID_TOP_Y + GRID_H;
const COUNTER_Y = GRID_BOTTOM_Y + 24;
const VIEW_HEIGHT = COUNTER_Y + 18;

const TAG_H = 16;

function CellGrid({ x, y }: { x: number; y: number }) {
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * STRIDE}
          y={r * STRIDE}
          width={CELL}
          height={CELL}
          rx={3}
          className="fill-[#f1f0ec] dark:fill-[#1f1f23] stroke-[#dad4c8] dark:stroke-[#33333a]"
          strokeWidth={0.6}
        />,
      );
    }
  }
  return <g transform={`translate(${x},${y})`}>{cells}</g>;
}

function TensorBlock({
  spec,
  appearAt,
}: {
  spec: TensorSpec;
  appearAt: number;
}) {
  const { x, y, width, height } = rectFor(spec);
  const s = appearAt / CYCLE;
  const e = (appearAt + 0.18) / CYCLE;
  return (
    <g opacity={0}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={COLORS.tensor}
      />
      <animate
        attributeName="opacity"
        values={`0;0;1;1;0`}
        keyTimes={`0;${s};${e};0.97;1`}
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
      />
    </g>
  );
}

function MallocPill({
  x,
  y,
  width,
  start,
  label = "cudaMalloc",
}: {
  x: number;
  y: number;
  width: number;
  start: number;
  label?: string;
}) {
  const appear = start / CYCLE;
  const hold = (start + 0.45) / CYCLE;
  const fade = (start + 0.85) / CYCLE;
  return (
    <g transform={`translate(${x},${y})`} opacity={0}>
      <rect
        x={0}
        y={0}
        width={width}
        height={TAG_H}
        rx={TAG_H / 2}
        fill={COLORS.mallocSoft}
        stroke={COLORS.malloc}
        strokeOpacity={0.35}
        strokeWidth={0.8}
      />
      <circle cx={9} cy={TAG_H / 2} r={2.8} fill={COLORS.malloc} />
      <text
        x={width / 2 + 5}
        y={TAG_H / 2 + 3.4}
        textAnchor="middle"
        fill={COLORS.malloc}
        style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.01em" }}
      >
        {label}
      </text>
      <animate
        attributeName="opacity"
        values={`0;0;1;1;0;0`}
        keyTimes={`0;${appear};${hold};${fade};${fade + 0.005};1`}
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
      />
    </g>
  );
}

function Counter({
  x,
  y,
  steps,
  totalLabel,
}: {
  x: number;
  y: number;
  steps: { at: number; value: number }[];
  totalLabel: string;
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx={5} cy={-4} r={3.5} fill={COLORS.malloc} />
      {steps.map((step, i) => {
        const s = step.at / CYCLE;
        const next = steps[i + 1];
        const e = next ? next.at / CYCLE : 0.97;
        const eEnd = Math.min(e + 0.003, 1);
        return (
          <text
            key={i}
            x={16}
            y={0}
            className="fill-black dark:fill-[#ececec]"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
            opacity={0}
          >
            {step.value}
            <animate
              attributeName="opacity"
              values={`0;0;1;1;0;0`}
              keyTimes={`0;${s};${s + 0.003};${e};${eEnd};1`}
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
            />
          </text>
        );
      })}
      <text
        x={32}
        y={0}
        className="fill-[#555354] dark:fill-[#a8a59d]"
        style={{ fontSize: "11px", fontWeight: 500 }}
      >
        {totalLabel}
      </text>
    </g>
  );
}

export function CudaAllocatorDiagram() {
  const coldSteps = [
    { at: 0, value: 0 },
    ...TENSORS.map((_, i) => ({
      at: COLD_TENSOR_AT(i) - 0.05,
      value: i + 1,
    })),
  ];
  const warmSteps = [
    { at: 0, value: 0 },
    { at: WARMUP_START + 0.05, value: 1 },
  ];

  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Animated diagram comparing CUDA allocator with and without warmup"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Legend — centered */}
          <g transform={`translate(${(VIEW_WIDTH - 195) / 2}, ${LEGEND_Y})`}>
            <rect
              x={0}
              y={1}
              width={14}
              height={9}
              rx={4.5}
              fill={COLORS.mallocSoft}
            />
            <circle cx={7} cy={5.5} r={2.5} fill={COLORS.malloc} />
            <text
              x={22}
              y={8}
              className="fill-black dark:fill-[#ececec]"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              cudaMalloc
            </text>
            <rect
              x={108}
              y={1}
              width={10}
              height={9}
              rx={2}
              fill={COLORS.tensor}
            />
            <text
              x={124}
              y={8}
              className="fill-black dark:fill-[#ececec]"
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              tensor
            </text>
          </g>

          {/* ---------- Cold (left) ---------- */}
          <g transform={`translate(${COLD_X}, 0)`}>
            <text
              x={SIDE_WIDTH / 2}
              y={SECTION_HEADER_Y}
              textAnchor="middle"
              className="fill-black dark:fill-[#ececec]"
              style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              cold
            </text>

            <CellGrid x={GRID_OFFSET_X} y={GRID_TOP_Y} />

            {/* Tensors */}
            <g transform={`translate(${GRID_OFFSET_X},${GRID_TOP_Y})`}>
              {TENSORS.map((spec, i) => (
                <TensorBlock
                  key={i}
                  spec={spec}
                  appearAt={COLD_TENSOR_AT(i)}
                />
              ))}
            </g>

            {/* Malloc pills above the grid (single position, width matches the tensor) */}
            <g transform={`translate(${GRID_OFFSET_X}, 0)`}>
              {TENSORS.map((spec, i) => {
                const r = rectFor(spec);
                const minW = 78;
                const w = Math.max(r.width, minW);
                const px = r.x + (r.width - w) / 2;
                return (
                  <MallocPill
                    key={i}
                    x={px}
                    y={TAG_ROW_Y}
                    width={w}
                    start={COLD_TENSOR_AT(i) - 0.45}
                  />
                );
              })}
            </g>

            <Counter
              x={GRID_OFFSET_X}
              y={COUNTER_Y}
              steps={coldSteps}
              totalLabel={`/ ${N} cudaMalloc`}
            />
          </g>

          {/* ---------- Warmed (right) ---------- */}
          <g transform={`translate(${WARM_X}, 0)`}>
            <text
              x={SIDE_WIDTH / 2}
              y={SECTION_HEADER_Y}
              textAnchor="middle"
              className="fill-black dark:fill-[#ececec]"
              style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              warmed
            </text>

            <CellGrid x={GRID_OFFSET_X} y={GRID_TOP_Y} />

            {/* Warmup block — dashed outline covering the whole memory region */}
            <g transform={`translate(${GRID_OFFSET_X},${GRID_TOP_Y})`} opacity={0}>
              <rect
                x={-4}
                y={-4}
                width={GRID_W + 8}
                height={GRID_H + 8}
                rx={6}
                fill={COLORS.mallocSofter}
                stroke={COLORS.malloc}
                strokeWidth={1.1}
                strokeDasharray="4,3"
              />
              <animate
                attributeName="opacity"
                values={`0;0;1;1;0`}
                keyTimes={`0;${WARMUP_START / CYCLE};${(WARMUP_START + WARMUP_DUR) / CYCLE};0.97;1`}
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
              />
            </g>

            {/* Tensors fill the warmed block */}
            <g transform={`translate(${GRID_OFFSET_X},${GRID_TOP_Y})`}>
              {TENSORS.map((spec, i) => (
                <TensorBlock
                  key={i}
                  spec={spec}
                  appearAt={WARM_TENSOR_AT(i)}
                />
              ))}
            </g>

            {/* Single warmup pill spanning the full grid width */}
            <g transform={`translate(${GRID_OFFSET_X}, 0)`}>
              <MallocPill
                x={-4}
                y={TAG_ROW_Y}
                width={GRID_W + 8}
                start={WARMUP_START}
                label="cudaMalloc · torch.empty()"
              />
            </g>

            <Counter
              x={GRID_OFFSET_X}
              y={COUNTER_Y}
              steps={warmSteps}
              totalLabel={`/ 1 cudaMalloc`}
            />

            {/* Done pill */}
            {(() => {
              const labelAppear = WARM_DONE / CYCLE;
              return (
                <g
                  transform={`translate(${GRID_OFFSET_X + GRID_W - 70}, ${COUNTER_Y - 12})`}
                  opacity={0}
                >
                  <rect
                    x={0}
                    y={0}
                    width={70}
                    height={14}
                    rx={7}
                    fill={COLORS.doneAccent}
                    opacity={0.18}
                  />
                  <text
                    x={35}
                    y={10}
                    textAnchor="middle"
                    fill={COLORS.done}
                    style={{ fontSize: "9px", fontWeight: 600 }}
                  >
                    1 call · done
                  </text>
                  <animate
                    attributeName="opacity"
                    values={`0;0;1;1;0`}
                    keyTimes={`0;${labelAppear};${labelAppear + 0.005};0.97;1`}
                    dur={`${CYCLE}s`}
                    repeatCount="indefinite"
                  />
                </g>
              );
            })()}
          </g>

          {/* Subtle divider between the two paths */}
          <line
            x1={VIEW_WIDTH / 2}
            y1={SECTION_HEADER_Y - 14}
            x2={VIEW_WIDTH / 2}
            y2={COUNTER_Y + 4}
            className="stroke-[#dad4c8] dark:stroke-[#2e2e33]"
            strokeWidth={0.6}
            strokeDasharray="3,4"
          />
        </svg>
      </div>
      <Caption>
        Each tensor in the cold path pays its own <code>cudaMalloc</code>. One
        upfront <code>torch.empty()</code> claims a single block sized to the
        whole model; every subsequent tensor carves a piece from that cached
        block.
      </Caption>
    </figure>
  );
}
