import { Caption } from "../caption";

export function GQADiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 500 240" className="w-full max-w-lg mx-auto">
        {/* Group 1 box */}
        <rect x="20" y="10" width="220" height="220" rx="12" className="fill-violet-50 stroke-violet-200" strokeWidth="1.5" strokeDasharray="6,4"/>
        <text x="130" y="32" textAnchor="middle" className="fill-violet-400 text-[11px]">group 1</text>
        
        {/* Group 2 box */}
        <rect x="260" y="10" width="220" height="220" rx="12" className="fill-rose-50 stroke-rose-200" strokeWidth="1.5" strokeDasharray="6,4"/>
        <text x="370" y="32" textAnchor="middle" className="fill-rose-400 text-[11px]">group 2</text>
        
        {/* Group 1 Heads */}
        <g transform="translate(35, 42)">
          <g transform="translate(0, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 1</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₁</text>
          </g>
          <g transform="translate(48, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 2</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₂</text>
          </g>
          <g transform="translate(96, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 3</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₃</text>
          </g>
          <g transform="translate(144, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 4</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₄</text>
          </g>
        </g>
        
        {/* Group 1 shared K, V */}
        <g transform="translate(65, 150)">
          <rect x="0" y="0" width="50" height="44" rx="6" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="25" y="27" textAnchor="middle" className="fill-amber-600 text-[13px] font-medium">K₁</text>
          <rect x="60" y="0" width="50" height="44" rx="6" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="85" y="27" textAnchor="middle" className="fill-emerald-600 text-[13px] font-medium">V₁</text>
        </g>
        
        {/* Group 2 Heads */}
        <g transform="translate(275, 42)">
          <g transform="translate(0, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 5</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₅</text>
          </g>
          <g transform="translate(48, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 6</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₆</text>
          </g>
          <g transform="translate(96, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 7</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₇</text>
          </g>
          <g transform="translate(144, 0)">
            <rect x="-3" y="0" width="42" height="58" rx="6" className="fill-white/50 stroke-slate-200" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="18" y="12" textAnchor="middle" className="fill-slate-400 text-[9px]">head 8</text>
            <rect x="0" y="16" width="36" height="36" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="18" y="39" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₈</text>
          </g>
        </g>
        
        {/* Group 2 shared K, V */}
        <g transform="translate(305, 150)">
          <rect x="0" y="0" width="50" height="44" rx="6" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="25" y="27" textAnchor="middle" className="fill-amber-600 text-[13px] font-medium">K₂</text>
          <rect x="60" y="0" width="50" height="44" rx="6" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="85" y="27" textAnchor="middle" className="fill-emerald-600 text-[13px] font-medium">V₂</text>
        </g>
      </svg>
      <Caption>Each head has its own Q. K and V are shared within each group.</Caption>
    </figure>
  );
}

