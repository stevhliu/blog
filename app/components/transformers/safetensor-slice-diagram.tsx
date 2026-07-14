import {
  COPY_COLOR,
  FlowArrow,
  FlowNode,
  GroupRegion,
  MergeRail,
  NoteLines,
  noteStyle,
} from "./flow-primitives";

const VIEW_WIDTH = 690;
const MID_X = VIEW_WIDTH / 2;
const COL_L = 180;
const COL_R = 510;

const GROUP_Y = 14;
const TOP_NODE_Y = 32;
const GROUP_H = TOP_NODE_Y + 34 + 14 - GROUP_Y;
const RAIL_Y = 96;
const MAT_Y = 118;
const FINAL_Y = 176;
const NOTE_Y = 236;
const VIEW_HEIGHT = NOTE_Y + 14;

export function SafetensorSliceDiagram() {
  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Flow diagram of a meta tensor slot and a lazy safetensors slice merging when the slice is indexed and materialized"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <GroupRegion
            x={COL_L - 102}
            y={GROUP_Y}
            width={204}
            height={GROUP_H}
            label="MODEL (META DEVICE)"
          />
          <FlowNode
            cx={COL_L}
            y={TOP_NODE_Y}
            width={172}
            title="meta tensor"
            sub="empty slot · shape + dtype"
            variant="deferred"
          />

          <GroupRegion
            x={COL_R - 102}
            y={GROUP_Y}
            width={204}
            height={GROUP_H}
            label="CHECKPOINT (DISK)"
          />
          <FlowNode
            cx={COL_R}
            y={TOP_NODE_Y}
            width={172}
            title="get_slice(key)"
            sub="stored weight · shape + dtype"
            variant="deferred"
          />

          <MergeRail
            midX={MID_X}
            colX={COL_L}
            startY={TOP_NODE_Y + 34}
            railY={RAIL_Y}
          />
          <MergeRail
            midX={MID_X}
            colX={COL_R}
            startY={TOP_NODE_Y + 34}
            railY={RAIL_Y}
          />
          <FlowArrow x={MID_X} y1={RAIL_Y} y2={MAT_Y} />

          <FlowNode
            cx={MID_X}
            y={MAT_Y}
            width={164}
            title="tensor[...]"
            sub="bytes read from disk"
            variant="read"
          />

          <FlowArrow
            x={MID_X}
            y1={MAT_Y + 34}
            y2={FINAL_Y}
            color={COPY_COLOR}
          />
          <text
            x={MID_X + 10}
            y={MAT_Y + 34 + 15}
            textAnchor="start"
            className="fill-[#7c7a72] dark:fill-[#8a8780]"
            style={noteStyle}
          >
            .to(device, dtype)
          </text>

          <FlowNode
            cx={MID_X}
            y={FINAL_Y}
            width={190}
            title="real torch.Tensor"
            sub="overwrites the meta placeholder"
            variant="copy"
          />

          <NoteLines
            cx={MID_X}
            y={NOTE_Y}
            lines={["missing keys stay on the meta device until finalization"]}
          />
        </svg>
      </div>
    </figure>
  );
}
