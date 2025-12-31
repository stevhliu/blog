import { Caption } from "../caption";

export function FAParallelismDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 420 200" className="w-full max-w-lg mx-auto">
        {/* FlashAttention-1 side */}
        <g transform="translate(10, 10)">
          <text x="90" y="0" textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">FlashAttention</text>
          <text x="90" y="14" textAnchor="middle" className="fill-slate-400 text-[8px]">batch × heads</text>
          
          {/* SM Grid - 4x4 but only some active */}
          <g transform="translate(10, 28)">
            {/* Row 1 - active */}
            <rect x="0" y="0" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="18" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 0</text>
            <text x="18" y="21" textAnchor="middle" className="fill-violet-600 text-[6px]">head 0</text>
            
            <rect x="42" y="0" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="60" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 0</text>
            <text x="60" y="21" textAnchor="middle" className="fill-violet-600 text-[6px]">head 1</text>
            
            <rect x="84" y="0" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="102" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 0</text>
            <text x="102" y="21" textAnchor="middle" className="fill-violet-600 text-[6px]">head 2</text>
            
            <rect x="126" y="0" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="144" y="12" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 0</text>
            <text x="144" y="21" textAnchor="middle" className="fill-violet-600 text-[6px]">head 3</text>
            
            {/* Row 2 - active */}
            <rect x="0" y="34" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="18" y="46" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 1</text>
            <text x="18" y="55" textAnchor="middle" className="fill-violet-600 text-[6px]">head 0</text>
            
            <rect x="42" y="34" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="60" y="46" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 1</text>
            <text x="60" y="55" textAnchor="middle" className="fill-violet-600 text-[6px]">head 1</text>
            
            <rect x="84" y="34" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="102" y="46" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 1</text>
            <text x="102" y="55" textAnchor="middle" className="fill-violet-600 text-[6px]">head 2</text>
            
            <rect x="126" y="34" width="36" height="28" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="144" y="46" textAnchor="middle" className="fill-violet-700 text-[6px]">batch 1</text>
            <text x="144" y="55" textAnchor="middle" className="fill-violet-600 text-[6px]">head 3</text>
            
            {/* Row 3 - inactive */}
            <rect x="0" y="68" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="18" y="85" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
            
            <rect x="42" y="68" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="60" y="85" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
            
            <rect x="84" y="68" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="102" y="85" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
            
            <rect x="126" y="68" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="144" y="85" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
            
            {/* Row 4 - inactive */}
            <rect x="0" y="102" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="18" y="119" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
            
            <rect x="42" y="102" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="60" y="119" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
            
            <rect x="84" y="102" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="102" y="119" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
            
            <rect x="126" y="102" width="36" height="28" rx="3" className="fill-slate-100 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="2,2"/>
            <text x="144" y="119" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[7px]">idle</text>
          </g>
          
          <text x="90" y="170" textAnchor="middle" className="fill-slate-400 text-[8px]">8 of 16 SMs used</text>
        </g>

        {/* FlashAttention-2 side */}
        <g transform="translate(220, 10)">
          <text x="90" y="0" textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">FlashAttention-2</text>
          <text x="90" y="14" textAnchor="middle" className="fill-teal-500 text-[8px]">batch × heads × seq blocks</text>
          
          {/* SM Grid - 4x4 all active */}
          <g transform="translate(10, 28)">
            {/* Row 1 */}
            <rect x="0" y="0" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="18" y="12" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h0</text>
            <text x="18" y="21" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="42" y="0" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="60" y="12" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h0</text>
            <text x="60" y="21" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
            
            <rect x="84" y="0" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="102" y="12" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h1</text>
            <text x="102" y="21" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="126" y="0" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="144" y="12" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h1</text>
            <text x="144" y="21" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
            
            {/* Row 2 */}
            <rect x="0" y="34" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="18" y="46" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h2</text>
            <text x="18" y="55" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="42" y="34" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="60" y="46" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h2</text>
            <text x="60" y="55" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
            
            <rect x="84" y="34" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="102" y="46" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h3</text>
            <text x="102" y="55" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="126" y="34" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="144" y="46" textAnchor="middle" className="fill-teal-700 text-[6px]">b0 h3</text>
            <text x="144" y="55" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
            
            {/* Row 3 */}
            <rect x="0" y="68" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="18" y="80" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h0</text>
            <text x="18" y="89" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="42" y="68" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="60" y="80" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h0</text>
            <text x="60" y="89" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
            
            <rect x="84" y="68" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="102" y="80" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h1</text>
            <text x="102" y="89" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="126" y="68" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="144" y="80" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h1</text>
            <text x="144" y="89" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
            
            {/* Row 4 */}
            <rect x="0" y="102" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="18" y="114" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h2</text>
            <text x="18" y="123" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="42" y="102" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="60" y="114" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h2</text>
            <text x="60" y="123" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
            
            <rect x="84" y="102" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="102" y="114" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h3</text>
            <text x="102" y="123" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 0</text>
            
            <rect x="126" y="102" width="36" height="28" rx="3" className="fill-teal-200 stroke-teal-400" strokeWidth="1"/>
            <text x="144" y="114" textAnchor="middle" className="fill-teal-700 text-[6px]">b1 h3</text>
            <text x="144" y="123" textAnchor="middle" className="fill-teal-600 text-[6px]">seq 1</text>
          </g>
          
          <text x="90" y="170" textAnchor="middle" className="fill-teal-500 text-[8px]">16 of 16 SMs used</text>
        </g>
      </svg>
      <Caption>FlashAttention-2 splits work across sequence blocks, using more SMs when batch size and heads are small.</Caption>
    </figure>
  );
}

