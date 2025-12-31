import { Caption } from "../caption";

export function SelfAttentionDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 460 140" className="w-full max-w-lg mx-auto">
        {/* Q matrix */}
        <g transform="translate(20, 45)">
          <rect x="0" y="0" width="44" height="50" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="22" y="30" textAnchor="middle" className="fill-sky-600 text-[13px] font-medium">Q</text>
        </g>

        {/* × symbol */}
        <text x="78" y="75" textAnchor="middle" className="fill-slate-400 text-[16px]">×</text>

        {/* K^T matrix */}
        <g transform="translate(92, 45)">
          <rect x="0" y="0" width="44" height="50" rx="6" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="22" y="30" textAnchor="middle" className="fill-amber-600 text-[13px] font-medium">K<tspan baselineShift="super" className="text-[9px]">T</tspan></text>
        </g>

        {/* Arrow */}
        <g transform="translate(142, 70)">
          <line x1="0" y1="0" x2="32" y2="0" className="stroke-slate-300" strokeWidth="1.5"/>
          <polygon points="32,0 26,-4 26,4" className="fill-slate-300"/>
        </g>

        {/* Attention scores */}
        <g transform="translate(180, 35)">
          <rect x="0" y="0" width="70" height="70" rx="6" className="fill-violet-50 stroke-violet-300" strokeWidth="1.5"/>
          <text x="35" y="18" textAnchor="middle" className="fill-violet-500 text-[10px]">scores</text>
          {/* Small grid to represent matrix - centered */}
          <rect x="11" y="26" width="14" height="14" rx="2" className="fill-violet-200"/>
          <rect x="28" y="26" width="14" height="14" rx="2" className="fill-violet-200"/>
          <rect x="45" y="26" width="14" height="14" rx="2" className="fill-violet-200"/>
          <rect x="11" y="43" width="14" height="14" rx="2" className="fill-violet-200"/>
          <rect x="28" y="43" width="14" height="14" rx="2" className="fill-violet-200"/>
          <rect x="45" y="43" width="14" height="14" rx="2" className="fill-violet-200"/>
        </g>

        {/* Softmax label and arrow */}
        <g transform="translate(257, 58)">
          <text x="16" y="0" textAnchor="middle" className="fill-slate-400 text-[10px]">softmax</text>
          <line x1="0" y1="12" x2="32" y2="12" className="stroke-slate-300" strokeWidth="1.5"/>
          <polygon points="32,12 26,8 26,16" className="fill-slate-300"/>
        </g>

        {/* Attention weights */}
        <g transform="translate(297, 35)">
          <rect x="0" y="0" width="50" height="70" rx="6" className="fill-rose-50 stroke-rose-300" strokeWidth="1.5"/>
          <text x="25" y="18" textAnchor="middle" className="fill-rose-500 text-[9px]">weights</text>
          {/* Small grid */}
          <rect x="8" y="26" width="14" height="14" rx="2" className="fill-rose-200"/>
          <rect x="28" y="26" width="14" height="14" rx="2" className="fill-rose-100"/>
          <rect x="8" y="42" width="14" height="14" rx="2" className="fill-rose-100"/>
          <rect x="28" y="42" width="14" height="14" rx="2" className="fill-rose-200"/>
        </g>

        {/* × symbol */}
        <text x="360" y="75" textAnchor="middle" className="fill-slate-400 text-[16px]">×</text>

        {/* V matrix */}
        <g transform="translate(374, 45)">
          <rect x="0" y="0" width="44" height="50" rx="6" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="22" y="30" textAnchor="middle" className="fill-emerald-600 text-[13px] font-medium">V</text>
        </g>

        {/* Scale indicator */}
        <g transform="translate(180, 110)">
          <text x="35" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">÷ √d<tspan baselineShift="sub" className="text-[7px]">k</tspan></text>
        </g>
      </svg>
      <Caption>Q × K<sup>T</sup> produces attention scores, scaled and softmaxed into weights, then multiplied by V.</Caption>
    </figure>
  );
}

