import type { ReactNode } from "react";
import { chartLabelStyle } from "../chart-typography";

// Palette matches moe-models-over-time-chart.tsx: green #00a23a/#00ca48,
// grid #dad4c8/#2e2e33, text #555354/#a8a59d, converter blue #0090ff.
const blockClass = "fill-[#edeae1] dark:fill-[#1f1f23] stroke-[#c4bdae] dark:stroke-[#3a3a41]";
const divisionClass = "stroke-[#dad4c8] dark:stroke-[#2e2e33]";
const targetBlockClass =
  "fill-[rgba(0,162,58,0.08)] dark:fill-[rgba(0,202,72,0.10)] stroke-[#00a23a] dark:stroke-[#00ca48]";
const targetDivisionClass =
  "stroke-[rgba(0,162,58,0.30)] dark:stroke-[rgba(0,202,72,0.32)]";
const targetTextClass = "fill-[#00a23a] dark:fill-[#00ca48]";
const labelClass = "fill-[#555354] dark:fill-[#a8a59d]";
const strongClass = "fill-[#474645] dark:fill-[#eee7db]";
const arrowLineClass = "stroke-[#555354] dark:stroke-[#a8a59d]";
const arrowHeadClass = "fill-[#555354] dark:fill-[#a8a59d]";
const axisLineClass = "stroke-[#555354] dark:stroke-[#a8a59d]";
const chipRectClass = "fill-[var(--color-bg)] stroke-[rgba(0,144,255,0.45)]";
const chipTextClass = "fill-[#0090ff]";

const diagramMono = {
  fontFamily:
    'var(--font-geist-mono), "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
} as const;

// Text scale matches chart-typography.ts (13px labels, 12px ticks, 11.5px inline).
const captionStyle = chartLabelStyle;
const captionNoteStyle = { fontSize: "10.5px", fontWeight: 400 } as const;
const headerStyle = { ...diagramMono, fontSize: "10.5px", fontWeight: 400 } as const;
const labelStyle = { ...diagramMono, fontSize: "11px", fontWeight: 400 } as const;
const argsStyle = { ...diagramMono, fontSize: "10.5px", fontWeight: 400 } as const;
const chipStyle = { ...diagramMono, fontSize: "11px", fontWeight: 650 } as const;
const targetLabelStyle = { ...diagramMono, fontSize: "12px", fontWeight: 650 } as const;

const STAGE_Y = 116;
const STAGE_H = 124;
const ARROW_Y = 178;
const CHIP_Y = 78;

function spotlightCss(root: string, rules: { chip: string; keep: string[] }[]) {
  const dim = rules
    .map(
      r =>
        `.${root}:has(.${r.chip}:hover) .cvd-step:not(.${r.keep.join("):not(.")}) { opacity: 0.18; }`,
    )
    .join("\n");
  return `.cvd-step { transition: opacity 0.3s ease; }\n@media (hover: hover) and (pointer: fine) {\n${dim}\n}`;
}

function ExpertStack({ x, w }: { x: number; w: number }) {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          className={blockClass}
          strokeWidth={1}
          x={x}
          y={STAGE_Y + i * 16}
          width={w}
          height={12}
          rx={2}
        />
      ))}
    </>
  );
}

function DivisionsH({
  x,
  w,
  y = STAGE_Y,
  h = STAGE_H,
  className = divisionClass,
}: {
  x: number;
  w: number;
  y?: number;
  h?: number;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => {
        const ly = y + ((i + 1) * h) / 8;
        return (
          <line
            key={i}
            className={className}
            strokeWidth={1}
            x1={x + 1}
            y1={ly}
            x2={x + w - 1}
            y2={ly}
          />
        );
      })}
    </>
  );
}

function Slab({ x, w = 64 }: { x: number; w?: number }) {
  return (
    <>
      <rect
        className={blockClass}
        strokeWidth={1}
        x={x}
        y={STAGE_Y}
        width={w}
        height={STAGE_H}
        rx={3}
      />
      <DivisionsH x={x} w={w} />
    </>
  );
}

function TargetBlock({ x, w }: { x: number; w: number }) {
  const cx = x + w / 2;
  return (
    <>
      <rect
        className={targetBlockClass}
        strokeWidth={1.25}
        x={x}
        y={STAGE_Y}
        width={w}
        height={STAGE_H}
        rx={3}
      />
      <DivisionsH x={x} w={w} className={targetDivisionClass} />
      <text
        className={targetTextClass}
        style={targetLabelStyle}
        x={cx}
        y={ARROW_Y + 4}
        textAnchor="middle"
      >
        gate_up_proj
      </text>
    </>
  );
}

function Chip({
  cx,
  w,
  cls,
  cy = CHIP_Y,
  children,
}: {
  cx: number;
  w: number;
  cls: string;
  cy?: number;
  children: ReactNode;
}) {
  return (
    <g className={`cvd-chip ${cls}`}>
      <rect
        className={chipRectClass}
        strokeWidth={1}
        strokeDasharray="3,4"
        x={cx - w / 2}
        y={cy - 11}
        width={w}
        height={22}
        rx={11}
      />
      <text
        className={chipTextClass}
        style={chipStyle}
        x={cx}
        y={cy + 4}
        textAnchor="middle"
      >
        {children}
      </text>
    </g>
  );
}

function FlowArrow({ x1, x2, y = ARROW_Y }: { x1: number; x2: number; y?: number }) {
  return (
    <>
      <line className={arrowLineClass} strokeWidth={1.25} x1={x1} y1={y} x2={x2} y2={y} />
      <polygon
        className={arrowHeadClass}
        points={`${x2},${y - 4.5} ${x2 + 9},${y} ${x2},${y + 4.5}`}
      />
    </>
  );
}

function Caption({ cx, children }: { cx: number; children: ReactNode }) {
  return (
    <text className={labelClass} style={captionStyle} x={cx} y={48} textAnchor="middle">
      {children}
    </text>
  );
}

function StackHeader({ cx, children }: { cx: number; children: ReactNode }) {
  return (
    <text className={labelClass} style={headerStyle} x={cx} y={108} textAnchor="middle">
      {children}
    </text>
  );
}

function StageLabel({ cx, lines }: { cx: number; lines: ReactNode[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <text
          key={i}
          className={labelClass}
          style={labelStyle}
          x={cx}
          y={262 + i * 16}
          textAnchor="middle"
        >
          {line}
        </text>
      ))}
    </>
  );
}

function DiagramFigure({
  viewHeight = 300,
  rootClass,
  ariaLabel,
  css,
  children,
}: {
  viewHeight?: number;
  rootClass: string;
  ariaLabel: string;
  css: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-10">
      <div className="mx-auto w-full">
        <svg
          viewBox={`0 0 760 ${viewHeight}`}
          className={`w-full ${rootClass}`}
          role="img"
          aria-label={ariaLabel}
          style={{
            fontFamily:
              "'Roobert', ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <style>{css}</style>
          {children}
        </svg>
      </div>
    </figure>
  );
}

export function MixtralConversionDiagram() {
  return (
    <DiagramFigure
      rootClass="cvd-mixtral"
      ariaLabel="Mixtral conversion pipeline: WeightRenaming moves the experts from block_sparse_moe to mlp, MergeModulelist stacks the eight experts, and Concatenate fuses gate with up"
      css={spotlightCss("cvd-mixtral", [
        { chip: "c1", keep: ["s0", "a1", "s1"] },
        { chip: "c2", keep: ["s1", "a2", "s2"] },
        { chip: "c3", keep: ["s2", "a3", "s3"] },
      ])}
    >
      <g className="cvd-step s0">
        <Caption cx={80}>checkpoint</Caption>
        <StackHeader cx={48}>w1</StackHeader>
        <StackHeader cx={112}>w3</StackHeader>
        <ExpertStack x={20} w={56} />
        <ExpertStack x={84} w={56} />
        <StageLabel
          cx={80}
          lines={["block_sparse_moe.", "experts.*.{w1,w3}.weight"]}
        />
      </g>

      <g className="cvd-step a1">
        <Chip cx={168} w={108} cls="c1">
          WeightRenaming
        </Chip>
        <FlowArrow x1={148} x2={192} />
      </g>

      <g className="cvd-step s1">
        <Caption cx={268}>renamed</Caption>
        <StackHeader cx={236}>w1</StackHeader>
        <StackHeader cx={300}>w3</StackHeader>
        <ExpertStack x={208} w={56} />
        <ExpertStack x={272} w={56} />
        <StageLabel cx={268} lines={["mlp.", "experts.*.{w1,w3}.weight"]} />
      </g>

      <g className="cvd-step a2">
        <Chip cx={368} w={161} cls="c2">
          MergeModulelist(dim=0)
        </Chip>
        <FlowArrow x1={336} x2={400} />
      </g>

      <g className="cvd-step s2">
        <Caption cx={484}>stacked</Caption>
        <StackHeader cx={448}>w1</StackHeader>
        <StackHeader cx={520}>w3</StackHeader>
        <Slab x={416} />
        <Slab x={488} />
        <StageLabel cx={484} lines={["2 × (8, 6144, 16384)"]} />
      </g>

      <g className="cvd-step a3">
        <Chip cx={586} w={141} cls="c3">
          Concatenate(dim=1)
        </Chip>
        <FlowArrow x1={558} x2={604} />
      </g>

      <g className="cvd-step s3">
        <Caption cx={674}>standard</Caption>
        <TargetBlock x={616} w={116} />
        <StageLabel cx={674} lines={["mlp.experts.gate_up_proj", "(8, 6144, 32768)"]} />
      </g>
    </DiagramFigure>
  );
}

export function Qwen2ConversionDiagram() {
  return (
    <DiagramFigure
      rootClass="cvd-qwen2"
      ariaLabel="Qwen2 conversion pipeline: no rename is needed, MergeModulelist stacks the experts and Concatenate fuses gate with up"
      css={spotlightCss("cvd-qwen2", [
        { chip: "c1", keep: ["s0", "a1", "s1"] },
        { chip: "c2", keep: ["s1", "a2", "s2"] },
      ])}
    >
      <g className="cvd-step s0">
        <Caption cx={108}>checkpoint</Caption>
        <text
          className={labelClass}
          style={captionNoteStyle}
          x={108}
          y={64}
          textAnchor="middle"
        >
          already Llama-named
        </text>
        <StackHeader cx={76}>gate_proj</StackHeader>
        <StackHeader cx={140}>up_proj</StackHeader>
        <ExpertStack x={48} w={56} />
        <ExpertStack x={112} w={56} />
        <StageLabel
          cx={108}
          lines={["mlp.experts.*.", "{gate_proj,up_proj}.weight", "(64 experts)"]}
        />
      </g>

      <g className="cvd-step a1">
        <Chip cx={244} w={161} cls="c1">
          MergeModulelist(dim=0)
        </Chip>
        <FlowArrow x1={184} x2={296} />
      </g>

      <g className="cvd-step s1">
        <Caption cx={404}>stacked</Caption>
        <StackHeader cx={368}>gate_proj</StackHeader>
        <StackHeader cx={440}>up_proj</StackHeader>
        <Slab x={336} />
        <Slab x={408} />
        <StageLabel cx={404} lines={["2 × (64, 3584, 2560)"]} />
      </g>

      <g className="cvd-step a2">
        <Chip cx={540} w={141} cls="c2">
          Concatenate(dim=1)
        </Chip>
        <FlowArrow x1={488} x2={588} />
      </g>

      <g className="cvd-step s2">
        <Caption cx={676}>standard</Caption>
        <TargetBlock x={616} w={120} />
        <StageLabel cx={676} lines={["mlp.experts.gate_up_proj", "(64, 3584, 5120)"]} />
      </g>
    </DiagramFigure>
  );
}

export function Qwen3VLConversionDiagram() {
  return (
    <DiagramFigure
      viewHeight={310}
      rootClass="cvd-qwen3vl"
      ariaLabel="Qwen3-VL conversion pipeline: the pre-fused expert tensor arrives with its last two axes flipped, and one Transpose puts them back"
      css={spotlightCss("cvd-qwen3vl", [{ chip: "c1", keep: ["s0", "a1", "s1"] }])}
    >
      <g className="cvd-step s0">
        <Caption cx={170}>checkpoint</Caption>
        <rect
          className={blockClass}
          strokeWidth={1}
          x={70}
          y={134}
          width={200}
          height={88}
          rx={3}
        />
        {Array.from({ length: 7 }, (_, i) => (
          <line
            key={i}
            className={divisionClass}
            strokeWidth={1}
            x1={70 + (i + 1) * 25}
            y1={135}
            x2={70 + (i + 1) * 25}
            y2={221}
          />
        ))}
        <line className={axisLineClass} strokeWidth={1} x1={107} y1={230} x2={233} y2={230} />
        <polygon className={arrowHeadClass} points="233,227 240,230 233,233" />
        <polygon className={arrowHeadClass} points="107,227 100,230 107,233" />
        <text className={labelClass} style={headerStyle} x={170} y={245} textAnchor="middle">
          ffn (dim 2)
        </text>
        <line className={axisLineClass} strokeWidth={1} x1={58} y1={150} x2={58} y2={206} />
        <polygon className={arrowHeadClass} points="55,150 58,143 61,150" />
        <polygon className={arrowHeadClass} points="55,206 58,213 61,206" />
        <text
          className={labelClass}
          style={headerStyle}
          transform="rotate(-90 42 178)"
          x={42}
          y={178}
          textAnchor="middle"
        >
          hidden (dim 1)
        </text>
        <StageLabel
          cx={170}
          lines={[
            "mlp.experts.gate_up_proj",
            <>
              (experts,{" "}
              <tspan className={strongClass} style={{ fontWeight: 600 }}>
                hidden, ffn
              </tspan>
              )
            </>,
          ]}
        />
      </g>

      <g className="cvd-step a1">
        <Chip cx={390} w={174} cls="c1">
          Transpose(dim0=1, dim1=2)
        </Chip>
        <FlowArrow x1={300} x2={480} />
      </g>

      <g className="cvd-step s1">
        <Caption cx={600}>standard</Caption>
        <rect
          className={targetBlockClass}
          strokeWidth={1.25}
          x={550}
          y={108}
          width={100}
          height={140}
          rx={3}
        />
        {Array.from({ length: 7 }, (_, i) => (
          <line
            key={i}
            className={targetDivisionClass}
            strokeWidth={1}
            x1={551}
            y1={108 + ((i + 1) * 140) / 8}
            x2={649}
            y2={108 + ((i + 1) * 140) / 8}
          />
        ))}
        <text
          className={targetTextClass}
          style={targetLabelStyle}
          x={600}
          y={182}
          textAnchor="middle"
        >
          gate_up_proj
        </text>
        <line className={axisLineClass} strokeWidth={1} x1={566} y1={260} x2={634} y2={260} />
        <polygon className={arrowHeadClass} points="634,257 641,260 634,263" />
        <polygon className={arrowHeadClass} points="566,257 559,260 566,263" />
        <text className={labelClass} style={headerStyle} x={600} y={276} textAnchor="middle">
          hidden (dim 2)
        </text>
        <line className={axisLineClass} strokeWidth={1} x1={536} y1={130} x2={536} y2={226} />
        <polygon className={arrowHeadClass} points="533,130 536,123 539,130" />
        <polygon className={arrowHeadClass} points="533,226 536,233 539,226" />
        <text
          className={labelClass}
          style={headerStyle}
          transform="rotate(-90 520 178)"
          x={520}
          y={178}
          textAnchor="middle"
        >
          ffn (dim 1)
        </text>
        <text className={labelClass} style={labelStyle} x={600} y={298} textAnchor="middle">
          (experts,{" "}
          <tspan className={strongClass} style={{ fontWeight: 600 }}>
            ffn, hidden
          </tspan>
          )
        </text>
      </g>
    </DiagramFigure>
  );
}

export function DeepSeekV3ConversionDiagram() {
  return (
    <DiagramFigure
      rootClass="cvd-deepseek"
      ariaLabel="DeepSeek-V3 conversion pipeline: Fp8Dequantize expands the FP8 weights with their block scales, then the same MergeModulelist and Concatenate as Qwen2"
      css={spotlightCss("cvd-deepseek", [
        { chip: "c1", keep: ["s0", "a1", "s1"] },
        { chip: "c2", keep: ["s1", "a2", "s2"] },
      ])}
    >
      <g className="cvd-step s0">
        <Caption cx={100}>checkpoint</Caption>
        <StackHeader cx={100}>gate_proj (fp8)</StackHeader>
        <ExpertStack x={68} w={48} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            className={blockClass}
            strokeWidth={1}
            x={124}
            y={STAGE_Y + 2 + i * 16}
            width={8}
            height={8}
            rx={2}
          />
        ))}
        <StageLabel
          cx={100}
          lines={["mlp.experts.*.gate_proj", "+ weight_scale_inv", "(256 experts)"]}
        />
      </g>

      <g className="cvd-step a1">
        <Chip cx={205} w={102} cls="c1">
          Fp8Dequantize
        </Chip>
        <FlowArrow x1={148} x2={264} />
      </g>

      <g className="cvd-step s1">
        <Caption cx={344}>dequantized</Caption>
        <StackHeader cx={344}>gate_proj (bf16)</StackHeader>
        <ExpertStack x={300} w={88} />
        <StageLabel cx={344} lines={["(2048, 7168) each"]} />
      </g>

      <g className="cvd-step a2">
        <Chip cx={500} w={163} cy={58} cls="c2">
          MergeModulelist(dim=0)
        </Chip>
        <Chip cx={500} w={141} cy={86} cls="c2">
          Concatenate(dim=1)
        </Chip>
        <text className={labelClass} style={argsStyle} x={500} y={112} textAnchor="middle">
          "deepseek_v3": "qwen2_moe"
        </text>
        <FlowArrow x1={404} x2={588} />
      </g>

      <g className="cvd-step s2">
        <Caption cx={676}>standard</Caption>
        <TargetBlock x={616} w={120} />
        <StageLabel cx={676} lines={["mlp.experts.gate_up_proj", "(256, 7168, 4096)"]} />
      </g>
    </DiagramFigure>
  );
}
