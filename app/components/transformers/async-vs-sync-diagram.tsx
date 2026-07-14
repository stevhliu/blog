import { chartLabelStyle, chartTextClassName } from "../chart-typography";
import { FreezeSmilOnReducedMotion } from "../freeze-smil";
import {
  AnimateHide,
  AnimatePulse,
  BOX_CLASS,
  FlowArrow,
  FlowNode,
  GroupRegion,
  NoteLines,
  noteStyle,
  StepCounter,
} from "./flow-primitives";

const VIEW_WIDTH = 700;
const SIDE_MARGIN = 32;
const SIDE_WIDTH = (VIEW_WIDTH - SIDE_MARGIN * 2 - 40) / 2;
const COL_L = SIDE_MARGIN + SIDE_WIDTH / 2;
const COL_R = SIDE_MARGIN + SIDE_WIDTH + 40 + SIDE_WIDTH / 2;

const HEADER_Y = 16;
const SCAN_Y = 30;
const GROUP_Y = 88;
const BLOCK_W = 170;
const BLOCK_H = 20;
const BLOCK_STRIDE = 27;
const FIRST_BLOCK_Y = 106;
const N_BLOCKS = 4;
const GROUP_H =
  FIRST_BLOCK_Y + (N_BLOCKS - 1) * BLOCK_STRIDE + BLOCK_H + 12 - GROUP_Y;
const CONVERT_Y = GROUP_Y + GROUP_H + 24;
const NOTE_Y = CONVERT_Y + 34 + 22;
const VIEW_HEIGHT = NOTE_Y + 24;

const LAYERS = ["layers.0", "layers.1", "layers.2", "layers.3"];

// One loading cycle. On the async path the workers materialize every weight
// almost immediately while convert() drains them slowly, so the tensors
// overlap and pile up. On the sync path each _job() only runs when convert()
// consumes it, so at most one weight is materialized at a time. Both columns
// finish around the same point in the cycle; the contrast is the overlap.
const CYCLE = 9;
const ASYNC_ON = [0.5, 1.05, 1.6, 2.15];
const ASYNC_OFF = [3.0, 4.5, 6.0, 7.5];
const SYNC_ON = [0.5, 2.35, 4.2, 6.05];
const SYNC_OFF = SYNC_ON.map((t) => t + 1.15);

function counterSteps(on: number[], off: number[]) {
  const events = [
    ...on.map((t) => ({ t, d: +1 })),
    ...off.map((t) => ({ t, d: -1 })),
  ].sort((a, b) => a.t - b.t);
  let value = 0;
  return [
    { at: 0, text: "0 in RAM" },
    ...events.map((e) => ({ at: e.t, text: `${(value += e.d)} in RAM` })),
  ];
}

function MiniBlock({
  cx,
  y,
  pendingText,
  tensorText,
  on,
  off,
}: {
  cx: number;
  y: number;
  pendingText: string;
  tensorText: string;
  on: number;
  off: number;
}) {
  return (
    <g transform={`translate(${cx - BLOCK_W / 2},${y})`}>
      <rect
        x={0}
        y={0}
        width={BLOCK_W}
        height={BLOCK_H}
        rx={3}
        className={BOX_CLASS.deferred}
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <g opacity={0}>
        <rect
          x={0}
          y={0}
          width={BLOCK_W}
          height={BLOCK_H}
          rx={3}
          className={BOX_CLASS.read}
          strokeWidth={1}
        />
        <AnimatePulse on={on} off={off} cycle={CYCLE} />
      </g>
      <text
        x={BLOCK_W / 2}
        y={13.5}
        textAnchor="middle"
        className="fill-[#7c7a72] dark:fill-[#8a8780]"
        style={noteStyle}
        opacity={1}
      >
        {pendingText}
        <AnimateHide at={on} cycle={CYCLE} />
      </text>
      <text
        x={BLOCK_W / 2}
        y={13.5}
        textAnchor="middle"
        className="fill-black dark:fill-[#ececec]"
        style={noteStyle}
        opacity={0}
      >
        {tensorText}
        <AnimatePulse on={on} off={off} cycle={CYCLE} />
      </text>
    </g>
  );
}

function Column({
  cx,
  header,
  scanSub,
  pendingLabel,
  on,
  off,
  convertSub,
  noteLines,
}: {
  cx: number;
  header: string;
  scanSub: string;
  pendingLabel: (layer: string) => string;
  on: number[];
  off: number[];
  convertSub: string;
  noteLines: string[];
}) {
  return (
    <g>
      <text
        x={cx}
        y={HEADER_Y}
        textAnchor="middle"
        className={chartTextClassName}
        style={{ ...chartLabelStyle, letterSpacing: "-0.01em" }}
      >
        {header}
      </text>
      <FlowNode
        cx={cx}
        y={SCAN_Y}
        width={200}
        title="scan + collect keys"
        sub={scanSub}
        variant="solid"
      />
      <FlowArrow x={cx} y1={SCAN_Y + 34} y2={FIRST_BLOCK_Y} />
      <GroupRegion
        x={cx - 116}
        y={GROUP_Y}
        width={232}
        height={GROUP_H}
        label="COLLECTED_TENSORS"
      />
      <StepCounter
        x={cx + 106}
        y={GROUP_Y + 10}
        cycle={CYCLE}
        steps={counterSteps(on, off)}
      />
      {LAYERS.map((layer, i) => (
        <MiniBlock
          key={layer}
          cx={cx}
          y={FIRST_BLOCK_Y + i * BLOCK_STRIDE}
          pendingText={pendingLabel(layer)}
          tensorText={`${layer} · torch.Tensor`}
          on={on[i]}
          off={off[i]}
        />
      ))}
      <FlowArrow x={cx} y1={GROUP_Y + GROUP_H} y2={CONVERT_Y} />
      <FlowNode
        cx={cx}
        y={CONVERT_Y}
        width={200}
        title="convert()"
        sub={convertSub}
        variant="solid"
      />
      <NoteLines cx={cx} y={NOTE_Y} lines={noteLines} />
    </g>
  );
}

export function AsyncVsSyncDiagram() {
  return (
    <figure className="my-10">
      <FreezeSmilOnReducedMotion freezeAt={2.5}>
        <div className="mx-auto w-full">
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="w-full"
            role="img"
            aria-label="Animated comparison of the async path, where worker threads materialize real tensors ahead of conversion and pile up in RAM, against the sync path, where each deferred callable materializes one weight at a time"
            style={{
              fontFamily:
                "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
            }}
          >
            <Column
              cx={COL_L}
              header="async path"
              scanSub="submits a Future per weight"
              pendingLabel={(layer) => `${layer} · Future`}
              on={ASYNC_ON}
              off={ASYNC_OFF}
              convertSub="drains slower than workers fill"
              noteLines={[
                "workers materialize ahead of convert(),",
                "real tensors pile up in RAM",
              ]}
            />
            <Column
              cx={COL_R}
              header="sync path"
              scanSub="stores a _job callable"
              pendingLabel={(layer) => `${layer} · _job()`}
              on={SYNC_ON}
              off={SYNC_OFF}
              convertSub="each read runs when it's consumed"
              noteLines={[
                "callables hold no tensor bytes,",
                "one weight materializes at a time",
              ]}
            />

            {/* Divider between the two paths */}
            <line
              x1={VIEW_WIDTH / 2}
              y1={HEADER_Y - 12}
              x2={VIEW_WIDTH / 2}
              y2={NOTE_Y + 12}
              className="stroke-[#dad4c8] dark:stroke-[#2e2e33]"
              strokeWidth={0.6}
              strokeDasharray="3,4"
            />
          </svg>
        </div>
      </FreezeSmilOnReducedMotion>
    </figure>
  );
}
