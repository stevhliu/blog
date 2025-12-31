import { Caption } from "../caption";

export function KVCacheDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 460 160" className="w-full max-w-lg mx-auto">
        {/* Step labels */}
        <text x="75" y="15" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">step 1</text>
        <text x="155" y="15" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">step 2</text>
        <text x="260" y="15" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">step 3</text>
        <text x="390" y="15" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">step 4</text>
        
        {/* Without cache row label */}
        <text x="45" y="50" textAnchor="end" className="fill-slate-400 text-[8px]">without</text>
        <text x="45" y="60" textAnchor="end" className="fill-slate-400 text-[8px]">cache</text>
        
        {/* Step 1: compute K,V for token 1 */}
        <g transform="translate(55, 30)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="14" y="16" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300 text-[6px] font-medium">K₁V₁</text>
          <text x="14" y="28" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[5px]">new</text>
        </g>
        
        {/* Step 2: recompute K,V for tokens 1,2 */}
        <g transform="translate(115, 30)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="14" y="16" textAnchor="middle" className="fill-rose-700 dark:fill-rose-300 text-[6px] font-medium">K₁V₁</text>
          <text x="14" y="28" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[5px]">redo</text>
          
          <rect x="32" y="0" width="28" height="40" rx="3" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="46" y="16" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300 text-[6px] font-medium">K₂V₂</text>
          <text x="46" y="28" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[5px]">new</text>
        </g>
        
        {/* Step 3: recompute K,V for tokens 1,2,3 */}
        <g transform="translate(200, 30)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="14" y="16" textAnchor="middle" className="fill-rose-700 dark:fill-rose-300 text-[6px] font-medium">K₁V₁</text>
          <text x="14" y="28" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[5px]">redo</text>
          
          <rect x="32" y="0" width="28" height="40" rx="3" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="46" y="16" textAnchor="middle" className="fill-rose-700 dark:fill-rose-300 text-[6px] font-medium">K₂V₂</text>
          <text x="46" y="28" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[5px]">redo</text>
          
          <rect x="64" y="0" width="28" height="40" rx="3" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="78" y="16" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300 text-[6px] font-medium">K₃V₃</text>
          <text x="78" y="28" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[5px]">new</text>
        </g>
        
        {/* Step 4: even more recomputation */}
        <g transform="translate(320, 30)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="14" y="22" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[6px]">...</text>
          
          <rect x="32" y="0" width="28" height="40" rx="3" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="46" y="22" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[6px]">...</text>
          
          <rect x="64" y="0" width="28" height="40" rx="3" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="78" y="22" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[6px]">...</text>
          
          <rect x="96" y="0" width="28" height="40" rx="3" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="110" y="16" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300 text-[6px] font-medium">K₄V₄</text>
          <text x="110" y="28" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[5px]">new</text>
        </g>

        {/* With cache row label */}
        <text x="45" y="125" textAnchor="end" className="fill-slate-400 text-[8px]">with</text>
        <text x="45" y="135" textAnchor="end" className="fill-slate-400 text-[8px]">cache</text>
        
        {/* Step 1: compute and cache */}
        <g transform="translate(55, 105)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="14" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px] font-medium">K₁V₁</text>
          <text x="14" y="28" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[5px]">new</text>
        </g>
        
        {/* Step 2: reuse cache, compute new */}
        <g transform="translate(115, 105)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="14" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px] font-medium">K₁V₁</text>
          <text x="14" y="28" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[5px]">cached</text>
          
          <rect x="32" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="46" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px] font-medium">K₂V₂</text>
          <text x="46" y="28" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[5px]">new</text>
        </g>
        
        {/* Step 3: reuse all, compute new */}
        <g transform="translate(200, 105)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="14" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px] font-medium">K₁V₁</text>
          <text x="14" y="28" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[5px]">cached</text>
          
          <rect x="32" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="46" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px] font-medium">K₂V₂</text>
          <text x="46" y="28" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[5px]">cached</text>
          
          <rect x="64" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="78" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px] font-medium">K₃V₃</text>
          <text x="78" y="28" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[5px]">new</text>
        </g>
        
        {/* Step 4: all cached, one new */}
        <g transform="translate(320, 105)">
          <rect x="0" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="14" y="22" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[6px]">...</text>
          
          <rect x="32" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="46" y="22" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[6px]">...</text>
          
          <rect x="64" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="78" y="22" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[6px]">...</text>
          
          <rect x="96" y="0" width="28" height="40" rx="3" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="110" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[6px] font-medium">K₄V₄</text>
          <text x="110" y="28" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[5px]">new</text>
        </g>
      </svg>
      <Caption>Without caching, K and V are recomputed for all tokens at each step. With caching, only the new token's K and V are computed.</Caption>
    </figure>
  );
}

