import { Caption } from "../caption";

const COLORS = {
  malloc: "#474645",
  mallocSoft: "rgba(71, 70, 69, 0.16)",
  mallocSofter: "rgba(71, 70, 69, 0.08)",
  tensor: "#00ca48",
  tensorEdge: "#00a23a",
  done: "#474645",
  doneAccent: "#474645",
};

const CYCLE = 10;

// Memory grid — chunky blocks
const COLS = 10;
const ROWS = 4;
const CELL = 22;
const CELL_GAP = 7;
const STRIDE = CELL + CELL_GAP; // 29
const GRID_W = COLS * STRIDE - CELL_GAP; // 283
const GRID_H = ROWS * STRIDE - CELL_GAP; // 109

type TensorSpec = { row: number; col: number; span: number };
const TENSORS: TensorSpec[] = [
  { row: 0, col: 0, span: 3 }, // A — new
  { row: 0, col: 3, span: 4 }, // B — new
  { row: 0, col: 7, span: 3 }, // A — cache hit
  { row: 1, col: 0, span: 5 }, // C — new
  { row: 1, col: 5, span: 5 }, // C — cache hit
  { row: 2, col: 0, span: 4 }, // B — cache hit
  { row: 2, col: 4, span: 6 }, // D — new
  { row: 3, col: 0, span: 10 }, // E — new
];
const N = TENSORS.length;

// Same-shape tensors share a cudaMalloc — only the first occurrence of each
// shape (here keyed by span) triggers a real malloc; subsequent same-shape
// tensors reuse the cached block.
const isNewShape = (() => {
  const seen = new Set<number>();
  return TENSORS.map((t) => {
    const fresh = !seen.has(t.span);
    seen.add(t.span);
    return fresh;
  });
})();
const COLD_MALLOC_COUNT = isNewShape.filter(Boolean).length;

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

const SECTION_HEADER_Y = 16;
const GRID_TOP_Y = 34;
const GRID_BOTTOM_Y = GRID_TOP_Y + GRID_H;
const COUNTER_Y = GRID_BOTTOM_Y + 24;
const VIEW_HEIGHT = COUNTER_Y + 18;

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

function MallocOutline({
  spec,
  appearAt,
}: {
  spec: TensorSpec;
  appearAt: number;
}) {
  const { x, y, width, height } = rectFor(spec);
  const PAD = 2;
  // Outline appears with the tensor and persists for the rest of the cycle,
  // marking which tensors triggered a real cudaMalloc.
  const showStart = Math.max(0, appearAt - 0.2);
  const ks = showStart / CYCLE;
  const kIn = (showStart + 0.06) / CYCLE;
  return (
    <rect
      x={x - PAD}
      y={y - PAD}
      width={width + PAD * 2}
      height={height + PAD * 2}
      rx={5}
      fill={COLORS.mallocSofter}
      stroke={COLORS.malloc}
      strokeWidth={1.2}
      strokeDasharray="3,3"
      opacity={0}
    >
      <animate
        attributeName="opacity"
        values={`0;0;1;1;0`}
        keyTimes={`0;${ks};${kIn};0.97;1`}
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
      />
    </rect>
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
  // Counter starts at 1 and only increments when a new shape triggers a real
  // cudaMalloc.
  const coldSteps = (() => {
    const steps: { at: number; value: number }[] = [{ at: 0, value: 1 }];
    let count = 1;
    let first = true;
    TENSORS.forEach((_, i) => {
      if (!isNewShape[i]) return;
      if (first) {
        first = false;
        return; // first new shape is already represented by the initial 1
      }
      count += 1;
      steps.push({ at: COLD_TENSOR_AT(i) - 0.05, value: count });
    });
    return steps;
  })();
  const warmSteps = [{ at: 0, value: 1 }];

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

            {/* Every tensor sits inside an allocated region — outline every
                one. The counter only ticks for tensors that triggered a real
                cudaMalloc (new shapes); cache-hit tensors reuse memory but
                still live within a cudaMalloc'd block. */}
            <g transform={`translate(${GRID_OFFSET_X},${GRID_TOP_Y})`}>
              {TENSORS.map((spec, i) => (
                <MallocOutline
                  key={i}
                  spec={spec}
                  appearAt={COLD_TENSOR_AT(i)}
                />
              ))}
            </g>

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

            <Counter
              x={GRID_OFFSET_X + (GRID_W - 145) / 2}
              y={COUNTER_Y}
              steps={coldSteps}
              totalLabel={`cudaMalloc · ${N} tensors`}
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

            <Counter
              x={GRID_OFFSET_X + (GRID_W - 145) / 2}
              y={COUNTER_Y}
              steps={warmSteps}
              totalLabel={`cudaMalloc · ${N} tensors`}
            />
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
    </figure>
  );
}
