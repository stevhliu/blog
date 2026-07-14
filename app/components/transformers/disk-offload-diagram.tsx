import {
  BranchRail,
  FlowArrow,
  FlowNode,
  GroupRegion,
  MergeRail,
  NoteLines,
} from "./flow-primitives";

const VIEW_WIDTH = 690;
const MID_X = VIEW_WIDTH / 2;
const COL_L = 180;
const COL_R = 510;

const TOP_Y = 18;
const FORK_Y = TOP_Y + 34;
const RAIL_Y = FORK_Y + 18;
const STAGE_Y = 100;
const GROUP_Y = STAGE_Y - 18;
const GROUP_H = STAGE_Y + 34 + 14 - GROUP_Y;
const RAIL2_Y = 178;
const HOOK_Y = 196;
const NOTE_Y = HOOK_Y + 34 + 24;
const VIEW_HEIGHT = NOTE_Y + 14;

export function DiskOffloadDiagram() {
  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Flow diagram of a disk-mapped parameter either indexed in its original shard or re-saved to the offload folder, then loaded on demand by an Accelerate hook"
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <FlowNode
            cx={MID_X}
            y={TOP_Y}
            width={164}
            title="device map"
            sub={'param → "disk"'}
            variant="solid"
          />

          <BranchRail
            midX={MID_X}
            forkY={FORK_Y}
            railY={RAIL_Y}
            endX={COL_L}
            endY={STAGE_Y}
          />
          <BranchRail
            midX={MID_X}
            forkY={FORK_Y}
            railY={RAIL_Y}
            endX={COL_R}
            endY={STAGE_Y}
          />

          <GroupRegion
            x={COL_L - 102}
            y={GROUP_Y}
            width={204}
            height={GROUP_H}
            label="ORIGINAL SHARD FILE"
          />
          <FlowNode
            cx={COL_L}
            y={STAGE_Y}
            width={172}
            title="index entry"
            sub="shard + tensor name · no copy"
            variant="deferred"
          />

          <GroupRegion
            x={COL_R - 102}
            y={GROUP_Y}
            width={204}
            height={GROUP_H}
            label="DISK_OFFLOAD_FOLDER"
          />
          <FlowNode
            cx={COL_R}
            y={STAGE_Y}
            width={172}
            title="re-saved tensor"
            sub="written to offload folder"
            variant="copy"
          />

          <MergeRail
            midX={MID_X}
            colX={COL_L}
            startY={STAGE_Y + 34}
            railY={RAIL2_Y}
          />
          <MergeRail
            midX={MID_X}
            colX={COL_R}
            startY={STAGE_Y + 34}
            railY={RAIL2_Y}
          />
          <FlowArrow x={MID_X} y1={RAIL2_Y} y2={HOOK_Y} />

          <FlowNode
            cx={MID_X}
            y={HOOK_Y}
            width={190}
            title="Accelerate hook"
            sub="loaded on demand at forward"
            variant="read"
          />

          <NoteLines
            cx={MID_X}
            y={NOTE_Y}
            lines={[
              "offloaded params never sit in CPU or GPU memory between uses",
            ]}
          />
        </svg>
      </div>
    </figure>
  );
}
