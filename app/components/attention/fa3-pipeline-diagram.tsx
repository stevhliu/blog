import { Caption } from "../caption";

export function FA3PipelineDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 420 145" className="w-full max-w-lg mx-auto">
        {/* FlashAttention-2 side */}
        <g transform="translate(10, 10)">
          <text x="117" y="0" textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">FlashAttention-2</text>
          <text x="117" y="14" textAnchor="middle" className="fill-slate-400 text-[8px]">all warps do same work</text>
          
          <g transform="translate(0, 30)">
            {/* Timeline header */}
            <text x="0" y="8" className="fill-slate-400 text-[7px]">time →</text>
            
            {/* Warp 0 */}
            <g transform="translate(0, 18)">
              <text x="0" y="12" className="fill-slate-500 text-[7px]">warp 0</text>
              <rect x="40" y="0" width="50" height="18" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
              <text x="65" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">load K₁V₁</text>
              <rect x="92" y="0" width="50" height="18" rx="2" className="fill-sky-200 stroke-sky-300" strokeWidth="1"/>
              <text x="117" y="12" textAnchor="middle" className="fill-sky-700 text-[6px]">compute</text>
              <rect x="144" y="0" width="50" height="18" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
              <text x="169" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">load K₂V₂</text>
            </g>
            
            {/* Warp 1 */}
            <g transform="translate(0, 40)">
              <text x="0" y="12" className="fill-slate-500 text-[7px]">warp 1</text>
              <rect x="40" y="0" width="50" height="18" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
              <text x="65" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">load K₁V₁</text>
              <rect x="92" y="0" width="50" height="18" rx="2" className="fill-sky-200 stroke-sky-300" strokeWidth="1"/>
              <text x="117" y="12" textAnchor="middle" className="fill-sky-700 text-[6px]">compute</text>
              <rect x="144" y="0" width="50" height="18" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
              <text x="169" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">load K₂V₂</text>
            </g>
            
            {/* Warp 2 */}
            <g transform="translate(0, 62)">
              <text x="0" y="12" className="fill-slate-500 text-[7px]">warp 2</text>
              <rect x="40" y="0" width="50" height="18" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
              <text x="65" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">load K₁V₁</text>
              <rect x="92" y="0" width="50" height="18" rx="2" className="fill-sky-200 stroke-sky-300" strokeWidth="1"/>
              <text x="117" y="12" textAnchor="middle" className="fill-sky-700 text-[6px]">compute</text>
              <rect x="144" y="0" width="50" height="18" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
              <text x="169" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">load K₂V₂</text>
            </g>
            
            {/* Problem indicator */}
            <g transform="translate(0, 88)">
              <text x="117" y="10" textAnchor="middle" className="fill-rose-500 text-[7px]">⚠ sequential: load → compute → load</text>
            </g>
          </g>
        </g>

        {/* FlashAttention-3 side */}
        <g transform="translate(220, 10)">
          <text x="114" y="0" textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">FlashAttention-3</text>
          <text x="114" y="14" textAnchor="middle" className="fill-teal-500 text-[8px]">specialized producer/consumer</text>
          
          <g transform="translate(0, 30)">
            {/* Timeline header */}
            <text x="0" y="8" className="fill-slate-400 text-[7px]">time →</text>
            
            {/* Producer warp */}
            <g transform="translate(0, 18)">
              <text x="0" y="12" className="fill-amber-600 text-[7px] font-medium">producer</text>
              <rect x="46" y="0" width="44" height="18" rx="2" className="fill-amber-200 stroke-amber-300" strokeWidth="1"/>
              <text x="68" y="12" textAnchor="middle" className="fill-amber-700 text-[6px]">load K₁V₁</text>
              <rect x="92" y="0" width="44" height="18" rx="2" className="fill-amber-200 stroke-amber-300" strokeWidth="1"/>
              <text x="114" y="12" textAnchor="middle" className="fill-amber-700 text-[6px]">load K₂V₂</text>
              <rect x="138" y="0" width="44" height="18" rx="2" className="fill-amber-200 stroke-amber-300" strokeWidth="1"/>
              <text x="160" y="12" textAnchor="middle" className="fill-amber-700 text-[6px]">load K₃V₃</text>
              <text x="68" y="30" textAnchor="middle" className="fill-amber-500 text-[6px]">TMA</text>
            </g>
            
            {/* Consumer warps */}
            <g transform="translate(0, 55)">
              <text x="0" y="12" className="fill-teal-600 text-[7px] font-medium">consumer</text>
              <rect x="46" y="0" width="44" height="18" rx="2" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
              <text x="68" y="12" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[6px]">wait</text>
              <rect x="92" y="0" width="44" height="18" rx="2" className="fill-teal-200 stroke-teal-300" strokeWidth="1"/>
              <text x="114" y="12" textAnchor="middle" className="fill-teal-700 text-[6px]">attn K₁V₁</text>
              <rect x="138" y="0" width="44" height="18" rx="2" className="fill-teal-200 stroke-teal-300" strokeWidth="1"/>
              <text x="160" y="12" textAnchor="middle" className="fill-teal-700 text-[6px]">attn K₂V₂</text>
              <text x="114" y="30" textAnchor="middle" className="fill-teal-500 text-[6px]">tensor cores</text>
            </g>
            
            {/* Overlap indicator */}
            <g transform="translate(92, 40)">
              <line x1="0" y1="0" x2="0" y2="15" className="stroke-emerald-400" strokeWidth="1.5" strokeDasharray="2,2"/>
              <line x1="46" y1="0" x2="46" y2="15" className="stroke-emerald-400" strokeWidth="1.5" strokeDasharray="2,2"/>
            </g>
            
            {/* Benefit indicator */}
            <g transform="translate(0, 88)">
              <text x="114" y="10" textAnchor="middle" className="fill-emerald-600 text-[7px]">✓ overlapped: load while computing</text>
            </g>
          </g>
        </g>
        
      </svg>
      <Caption>FlashAttention-3 overlaps memory transfers and computation using specialized producer/consumer warps.</Caption>
    </figure>
  );
}

