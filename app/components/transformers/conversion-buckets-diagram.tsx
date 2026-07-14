import { FreezeSmilOnReducedMotion } from "../freeze-smil";
import {
  AnimateHide,
  AnimatePulse,
  AnimateShow,
  COPY_COLOR,
  FlowArrow,
  FlowNode,
  GroupRegion,
  HArrow,
  NODE_H,
  NODE_RX,
  NoteLines,
  noteStyle,
} from "./flow-primitives";

const VIEW_WIDTH = 690;

const DICT_X = 22;
const DICT_W = 206;
const DICT_Y = 20;
const DICT_H = 150;
const DICT_CX = DICT_X + DICT_W / 2;

const BUCKET_W = 178;
const SLOT_Y = 38;
const BUCKET2_Y = 80;
const BUCKET3_Y = 122;

const POPPED_CX = 345;
const CONVERT_Y = 110;
const MODEL_CX = 560;
const MODEL_W = 190;

const NOTE_Y = 190;
const VIEW_HEIGHT = NOTE_Y + 26;

// One bucket's trip through the pipeline per cycle: it starts in the dict,
// pop(key) removes it (leaving the empty slot), the resolved tensors sit in
// flight while convert() runs, the realized value flashes on the model
// write, and del frees it. Nothing is left behind when the loop restarts.
const CYCLE = 6;
const POP_T = 1.2;
const CONVERT_T = 2.8;
const DEL_T = 4.4;

export function ConversionBucketsDiagram() {
  return (
    <figure className="my-10">
      <FreezeSmilOnReducedMotion freezeAt={2}>
        <div className="mx-auto w-full">
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="w-full"
            role="img"
            aria-label="Animated flow diagram of a tensor bucket popped out of collected_tensors, converted, written into the model, and freed"
            style={{
              fontFamily:
                "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
            }}
          >
            <GroupRegion
              x={DICT_X}
              y={DICT_Y}
              width={DICT_W}
              height={DICT_H}
              label="SELF.COLLECTED_TENSORS"
            />

            {/* The empty slot left behind once pop(key) removes the bucket */}
            <g opacity={0}>
              <rect
                x={DICT_CX - BUCKET_W / 2}
                y={SLOT_Y}
                width={BUCKET_W}
                height={NODE_H}
                rx={NODE_RX}
                fill="none"
                className="stroke-[#cbc5bc] dark:stroke-[#33333a]"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <text
                x={DICT_CX}
                y={SLOT_Y + 21}
                textAnchor="middle"
                className="fill-[#7c7a72] dark:fill-[#8a8780]"
                style={noteStyle}
              >
                pop(key)
              </text>
              <AnimateShow at={POP_T} cycle={CYCLE} />
            </g>

            {/* The bucket while it still lives in the dict */}
            <g opacity={1}>
              <FlowNode
                cx={DICT_CX}
                y={SLOT_Y}
                width={BUCKET_W}
                title="*.qkv.weight"
                sub="pending loads"
                variant="solid"
              />
              <AnimateHide at={POP_T} cycle={CYCLE} />
            </g>

            <FlowNode
              cx={DICT_CX}
              y={BUCKET2_Y}
              width={BUCKET_W}
              title="*.up_proj.weight"
              sub="pending loads"
              variant="solid"
            />
            <FlowNode
              cx={DICT_CX}
              y={BUCKET3_Y}
              width={BUCKET_W}
              title="*.down_proj.weight"
              sub="pending loads"
              variant="solid"
            />

            <HArrow
              y={SLOT_Y + 17}
              x1={DICT_CX + BUCKET_W / 2 + 4}
              x2={POPPED_CX - BUCKET_W / 2 - 2}
            />

            {/* In flight between pop(key) and convert() */}
            <g opacity={0}>
              <FlowNode
                cx={POPPED_CX}
                y={SLOT_Y}
                width={BUCKET_W}
                title="*.qkv.weight"
                sub="futures resolved"
                variant="read"
              />
              <AnimatePulse on={POP_T} off={CONVERT_T} cycle={CYCLE} />
            </g>

            <FlowArrow x={POPPED_CX} y1={SLOT_Y + NODE_H} y2={CONVERT_Y} />

            <FlowNode
              cx={POPPED_CX}
              y={CONVERT_Y}
              width={BUCKET_W}
              title="convert()"
              sub="rename · reshape · concat"
              variant="solid"
            />

            <HArrow
              y={CONVERT_Y + 17}
              x1={POPPED_CX + BUCKET_W / 2 + 4}
              x2={MODEL_CX - MODEL_W / 2 - 2}
            />

            <FlowNode
              cx={MODEL_CX}
              y={CONVERT_Y}
              width={MODEL_W}
              title="set_param_for_module"
              sub="written into the model"
              variant="copy"
            />

            {/* The realized value living on the model write, freed by del */}
            <g opacity={0}>
              <rect
                x={MODEL_CX - MODEL_W / 2}
                y={CONVERT_Y}
                width={MODEL_W}
                height={NODE_H}
                rx={NODE_RX}
                fill={COPY_COLOR}
                fillOpacity={0.22}
                stroke="none"
              />
              <AnimatePulse on={CONVERT_T} off={DEL_T} cycle={CYCLE} />
            </g>

            <NoteLines
              cx={MODEL_CX}
              y={CONVERT_Y + NODE_H + 18}
              lines={["del realized_value", "frees the copy right away"]}
            />
            <NoteLines
              cx={DICT_CX}
              y={NOTE_Y}
              lines={[
                "popped buckets leave the dict,",
                "temporaries never accumulate",
              ]}
            />
          </svg>
        </div>
      </FreezeSmilOnReducedMotion>
    </figure>
  );
}
