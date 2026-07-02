const PCIE_ARROW = "#0090ff";

const VIEW_WIDTH = 690;
const MID_X = VIEW_WIDTH / 2;
const COL_L_X = 180;
const COL_R_X = 510;

const NODE_RX = 4;
const NODE_H = 34;
const GROUP_PAD = 14;
const GROUP_LABEL_Y = 10;
const RAIL_CORNER_R = 8;

const railStrokeClass = "stroke-[#b7b2a6] dark:stroke-[#4a4a50]";
const railHeadClass = "fill-[#b7b2a6] dark:fill-[#4a4a50]";

const diagramMono = {
  fontFamily:
    'var(--font-geist-mono), "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
} as const;

const nodeTitleStyle = {
  ...diagramMono,
  fontSize: "10.5px",
  fontWeight: 500,
  letterSpacing: "0.03em",
} as const;

const nodeSubStyle = {
  ...diagramMono,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.02em",
} as const;

const groupLabelStyle = {
  ...diagramMono,
  fontSize: "8.5px",
  fontWeight: 500,
  letterSpacing: "0.08em",
} as const;

const noteStyle = {
  ...diagramMono,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.02em",
} as const;

type BoxVariant = "solid" | "deferred" | "read" | "copy";

const BOX_CLASS: Record<BoxVariant, string> = {
  solid:
    "fill-[var(--color-bg)] stroke-[#cbc5bc] dark:stroke-[#33333a]",
  deferred:
    "fill-[var(--color-bg)] stroke-[#cbc5bc] dark:stroke-[#33333a]",
  read: "fill-[#00ca48]/[0.12] stroke-[#00ca48]",
  copy: "fill-[#0090ff]/[0.12] stroke-[#0090ff]",
};

function FlowNode({
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

function BranchRail({
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

function FlowArrow({
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
  const lineClass = color
    ? undefined
    : "stroke-[#b7b2a6] dark:stroke-[#4a4a50]";
  const headClass = color ? undefined : "fill-[#b7b2a6] dark:fill-[#4a4a50]";
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

function GroupRegion({
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
        y={y + GROUP_LABEL_Y}
        className="fill-[#7c7a72] dark:fill-[#8a8780]"
        style={groupLabelStyle}
      >
        {label}
      </text>
    </g>
  );
}

export function MmapLazyReadDiagram() {
  const DISK_Y = 18;
  const VIEW_Y = 88;
  const FORK_Y = VIEW_Y + NODE_H;
  const RAIL_Y = FORK_Y + 18;
  const STAGE1_Y = 178;
  const STAGE2_Y = 252;
  const GROUP_TOP = STAGE1_Y - GROUP_PAD - 4;
  const GROUP_H = STAGE2_Y + NODE_H + GROUP_PAD - GROUP_TOP;
  const NOTE_Y = STAGE2_Y + NODE_H + 28;
  const VIEW_HEIGHT = NOTE_Y + 30;

  const leftGroupX = COL_L_X - 102;
  const rightGroupX = COL_R_X - 102;
  const groupW = 204;

  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Flow diagram of the deferred mmap read, branching into CPU and GPU destinations"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <FlowNode
            cx={MID_X}
            y={DISK_Y}
            width={164}
            title="model.safetensors"
            sub="file on disk"
            variant="solid"
          />

          <FlowArrow x={MID_X} y1={DISK_Y + NODE_H} y2={VIEW_Y} />

          <FlowNode
            cx={MID_X}
            y={VIEW_Y}
            width={164}
            title="tensor view"
            sub="zero bytes moved"
            variant="deferred"
          />

          <BranchRail
            midX={MID_X}
            forkY={FORK_Y}
            railY={RAIL_Y}
            endX={COL_L_X}
            endY={STAGE1_Y}
          />
          <BranchRail
            midX={MID_X}
            forkY={FORK_Y}
            railY={RAIL_Y}
            endX={COL_R_X}
            endY={STAGE1_Y}
          />

          <GroupRegion
            x={leftGroupX}
            y={GROUP_TOP}
            width={groupW}
            height={GROUP_H}
            label="CPU"
          />
          <GroupRegion
            x={rightGroupX}
            y={GROUP_TOP}
            width={groupW}
            height={GROUP_H}
            label="GPU"
          />

          <FlowNode
            cx={COL_L_X}
            y={STAGE1_Y}
            width={172}
            title="CPU tensor"
            sub="still a view, nothing read"
            variant="deferred"
          />
          <FlowArrow
            x={COL_L_X}
            y1={STAGE1_Y + NODE_H}
            y2={STAGE2_Y}
            dashed
          />
          <FlowNode
            cx={COL_L_X}
            y={STAGE2_Y}
            width={172}
            title="bytes in RAM"
            sub="disk read happens here"
            variant="read"
          />
          <text
            x={COL_L_X}
            y={NOTE_Y}
            textAnchor="middle"
            className="fill-[#7c7a72] dark:fill-[#8a8780]"
            style={noteStyle}
          >
            deferred until an op touches the tensor,
          </text>
          <text
            x={COL_L_X}
            y={NOTE_Y + 12}
            textAnchor="middle"
            className="fill-[#7c7a72] dark:fill-[#8a8780]"
            style={noteStyle}
          >
            like a conversion or the forward pass
          </text>

          <FlowNode
            cx={COL_R_X}
            y={STAGE1_Y}
            width={172}
            title="CPU RAM"
            sub="pages faulted in from disk"
            variant="read"
          />
          <FlowArrow
            x={COL_R_X}
            y1={STAGE1_Y + NODE_H}
            y2={STAGE2_Y}
            color={PCIE_ARROW}
          />
          <FlowNode
            cx={COL_R_X}
            y={STAGE2_Y}
            width={172}
            title="GPU memory"
            sub="tensor on device"
            variant="copy"
          />
          <text
            x={COL_R_X}
            y={NOTE_Y}
            textAnchor="middle"
            className="fill-[#7c7a72] dark:fill-[#8a8780]"
            style={noteStyle}
          >
            forced now, both steps happen
          </text>
          <text
            x={COL_R_X}
            y={NOTE_Y + 12}
            textAnchor="middle"
            className="fill-[#7c7a72] dark:fill-[#8a8780]"
            style={noteStyle}
          >
            inside .to(device)
          </text>
        </svg>
      </div>
    </figure>
  );
}
