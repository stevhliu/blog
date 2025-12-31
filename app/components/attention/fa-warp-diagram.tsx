import { Caption } from "../caption";

export function FAWarpDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 420 195" className="w-full max-w-lg mx-auto">
        {/* FlashAttention side */}
        <g transform="translate(10, 10)">
          <text x="90" y="0" textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">FlashAttention</text>
          <text x="90" y="14" textAnchor="middle" className="fill-slate-400 text-[8px]">split K, V across warps</text>
          
          <g transform="translate(0, 28)">
            {/* Shared Q block */}
            <rect x="60" y="0" width="60" height="28" rx="4" className="fill-sky-100 stroke-sky-300" strokeWidth="1.5"/>
            <text x="90" y="18" textAnchor="middle" className="fill-sky-700 text-[9px]">Q (shared)</text>
            
            {/* Arrows down to warps */}
            <line x1="75" y1="28" x2="40" y2="44" className="stroke-sky-400" strokeWidth="1"/>
            <line x1="90" y1="28" x2="90" y2="44" className="stroke-sky-400" strokeWidth="1"/>
            <line x1="105" y1="28" x2="140" y2="44" className="stroke-sky-400" strokeWidth="1"/>
            
            {/* Warps with K,V splits */}
            <g transform="translate(0, 48)">
              {/* Warp 0 */}
              <rect x="10" y="0" width="50" height="32" rx="3" className="fill-amber-100 stroke-amber-300" strokeWidth="1"/>
              <text x="35" y="13" textAnchor="middle" className="fill-amber-700 text-[8px]">warp 0</text>
              <text x="35" y="25" textAnchor="middle" className="fill-amber-600 text-[7px]">Q × K₀,V₀</text>
              
              {/* Warp 1 */}
              <rect x="65" y="0" width="50" height="32" rx="3" className="fill-amber-100 stroke-amber-300" strokeWidth="1"/>
              <text x="90" y="13" textAnchor="middle" className="fill-amber-700 text-[8px]">warp 1</text>
              <text x="90" y="25" textAnchor="middle" className="fill-amber-600 text-[7px]">Q × K₁,V₁</text>
              
              {/* Warp 2 */}
              <rect x="120" y="0" width="50" height="32" rx="3" className="fill-amber-100 stroke-amber-300" strokeWidth="1"/>
              <text x="145" y="13" textAnchor="middle" className="fill-amber-700 text-[8px]">warp 2</text>
              <text x="145" y="25" textAnchor="middle" className="fill-amber-600 text-[7px]">Q × K₂,V₂</text>
            </g>
            
            {/* Arrows to shared memory */}
            <g transform="translate(0, 88)">
              <line x1="35" y1="0" x2="35" y2="12" className="stroke-rose-400" strokeWidth="1"/>
              <line x1="90" y1="0" x2="90" y2="12" className="stroke-rose-400" strokeWidth="1"/>
              <line x1="145" y1="0" x2="145" y2="12" className="stroke-rose-400" strokeWidth="1"/>
              
              {/* Shared memory box */}
              <rect x="10" y="16" width="160" height="24" rx="3" className="fill-rose-100 stroke-rose-300" strokeWidth="1.5"/>
              <text x="90" y="32" textAnchor="middle" className="fill-rose-600 text-[8px]">shared memory (write partial results)</text>
            </g>
            
            {/* Sync barrier */}
            <g transform="translate(0, 134)">
              <line x1="10" y1="0" x2="170" y2="0" className="stroke-orange-500" strokeWidth="2" strokeDasharray="4,2"/>
              <text x="90" y="12" textAnchor="middle" className="fill-orange-600 text-[7px] font-medium">sync + reduce</text>
            </g>
          </g>
        </g>

        {/* FlashAttention-2 side */}
        <g transform="translate(220, 10)">
          <text x="90" y="0" textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">FlashAttention-2</text>
          <text x="90" y="14" textAnchor="middle" className="fill-teal-500 text-[8px]">split Q across warps</text>
          
          <g transform="translate(0, 28)">
            {/* K, V block accessible to all */}
            <rect x="60" y="0" width="60" height="28" rx="4" className="fill-amber-100 stroke-amber-300" strokeWidth="1.5"/>
            <text x="90" y="18" textAnchor="middle" className="fill-amber-700 text-[9px]">K, V (shared)</text>
            
            {/* Arrows down to warps */}
            <line x1="75" y1="28" x2="40" y2="44" className="stroke-amber-400" strokeWidth="1"/>
            <line x1="90" y1="28" x2="90" y2="44" className="stroke-amber-400" strokeWidth="1"/>
            <line x1="105" y1="28" x2="140" y2="44" className="stroke-amber-400" strokeWidth="1"/>
            
            {/* Warps with Q splits */}
            <g transform="translate(0, 48)">
              {/* Warp 0 */}
              <rect x="10" y="0" width="50" height="32" rx="3" className="fill-sky-100 stroke-sky-300" strokeWidth="1"/>
              <text x="35" y="13" textAnchor="middle" className="fill-sky-700 text-[8px]">warp 0</text>
              <text x="35" y="25" textAnchor="middle" className="fill-sky-600 text-[7px]">Q₀ × K,V</text>
              
              {/* Warp 1 */}
              <rect x="65" y="0" width="50" height="32" rx="3" className="fill-sky-100 stroke-sky-300" strokeWidth="1"/>
              <text x="90" y="13" textAnchor="middle" className="fill-sky-700 text-[8px]">warp 1</text>
              <text x="90" y="25" textAnchor="middle" className="fill-sky-600 text-[7px]">Q₁ × K,V</text>
              
              {/* Warp 2 */}
              <rect x="120" y="0" width="50" height="32" rx="3" className="fill-sky-100 stroke-sky-300" strokeWidth="1"/>
              <text x="145" y="13" textAnchor="middle" className="fill-sky-700 text-[8px]">warp 2</text>
              <text x="145" y="25" textAnchor="middle" className="fill-sky-600 text-[7px]">Q₂ × K,V</text>
            </g>
            
            {/* Direct to output - no intermediate shared memory */}
            <g transform="translate(0, 88)">
              <line x1="35" y1="0" x2="35" y2="12" className="stroke-teal-400" strokeWidth="1"/>
              <line x1="90" y1="0" x2="90" y2="12" className="stroke-teal-400" strokeWidth="1"/>
              <line x1="145" y1="0" x2="145" y2="12" className="stroke-teal-400" strokeWidth="1"/>
              
              {/* Independent partial outputs */}
              <rect x="10" y="16" width="50" height="24" rx="3" className="fill-teal-50 stroke-teal-200" strokeWidth="1.5"/>
              <text x="35" y="32" textAnchor="middle" className="fill-teal-600 text-[8px]">O₀ (no sync)</text>
              
              <rect x="65" y="16" width="50" height="24" rx="3" className="fill-teal-50 stroke-teal-200" strokeWidth="1.5"/>
              <text x="90" y="32" textAnchor="middle" className="fill-teal-600 text-[8px]">O₁ (no sync)</text>
              
              <rect x="120" y="16" width="50" height="24" rx="3" className="fill-teal-50 stroke-teal-200" strokeWidth="1.5"/>
              <text x="145" y="32" textAnchor="middle" className="fill-teal-600 text-[8px]">O₂ (no sync)</text>
            </g>
            
            {/* Final sync only at end */}
            <g transform="translate(0, 134)">
              <text x="90" y="12" textAnchor="middle" className="fill-teal-500 text-[7px] font-medium">no shared memory writes</text>
            </g>
          </g>
        </g>
      </svg>
      <Caption>FlashAttention-2 assigns Q blocks to warps instead of K,V, reducing shared memory writes and synchronization.</Caption>
    </figure>
  );
}

