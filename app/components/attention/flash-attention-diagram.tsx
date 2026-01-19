import { Caption } from "../caption";

export function FlashAttentionDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 420 170" className="w-full max-w-lg mx-auto">
        {/* Block 1 */}
        <g transform="translate(20, 15)">
          <text x="75" y="6" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">block 1</text>
          
          <g transform="translate(0, 12)">
            {/* Q */}
            <rect x="0" y="0" width="28" height="44" rx="4" className="fill-sky-200 stroke-sky-400" strokeWidth="1.5"/>
            <text x="14" y="27" textAnchor="middle" className="fill-sky-700 text-[10px]">Q</text>
            
            {/* × */}
            <text x="42" y="27" textAnchor="middle" className="fill-slate-400 text-[12px]">×</text>
            
            {/* K */}
            <rect x="56" y="8" width="44" height="28" rx="4" className="fill-amber-200 stroke-amber-400" strokeWidth="1.5"/>
            <text x="78" y="27" textAnchor="middle" className="fill-amber-700 text-[10px]">K₁<tspan baselineShift="super" className="text-[7px]">T</tspan></text>
            
            {/* Arrow */}
            <line x1="108" y1="22" x2="122" y2="22" className="stroke-slate-300" strokeWidth="1.5"/>
            <polygon points="128,22 122,19 122,25" className="fill-slate-300"/>
            
            {/* Stats */}
            <rect x="136" y="0" width="56" height="44" rx="4" className="fill-teal-50 stroke-teal-300" strokeWidth="1.5"/>
            <rect x="144" y="8" width="18" height="18" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="153" y="20" textAnchor="middle" className="fill-teal-700 text-[8px]">m₁</text>
            <rect x="166" y="8" width="18" height="18" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="175" y="20" textAnchor="middle" className="fill-teal-700 text-[8px]">l₁</text>
            <text x="164" y="38" textAnchor="middle" className="fill-teal-500 text-[7px]">row-wise stats</text>
          </g>
        </g>

        {/* Arrow down to block 2 with stats flowing */}
        <g transform="translate(184, 80)">
          <line x1="0" y1="0" x2="0" y2="10" className="stroke-teal-400" strokeWidth="1.5" strokeDasharray="3,2"/>
          <polygon points="0,16 -3,10 3,10" className="fill-teal-400"/>
        </g>

        {/* Block 2 */}
        <g transform="translate(20, 95)">
          <text x="75" y="6" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">block 2</text>
          
          <g transform="translate(0, 12)">
            {/* Q */}
            <rect x="0" y="0" width="28" height="44" rx="4" className="fill-sky-200 stroke-sky-400" strokeWidth="1.5"/>
            <text x="14" y="27" textAnchor="middle" className="fill-sky-700 text-[10px]">Q</text>
            
            {/* × */}
            <text x="42" y="27" textAnchor="middle" className="fill-slate-400 text-[12px]">×</text>
            
            {/* K */}
            <rect x="56" y="8" width="44" height="28" rx="4" className="fill-amber-200 stroke-amber-400" strokeWidth="1.5"/>
            <text x="78" y="27" textAnchor="middle" className="fill-amber-700 text-[10px]">K₂<tspan baselineShift="super" className="text-[7px]">T</tspan></text>
            
            {/* Arrow */}
            <line x1="108" y1="22" x2="122" y2="22" className="stroke-slate-300" strokeWidth="1.5"/>
            <polygon points="128,22 122,19 122,25" className="fill-slate-300"/>
            
            {/* Updated stats */}
            <rect x="136" y="0" width="56" height="44" rx="4" className="fill-teal-50 stroke-teal-300" strokeWidth="1.5"/>
            <rect x="144" y="8" width="18" height="18" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="153" y="20" textAnchor="middle" className="fill-teal-700 text-[8px]">m₂</text>
            <rect x="166" y="8" width="18" height="18" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="175" y="20" textAnchor="middle" className="fill-teal-700 text-[8px]">l₂</text>
            <text x="164" y="38" textAnchor="middle" className="fill-teal-500 text-[7px]">row-wise update</text>
          </g>
        </g>

        {/* Right side: output accumulation */}
        <g transform="translate(230, 15)">
          {/* Block 1 output */}
          <g transform="translate(0, 12)">
            <text x="8" y="27" textAnchor="middle" className="fill-slate-400 text-[9px]">× V₁</text>
            <line x1="28" y1="22" x2="42" y2="22" className="stroke-slate-300" strokeWidth="1.5"/>
            <polygon points="48,22 42,19 42,25" className="fill-slate-300"/>
            <rect x="56" y="0" width="56" height="44" rx="4" className="fill-rose-100 stroke-rose-300" strokeWidth="1.5"/>
            <text x="84" y="-6" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">output</text>
            <text x="84" y="27" textAnchor="middle" className="fill-rose-600 text-[11px]">O₁</text>
          </g>
          
          {/* Rescale arrow */}
          <g transform="translate(84, 66)">
            <line x1="0" y1="0" x2="0" y2="10" className="stroke-rose-400" strokeWidth="1.5"/>
            <polygon points="0,16 -3,10 3,10" className="fill-rose-400"/>
          </g>
          
          {/* Block 2 output */}
          <g transform="translate(0, 92)">
            <text x="8" y="27" textAnchor="middle" className="fill-slate-400 text-[9px]">× V₂</text>
            <line x1="28" y1="22" x2="42" y2="22" className="stroke-slate-300" strokeWidth="1.5"/>
            <polygon points="48,22 42,19 42,25" className="fill-slate-300"/>
            <rect x="56" y="0" width="56" height="44" rx="4" className="fill-rose-100 stroke-rose-300" strokeWidth="1.5"/>
            <text x="84" y="27" textAnchor="middle" className="fill-rose-600 text-[11px]">O₂</text>
          </g>
        </g>


      </svg>
      <Caption>Block 2 uses m₁, l₁ from block 1 to update row-wise softmax stats and rescale before accumulating.</Caption>
    </figure>
  );
}

