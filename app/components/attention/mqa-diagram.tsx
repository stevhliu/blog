import { Caption } from "../caption";

export function MQADiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 340 180" className="w-full max-w-sm mx-auto">
        {/* Head 1 */}
        <g transform="translate(20, 10)">
          <rect x="-5" y="0" width="50" height="75" rx="8" className="fill-slate-50 stroke-slate-200" strokeWidth="1" strokeDasharray="4,2"/>
          <text x="20" y="14" textAnchor="middle" className="fill-slate-400 text-[9px]">head 1</text>
          <rect x="0" y="22" width="40" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="20" y="47" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₁</text>
        </g>
        
        {/* Head 2 */}
        <g transform="translate(75, 10)">
          <rect x="-5" y="0" width="50" height="75" rx="8" className="fill-slate-50 stroke-slate-200" strokeWidth="1" strokeDasharray="4,2"/>
          <text x="20" y="14" textAnchor="middle" className="fill-slate-400 text-[9px]">head 2</text>
          <rect x="0" y="22" width="40" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="20" y="47" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₂</text>
        </g>
        
        {/* Head 3 */}
        <g transform="translate(130, 10)">
          <rect x="-5" y="0" width="50" height="75" rx="8" className="fill-slate-50 stroke-slate-200" strokeWidth="1" strokeDasharray="4,2"/>
          <text x="20" y="14" textAnchor="middle" className="fill-slate-400 text-[9px]">head 3</text>
          <rect x="0" y="22" width="40" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="20" y="47" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₃</text>
        </g>
        
        {/* Head 4 */}
        <g transform="translate(185, 10)">
          <rect x="-5" y="0" width="50" height="75" rx="8" className="fill-slate-50 stroke-slate-200" strokeWidth="1" strokeDasharray="4,2"/>
          <text x="20" y="14" textAnchor="middle" className="fill-slate-400 text-[9px]">head 4</text>
          <rect x="0" y="22" width="40" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="20" y="47" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₄</text>
        </g>
        
        {/* Head 5 */}
        <g transform="translate(240, 10)">
          <rect x="-5" y="0" width="50" height="75" rx="8" className="fill-slate-50 stroke-slate-200" strokeWidth="1" strokeDasharray="4,2"/>
          <text x="20" y="14" textAnchor="middle" className="fill-slate-400 text-[9px]">head 5</text>
          <rect x="0" y="22" width="40" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="20" y="47" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₅</text>
        </g>
        
        {/* Head 6 */}
        <g transform="translate(295, 10)">
          <rect x="-5" y="0" width="50" height="75" rx="8" className="fill-slate-50 stroke-slate-200" strokeWidth="1" strokeDasharray="4,2"/>
          <text x="20" y="14" textAnchor="middle" className="fill-slate-400 text-[9px]">head 6</text>
          <rect x="0" y="22" width="40" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="20" y="47" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₆</text>
        </g>

        {/* Shared K and V */}
        <g transform="translate(95, 110)">
          <rect x="0" y="0" width="60" height="50" rx="8" className="fill-amber-100 stroke-amber-400" strokeWidth="2"/>
          <text x="30" y="30" textAnchor="middle" className="fill-amber-600 text-[13px] font-medium">K</text>
          <rect x="90" y="0" width="60" height="50" rx="8" className="fill-emerald-100 stroke-emerald-400" strokeWidth="2"/>
          <text x="120" y="30" textAnchor="middle" className="fill-emerald-600 text-[13px] font-medium">V</text>
        </g>
      </svg>
      <Caption>Each head has its own Q. All heads share a single K and V.</Caption>
    </figure>
  );
}

