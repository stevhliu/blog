import { chartLabelStyle, chartTextClassName } from "../chart-typography";
import { FreezeSmilOnReducedMotion } from "../freeze-smil";
import {
  AnimatePulse,
  AnimateShow,
  FlowArrow,
  FlowNode,
  GroupRegion,
  NoteLines,
  StepCounter,
} from "./flow-primitives";

const VIEW_WIDTH = 690;
const COL_L = 172;
const COL_R = 518;

const HEADER_Y = 16;
const STAGE1_Y = 48;
const STAGE2_Y = 92;
const GROUP_W = 220;
const NODE_W = 196;

// Left: both full copies live at once. Right: only the in-flight tensor does.
const L_GROUP_Y = 30;
const L_GROUP_H = STAGE2_Y + 34 + 14 - L_GROUP_Y;
const R_TENSOR_Y = 128;
const R_GROUP_Y = 110;
const R_GROUP_H = R_TENSOR_Y + 34 + 14 - R_GROUP_Y;
const NOTE_Y = 200;
const VIEW_HEIGHT = NOTE_Y + 24;

// One loading cycle. Eager init materializes the random weights, then reads
// the checkpoint into a second full copy (the 2× peak), and only frees the
// random copy once it's overwritten. The meta path streams one small tensor
// at a time through the same window; memory never climbs.
const CYCLE = 9;
const RANDOM_ON = 0.5;
const CHECKPOINT_ON = 2.0;
const RANDOM_OFF = 4.5;

const BLINKS = [0.5, 1.8, 3.1, 4.4, 5.7, 7.0];
const BLINK_DUR = 0.9;
const RAMP = 0.15;

// A single opacity track that pulses once per blink window.
function blinkAnimation() {
  const times: number[] = [0];
  const values: string[] = ["0"];
  for (const on of BLINKS) {
    times.push(on, on + RAMP, on + BLINK_DUR, on + BLINK_DUR + RAMP);
    values.push("0", "1", "1", "0");
  }
  times.push(CYCLE);
  values.push("0");
  return {
    values: values.join(";"),
    keyTimes: times.map((t) => +(t / CYCLE).toFixed(4)).join(";"),
  };
}

const BLINK = blinkAnimation();

const EAGER_STEPS = [
  { at: 0, text: "0GB in RAM" },
  { at: RANDOM_ON, text: "140GB in RAM" },
  { at: CHECKPOINT_ON, text: "280GB in RAM" },
  { at: RANDOM_OFF, text: "140GB in RAM" },
];

const META_STEPS = [
  { at: 0, text: "0GB in RAM" },
  ...BLINKS.flatMap((on) => [
    { at: on, text: "~1GB in RAM" },
    { at: on + BLINK_DUR, text: "0GB in RAM" },
  ]),
];

export function MetaDeviceDiagram() {
  return (
    <figure className="my-10">
      <FreezeSmilOnReducedMotion freezeAt={2.5}>
        <div className="mx-auto w-full">
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="w-full"
            role="img"
            aria-label="Animated comparison of eager initialization filling CPU memory with two full model copies against the meta device streaming one small tensor at a time"
            style={{
              fontFamily:
                "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
            }}
          >
            {/* ---------- Eager init (left) ---------- */}
            <text
              x={COL_L}
              y={HEADER_Y}
              textAnchor="middle"
              className={chartTextClassName}
              style={{ ...chartLabelStyle, letterSpacing: "-0.01em" }}
            >
              eager init
            </text>

            <GroupRegion
              x={COL_L - GROUP_W / 2}
              y={L_GROUP_Y}
              width={GROUP_W}
              height={L_GROUP_H}
              label="CPU MEMORY"
            />
            <StepCounter
              x={COL_L + 100}
              y={L_GROUP_Y + 10}
              cycle={CYCLE}
              steps={EAGER_STEPS}
            />
            <g opacity={0}>
              <FlowNode
                cx={COL_L}
                y={STAGE1_Y}
                width={NODE_W}
                title="random init weights"
                sub="~140GB · discarded later"
                variant="solid"
              />
              <AnimatePulse on={RANDOM_ON} off={RANDOM_OFF} cycle={CYCLE} />
            </g>
            <g opacity={0}>
              <FlowNode
                cx={COL_L}
                y={STAGE2_Y}
                width={NODE_W}
                title="checkpoint copy"
                sub="~140GB read from disk"
                variant="read"
              />
              <AnimateShow at={CHECKPOINT_ON} cycle={CYCLE} />
            </g>
            <NoteLines
              cx={COL_L}
              y={NOTE_Y}
              lines={[
                "two full copies of the model at once,",
                "peak ≈ 2× model size",
              ]}
            />

            {/* ---------- Meta device (right) ---------- */}
            <text
              x={COL_R}
              y={HEADER_Y}
              textAnchor="middle"
              className={chartTextClassName}
              style={{ ...chartLabelStyle, letterSpacing: "-0.01em" }}
            >
              meta device
            </text>

            <FlowNode
              cx={COL_R}
              y={STAGE1_Y}
              width={NODE_W}
              title="meta skeleton"
              sub="shapes + dtypes · 0 bytes"
              variant="deferred"
            />
            <FlowArrow x={COL_R} y1={STAGE1_Y + 34} y2={R_TENSOR_Y} />
            <GroupRegion
              x={COL_R - GROUP_W / 2}
              y={R_GROUP_Y}
              width={GROUP_W}
              height={R_GROUP_H}
              label="CPU MEMORY"
            />
            <StepCounter
              x={COL_R + 100}
              y={R_GROUP_Y + 10}
              cycle={CYCLE}
              steps={META_STEPS}
            />
            <g opacity={0}>
              <FlowNode
                cx={COL_R}
                y={R_TENSOR_Y}
                width={120}
                title="one tensor"
                sub="in flight"
                variant="read"
              />
              <animate
                attributeName="opacity"
                values={BLINK.values}
                keyTimes={BLINK.keyTimes}
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
              />
            </g>
            <NoteLines
              cx={COL_R}
              y={NOTE_Y}
              lines={[
                "materialized one slot at a time,",
                "peak ≈ a few in-flight tensors",
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
