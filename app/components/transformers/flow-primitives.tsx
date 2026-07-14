// Shared primitives for the transformers loading-pipeline flow diagrams.
// Visual language matches mmap-lazy-read-diagram: mono node labels,
// dashed = deferred/lazy, green = disk read, blue = copy/transfer.

export const READ_COLOR = "#00ca48";
export const COPY_COLOR = "#0090ff";

export const NODE_RX = 4;
export const NODE_H = 34;
export const RAIL_CORNER_R = 8;

export const railStrokeClass = "stroke-[#b7b2a6] dark:stroke-[#4a4a50]";
export const railHeadClass = "fill-[#b7b2a6] dark:fill-[#4a4a50]";

export const diagramMono = {
  fontFamily:
    'var(--font-geist-mono), "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
} as const;

export const nodeTitleStyle = {
  ...diagramMono,
  fontSize: "10.5px",
  fontWeight: 500,
  letterSpacing: "0.03em",
} as const;

export const nodeSubStyle = {
  ...diagramMono,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.02em",
} as const;

export const groupLabelStyle = {
  ...diagramMono,
  fontSize: "8.5px",
  fontWeight: 500,
  letterSpacing: "0.08em",
} as const;

export const noteStyle = {
  ...diagramMono,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.02em",
} as const;

export type BoxVariant = "solid" | "deferred" | "read" | "copy";

export const BOX_CLASS: Record<BoxVariant, string> = {
  solid: "fill-[var(--color-bg)] stroke-[#cbc5bc] dark:stroke-[#33333a]",
  deferred: "fill-[var(--color-bg)] stroke-[#cbc5bc] dark:stroke-[#33333a]",
  read: "fill-[#00ca48]/[0.12] stroke-[#00ca48]",
  copy: "fill-[#0090ff]/[0.12] stroke-[#0090ff]",
};

export function FlowNode({
  cx,
  y,
  width,
  title,
  sub,
  variant,
}: {
  cx: number;
  y: number;
  width: number;
  title: string;
  sub: string;
  variant: BoxVariant;
}) {
  return (
    <g transform={`translate(${cx - width / 2},${y})`}>
      <rect
        x={0}
        y={0}
        width={width}
        height={NODE_H}
        rx={NODE_RX}
        className={BOX_CLASS[variant]}
        strokeWidth={1}
        strokeDasharray={variant === "deferred" ? "3,3" : undefined}
      />
      <text
        x={width / 2}
        y={15}
        textAnchor="middle"
        className="fill-black dark:fill-[#ececec]"
        style={nodeTitleStyle}
      >
        {title}
      </text>
      <text
        x={width / 2}
        y={27}
        textAnchor="middle"
        className="fill-[#7c7a72] dark:fill-[#8a8780]"
        style={nodeSubStyle}
      >
        {sub}
      </text>
    </g>
  );
}

export function FlowArrow({
  x,
  y1,
  y2,
  color,
  dashed,
}: {
  x: number;
  y1: number;
  y2: number;
  color?: string;
  dashed?: boolean;
}) {
  const lineClass = color ? undefined : railStrokeClass;
  const headClass = color ? undefined : railHeadClass;
  return (
    <g>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2 - 5}
        className={lineClass}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashed ? "3,3" : undefined}
        strokeLinecap="square"
      />
      <polygon
        points={`${x - 3},${y2 - 5} ${x + 3},${y2 - 5} ${x},${y2}`}
        className={headClass}
        fill={color}
      />
    </g>
  );
}

export function HArrow({
  y,
  x1,
  x2,
  color,
  dashed,
}: {
  y: number;
  x1: number;
  x2: number;
  color?: string;
  dashed?: boolean;
}) {
  const lineClass = color ? undefined : railStrokeClass;
  const headClass = color ? undefined : railHeadClass;
  const dir = x2 > x1 ? 1 : -1;
  const tip = x2;
  const base = x2 - 5 * dir;
  return (
    <g>
      <line
        x1={x1}
        y1={y}
        x2={base}
        y2={y}
        className={lineClass}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashed ? "3,3" : undefined}
        strokeLinecap="square"
      />
      <polygon
        points={`${base},${y - 3} ${base},${y + 3} ${tip},${y}`}
        className={headClass}
        fill={color}
      />
    </g>
  );
}

export function GroupRegion({
  x,
  y,
  width,
  height,
  label,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={NODE_RX}
        fill="none"
        className="stroke-[#dad4c8] dark:stroke-[#2a2a30]"
        strokeWidth={1}
        strokeDasharray="4,4"
      />
      <text
        x={x + 10}
        y={y + 10}
        className="fill-[#7c7a72] dark:fill-[#8a8780]"
        style={groupLabelStyle}
      >
        {label}
      </text>
    </g>
  );
}

function branchRailPath(
  midX: number,
  forkY: number,
  railY: number,
  endX: number,
  endY: number,
) {
  const r = RAIL_CORNER_R;
  if (endX < midX) {
    return `M ${midX} ${forkY} V ${railY} H ${endX + r} A ${r} ${r} 0 0 0 ${endX} ${railY + r} V ${endY - 5}`;
  }
  return `M ${midX} ${forkY} V ${railY} H ${endX - r} A ${r} ${r} 0 0 1 ${endX} ${railY + r} V ${endY - 5}`;
}

export function BranchRail({
  midX,
  forkY,
  railY,
  endX,
  endY,
}: {
  midX: number;
  forkY: number;
  railY: number;
  endX: number;
  endY: number;
}) {
  return (
    <g>
      <path
        d={branchRailPath(midX, forkY, railY, endX, endY)}
        fill="none"
        className={railStrokeClass}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`${endX - 3},${endY - 5} ${endX + 3},${endY - 5} ${endX},${endY}`}
        className={railHeadClass}
      />
    </g>
  );
}

// The inverse of BranchRail: two column rails that turn inward and join at
// midX on a horizontal rail. Pair with a FlowArrow from (midX, railY) down
// into the destination node.
export function MergeRail({
  midX,
  colX,
  startY,
  railY,
}: {
  midX: number;
  colX: number;
  startY: number;
  railY: number;
}) {
  const r = RAIL_CORNER_R;
  const d =
    colX < midX
      ? `M ${colX} ${startY} V ${railY - r} A ${r} ${r} 0 0 0 ${colX + r} ${railY} H ${midX}`
      : `M ${colX} ${startY} V ${railY - r} A ${r} ${r} 0 0 1 ${colX - r} ${railY} H ${midX}`;
  return (
    <path
      d={d}
      fill="none"
      className={railStrokeClass}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

// SMIL opacity helpers for the animated diagrams. Each renders an <animate>
// that targets its parent element, so place it as a direct child of the
// g/rect/text it should drive, with the parent's opacity attribute set to
// the first value. All loops reset near the end of the cycle (0.97) the way
// cuda-allocator-diagram does.

function keyTimes(cycle: number, times: number[]) {
  return times
    .map((t) => +Math.min(Math.max(t / cycle, 0), 1).toFixed(4))
    .join(";");
}

// Hidden, then visible from `on` to `off`. Parent opacity: 0.
export function AnimatePulse({
  on,
  off,
  cycle,
  ramp = 0.15,
}: {
  on: number;
  off: number;
  cycle: number;
  ramp?: number;
}) {
  return (
    <animate
      attributeName="opacity"
      values="0;0;1;1;0;0"
      keyTimes={`0;${keyTimes(cycle, [on, on + ramp, off, off + ramp])};1`}
      dur={`${cycle}s`}
      repeatCount="indefinite"
    />
  );
}

// Hidden until `at`, visible for the rest of the cycle. Parent opacity: 0.
export function AnimateShow({
  at,
  cycle,
  ramp = 0.15,
}: {
  at: number;
  cycle: number;
  ramp?: number;
}) {
  return (
    <animate
      attributeName="opacity"
      values="0;0;1;1;0"
      keyTimes={`0;${keyTimes(cycle, [at, at + ramp, 0.97 * cycle])};1`}
      dur={`${cycle}s`}
      repeatCount="indefinite"
    />
  );
}

// Visible until `at`, hidden for the rest of the cycle. Parent opacity: 1.
export function AnimateHide({
  at,
  cycle,
  ramp = 0.15,
}: {
  at: number;
  cycle: number;
  ramp?: number;
}) {
  return (
    <animate
      attributeName="opacity"
      values="1;1;0;0;1"
      keyTimes={`0;${keyTimes(cycle, [at, at + ramp, 0.97 * cycle])};1`}
      dur={`${cycle}s`}
      repeatCount="indefinite"
    />
  );
}

// Stepping text readout (e.g. a live memory counter), same pattern as the
// cudaMalloc counter in cuda-allocator-diagram: each step's text is visible
// from its `at` until the next step's `at`, and everything resets at 0.97.
export function StepCounter({
  x,
  y,
  cycle,
  steps,
}: {
  x: number;
  y: number;
  cycle: number;
  steps: { at: number; text: string }[];
}) {
  return (
    <g>
      {steps.map((step, i) => {
        const s = step.at / cycle;
        const e = (steps[i + 1]?.at ?? 0.97 * cycle) / cycle;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="end"
            className="fill-[#7c7a72] dark:fill-[#8a8780]"
            style={{ ...noteStyle, fontVariantNumeric: "tabular-nums" }}
            opacity={0}
          >
            {step.text}
            <animate
              attributeName="opacity"
              values="0;0;1;1;0;0"
              keyTimes={`0;${s.toFixed(4)};${Math.min(s + 0.005, 1).toFixed(4)};${e.toFixed(4)};${Math.min(e + 0.005, 1).toFixed(4)};1`}
              dur={`${cycle}s`}
              repeatCount="indefinite"
            />
          </text>
        );
      })}
    </g>
  );
}

export function NoteLines({
  cx,
  y,
  lines,
  anchor = "middle",
}: {
  cx: number;
  y: number;
  lines: string[];
  anchor?: "middle" | "start" | "end";
}) {
  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={y + i * 12}
          textAnchor={anchor}
          className="fill-[#7c7a72] dark:fill-[#8a8780]"
          style={noteStyle}
        >
          {line}
        </text>
      ))}
    </g>
  );
}
