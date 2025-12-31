import { Caption } from "../caption";

export function IncoherentDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 440 145" className="w-full max-w-xl mx-auto">
        {/* Input vector with outlier */}
        <g transform="translate(15, 45)">
          <text x="50" y="-35" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">input</text>
          
          {/* Values */}
          <g transform="translate(0, 0)">
            <rect x="0" y="15" width="16" height="30" rx="2" className="fill-blue-200 stroke-blue-400" strokeWidth="1"/>
            <text x="8" y="58" textAnchor="middle" className="fill-blue-600 text-[6px]">0.5</text>
            
            <rect x="20" y="20" width="16" height="25" rx="2" className="fill-blue-200 stroke-blue-400" strokeWidth="1"/>
            <text x="28" y="58" textAnchor="middle" className="fill-blue-600 text-[6px]">0.3</text>
            
            <rect x="40" y="23" width="16" height="22" rx="2" className="fill-blue-200 stroke-blue-400" strokeWidth="1"/>
            <text x="48" y="58" textAnchor="middle" className="fill-blue-600 text-[6px]">0.2</text>
            
            {/* Outlier - much taller, different color */}
            <rect x="60" y="-30" width="16" height="75" rx="2" className="fill-red-300 stroke-red-500" strokeWidth="1.5"/>
            <text x="68" y="58" textAnchor="middle" className="fill-red-600 text-[6px] font-medium">47.0</text>
            
            <rect x="80" y="25" width="16" height="20" rx="2" className="fill-blue-200 stroke-blue-400" strokeWidth="1"/>
            <text x="88" y="58" textAnchor="middle" className="fill-blue-600 text-[6px]">0.1</text>
          </g>
        </g>
        
        {/* Multiply symbol */}
        <text x="128" y="75" textAnchor="middle" className="fill-slate-500 text-[16px]">×</text>
        
        {/* Random orthogonal matrix R */}
        <g transform="translate(140, 10)">
          <text x="50" y="0" textAnchor="middle" className="fill-violet-600 dark:fill-violet-400 text-[9px] font-medium">random orthogonal R</text>
          
          {/* Matrix grid */}
          <g transform="translate(5, 10)">
            {/* Row 1 */}
            <rect x="0" y="0" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="20" y="0" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="40" y="0" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="60" y="0" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="80" y="0" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            
            {/* Row 2 */}
            <rect x="0" y="20" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="20" y="20" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="40" y="20" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="60" y="20" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="80" y="20" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            
            {/* Row 3 */}
            <rect x="0" y="40" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="20" y="40" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="40" y="40" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="60" y="40" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="80" y="40" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            
            {/* Row 4 */}
            <rect x="0" y="60" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="20" y="60" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="40" y="60" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="60" y="60" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="80" y="60" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            
            {/* Row 5 */}
            <rect x="0" y="80" width="16" height="16" rx="2" className="fill-violet-200 stroke-violet-400 dark:fill-violet-800/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="20" y="80" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="40" y="80" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="60" y="80" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
            <rect x="80" y="80" width="16" height="16" rx="2" className="fill-violet-100 stroke-violet-300 dark:fill-violet-900/50 dark:stroke-violet-500" strokeWidth="0.5"/>
          </g>
          
          <text x="50" y="120" textAnchor="middle" className="fill-violet-500 dark:fill-violet-400 text-[6px]">R<tspan baselineShift="super" className="text-[4px]">T</tspan>R = I (preserves dot products)</text>
        </g>
        
        {/* Equals */}
        <text x="258" y="75" textAnchor="middle" className="fill-slate-500 text-[16px]">=</text>
        
        {/* Output vector - spread evenly */}
        <g transform="translate(280, 45)">
          <text x="70" y="-35" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">output</text>
          
          {/* Values - all similar heights now */}
          <g transform="translate(0, 0)">
            <rect x="0" y="12" width="24" height="33" rx="2" className="fill-emerald-300 stroke-emerald-500" strokeWidth="1"/>
            <text x="12" y="58" textAnchor="middle" className="fill-emerald-600 text-[6px]">8.2</text>
            
            <rect x="28" y="10" width="24" height="35" rx="2" className="fill-emerald-300 stroke-emerald-500" strokeWidth="1"/>
            <text x="40" y="58" textAnchor="middle" className="fill-emerald-600 text-[6px]">9.1</text>
            
            <rect x="56" y="14" width="24" height="31" rx="2" className="fill-emerald-300 stroke-emerald-500" strokeWidth="1"/>
            <text x="68" y="58" textAnchor="middle" className="fill-emerald-600 text-[6px]">7.8</text>
            
            <rect x="84" y="11" width="24" height="34" rx="2" className="fill-emerald-300 stroke-emerald-500" strokeWidth="1"/>
            <text x="96" y="58" textAnchor="middle" className="fill-emerald-600 text-[6px]">8.5</text>
            
            <rect x="112" y="12" width="24" height="33" rx="2" className="fill-emerald-300 stroke-emerald-500" strokeWidth="1"/>
            <text x="124" y="58" textAnchor="middle" className="fill-emerald-600 text-[6px]">8.4</text>
          </g>
          
        </g>
      </svg>
      <Caption>Multiplying by random orthogonal matrix R redistributes the outlier across all dimensions while preserving dot products.</Caption>
    </figure>
  );
}
