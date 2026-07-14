import {
  BranchRail,
  COPY_COLOR,
  FlowArrow,
  FlowNode,
  GroupRegion,
  NODE_H,
  NoteLines,
} from "./flow-primitives";

const VIEW_WIDTH = 690;
const MID_X = VIEW_WIDTH / 2;
const COL_L_X = 180;
const COL_R_X = 510;
const GROUP_PAD = 14;

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
          <NoteLines
            cx={COL_L_X}
            y={NOTE_Y}
            lines={[
              "deferred until an op touches the tensor,",
              "like a conversion or the forward pass",
            ]}
          />

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
            color={COPY_COLOR}
          />
          <FlowNode
            cx={COL_R_X}
            y={STAGE2_Y}
            width={172}
            title="GPU memory"
            sub="tensor on device"
            variant="copy"
          />
          <NoteLines
            cx={COL_R_X}
            y={NOTE_Y}
            lines={["forced now, both steps happen", "inside .to(device)"]}
          />
        </svg>
      </div>
    </figure>
  );
}
