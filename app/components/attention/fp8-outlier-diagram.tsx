import { Caption } from "../caption";

export function FP8OutlierDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 440 145" className="w-full max-w-xl mx-auto">
        {/* Title for left side - Before */}
        <text x="95" y="16" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">global scale</text>
        
        {/* Title for right side - After */}
        <text x="330" y="16" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">per-block scale</text>
        
        {/* Left side - Hidden states with outlier, single scale */}
        <g transform="translate(20, 28)">
          {/* Block outline */}
          <rect x="0" y="0" width="150" height="100" rx="4" className="fill-slate-50 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="1"/>
          
          {/* Bar chart showing dimensions */}
          <g transform="translate(15, 75)">
            {/* Normal dimensions - squashed due to outlier scale */}
            <rect x="0" y="-3" width="14" height="3" className="fill-blue-300"/>
            <text x="7" y="8" textAnchor="middle" className="fill-blue-500 text-[5px]">0.5</text>
            
            <rect x="20" y="-2" width="14" height="2" className="fill-blue-300"/>
            <text x="27" y="8" textAnchor="middle" className="fill-blue-500 text-[5px]">0.3</text>
            
            <rect x="40" y="-2" width="14" height="2" className="fill-blue-300"/>
            <text x="47" y="8" textAnchor="middle" className="fill-blue-500 text-[5px]">0.2</text>
            
            <rect x="60" y="-2" width="14" height="2" className="fill-blue-300"/>
            <text x="67" y="8" textAnchor="middle" className="fill-blue-500 text-[5px]">0.4</text>
            
            {/* Outlier values - take up all the range */}
            <rect x="84" y="-50" width="14" height="50" className="fill-red-400"/>
            <text x="91" y="8" textAnchor="middle" className="fill-red-500 text-[5px]">52.0</text>
            
            <rect x="104" y="-45" width="14" height="45" className="fill-red-300"/>
            <text x="111" y="8" textAnchor="middle" className="fill-red-400 text-[5px]">47.0</text>
          </g>
          
          <text x="75" y="95" textAnchor="middle" className="fill-slate-500 text-[6px]">scale ≈ 0.116</text>
        </g>
        
        {/* Right side - Per-block scaling */}
        <g transform="translate(215, 28)">
          {/* Block 1 - small values, tiny scale */}
          <g>
            <rect x="0" y="0" width="100" height="100" rx="4" className="fill-emerald-50 stroke-emerald-400 dark:fill-emerald-900/30 dark:stroke-emerald-600" strokeWidth="1.5"/>
            <text x="50" y="14" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[7px] font-medium">block 1</text>
            
            {/* Original values */}
            <text x="50" y="26" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[6px]">[0.5, 0.3, 0.2, 0.4]</text>
            
            {/* Bar chart - all use full range after scaling */}
            <g transform="translate(10, 70)">
              <rect x="0" y="-35" width="16" height="35" className="fill-emerald-400"/>
              <text x="8" y="8" textAnchor="middle" className="fill-emerald-600 text-[5px]">448</text>
              
              <rect x="20" y="-21" width="16" height="21" className="fill-emerald-400"/>
              <text x="28" y="8" textAnchor="middle" className="fill-emerald-600 text-[5px]">268</text>
              
              <rect x="40" y="-14" width="16" height="14" className="fill-emerald-400"/>
              <text x="48" y="8" textAnchor="middle" className="fill-emerald-600 text-[5px]">179</text>
              
              <rect x="60" y="-28" width="16" height="28" className="fill-emerald-400"/>
              <text x="68" y="8" textAnchor="middle" className="fill-emerald-600 text-[5px]">357</text>
            </g>
            
            <text x="50" y="95" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[6px]">scale₁ ≈ 0.001</text>
          </g>
          
          {/* Block 2 - large values, big scale */}
          <g transform="translate(110, 0)">
            <rect x="0" y="0" width="100" height="100" rx="4" className="fill-amber-50 stroke-amber-400 dark:fill-amber-900/30 dark:stroke-amber-500" strokeWidth="1.5"/>
            <text x="50" y="14" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400 text-[7px] font-medium">block 2</text>
            
            {/* Original values */}
            <text x="50" y="26" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[6px]">[47, 52, 41, 48]</text>
            
            {/* Bar chart - all use full range after scaling */}
            <g transform="translate(10, 70)">
              <rect x="0" y="-32" width="16" height="32" className="fill-amber-400"/>
              <text x="8" y="8" textAnchor="middle" className="fill-amber-600 text-[5px]">405</text>
              
              <rect x="20" y="-35" width="16" height="35" className="fill-amber-500"/>
              <text x="28" y="8" textAnchor="middle" className="fill-amber-600 text-[5px]">448</text>
              
              <rect x="40" y="-28" width="16" height="28" className="fill-amber-400"/>
              <text x="48" y="8" textAnchor="middle" className="fill-amber-600 text-[5px]">353</text>
              
              <rect x="60" y="-33" width="16" height="33" className="fill-amber-400"/>
              <text x="68" y="8" textAnchor="middle" className="fill-amber-600 text-[5px]">414</text>
            </g>
            
            <text x="50" y="95" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400 text-[6px]">scale₂ ≈ 0.116</text>
          </g>
        </g>

      </svg>
      <Caption>Each block computes its own scale so precision is preserved locally. Both use the full FP8 range.</Caption>
    </figure>
  );
}
