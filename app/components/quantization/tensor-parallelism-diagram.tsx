import { Caption } from "../caption";

export function TensorParallelismDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 400 180" className="w-full max-w-lg mx-auto">
        {/* Original weight matrix - centered vertically with GPU stack */}
        <g transform="translate(20, 45)">
          <text x="40" y="-8" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">weight matrix</text>
          <rect x="0" y="0" width="80" height="60" rx="4" className="fill-violet-100 stroke-violet-300" strokeWidth="1.5"/>
          <text x="40" y="35" textAnchor="middle" className="fill-violet-600 text-[11px] font-medium">W</text>
        </g>

        {/* Arrow to split */}
        <g transform="translate(105, 70)">
          <line x1="0" y1="0" x2="22" y2="0" className="stroke-slate-300" strokeWidth="1.5"/>
          <polygon points="28,0 22,-4 22,4" className="fill-slate-300"/>
          <text x="14" y="-8" textAnchor="middle" className="fill-slate-400 text-[8px]">shard</text>
        </g>

        {/* Sharded weights across GPUs */}
        <g transform="translate(140, 15)">
          {/* GPU 0 */}
          <g transform="translate(0, 0)">
            <rect x="0" y="0" width="50" height="36" rx="4" className="fill-sky-50 stroke-sky-300" strokeWidth="1.5"/>
            <text x="25" y="15" textAnchor="middle" className="fill-sky-600 text-[9px] font-medium">GPU 0</text>
            <rect x="8" y="20" width="34" height="12" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
            <text x="25" y="29" textAnchor="middle" className="fill-violet-600 text-[7px]">W₀</text>
          </g>

          {/* GPU 1 */}
          <g transform="translate(0, 42)">
            <rect x="0" y="0" width="50" height="36" rx="4" className="fill-amber-50 stroke-amber-300" strokeWidth="1.5"/>
            <text x="25" y="15" textAnchor="middle" className="fill-amber-600 text-[9px] font-medium">GPU 1</text>
            <rect x="8" y="20" width="34" height="12" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
            <text x="25" y="29" textAnchor="middle" className="fill-violet-600 text-[7px]">W₁</text>
          </g>

          {/* GPU 2 */}
          <g transform="translate(0, 84)">
            <rect x="0" y="0" width="50" height="36" rx="4" className="fill-emerald-50 stroke-emerald-300" strokeWidth="1.5"/>
            <text x="25" y="15" textAnchor="middle" className="fill-emerald-600 text-[9px] font-medium">GPU 2</text>
            <rect x="8" y="20" width="34" height="12" rx="2" className="fill-violet-200 stroke-violet-300" strokeWidth="1"/>
            <text x="25" y="29" textAnchor="middle" className="fill-violet-600 text-[7px]">W₂</text>
          </g>
        </g>

        {/* Parallel computation arrows */}
        <g transform="translate(195, 15)">
          <line x1="0" y1="18" x2="18" y2="18" className="stroke-sky-400" strokeWidth="1.5"/>
          <polygon points="24,18 18,14 18,22" className="fill-sky-400"/>
          
          <line x1="0" y1="60" x2="18" y2="60" className="stroke-amber-400" strokeWidth="1.5"/>
          <polygon points="24,60 18,56 18,64" className="fill-amber-400"/>
          
          <line x1="0" y1="102" x2="18" y2="102" className="stroke-emerald-400" strokeWidth="1.5"/>
          <polygon points="24,102 18,98 18,106" className="fill-emerald-400"/>
        </g>

        {/* Partial results */}
        <g transform="translate(224, 15)">
          <rect x="0" y="4" width="40" height="28" rx="3" className="fill-sky-100 stroke-sky-300" strokeWidth="1"/>
          <text x="20" y="22" textAnchor="middle" className="fill-sky-600 text-[9px]">x × W₀</text>
          
          <rect x="0" y="46" width="40" height="28" rx="3" className="fill-amber-100 stroke-amber-300" strokeWidth="1"/>
          <text x="20" y="64" textAnchor="middle" className="fill-amber-600 text-[9px]">x × W₁</text>
          
          <rect x="0" y="88" width="40" height="28" rx="3" className="fill-emerald-100 stroke-emerald-300" strokeWidth="1"/>
          <text x="20" y="106" textAnchor="middle" className="fill-emerald-600 text-[9px]">x × W₂</text>
        </g>

        {/* Sync arrows - all converge to same point */}
        <g transform="translate(268, 15)">
          <line x1="0" y1="18" x2="22" y2="60" className="stroke-rose-300" strokeWidth="1.5"/>
          <line x1="0" y1="60" x2="22" y2="60" className="stroke-rose-300" strokeWidth="1.5"/>
          <line x1="0" y1="102" x2="22" y2="60" className="stroke-rose-300" strokeWidth="1.5"/>
        </g>

        {/* Sync box - centered vertically with GPU stack */}
        <g transform="translate(290, 55)">
          <rect x="0" y="0" width="44" height="40" rx="4" className="fill-rose-50 stroke-rose-300" strokeWidth="1.5"/>
          <text x="22" y="18" textAnchor="middle" className="fill-rose-600 text-[8px] font-medium">all-</text>
          <text x="22" y="30" textAnchor="middle" className="fill-rose-600 text-[8px] font-medium">reduce</text>
        </g>

        {/* Final output arrow */}
        <g transform="translate(338, 70)">
          <line x1="0" y1="0" x2="14" y2="0" className="stroke-slate-300" strokeWidth="1.5"/>
          <polygon points="20,0 14,-4 14,4" className="fill-slate-300"/>
        </g>

        {/* Final output - centered vertically */}
        <g transform="translate(362, 55)">
          <rect x="0" y="0" width="32" height="30" rx="4" className="fill-teal-100 stroke-teal-400" strokeWidth="1.5"/>
          <text x="16" y="19" textAnchor="middle" className="fill-teal-600 text-[10px] font-medium">Y</text>
        </g>

        {/* Parallel label */}
        <g transform="translate(140, 145)">
          <line x1="0" y1="0" x2="124" y2="0" className="stroke-slate-200" strokeWidth="1" strokeDasharray="4,2"/>
          <text x="62" y="14" textAnchor="middle" className="fill-slate-400 text-[8px]">parallel computation</text>
        </g>
      </svg>
      <Caption>Tensor parallelism shards weights across GPUs. Each GPU computes on its slice in parallel, then results sync via all-reduce.</Caption>
    </figure>
  );
}

