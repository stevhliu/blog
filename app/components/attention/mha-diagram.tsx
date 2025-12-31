import { Caption } from "../caption";

export function MHADiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 360 90" className="w-full max-w-md mx-auto">
        {/* Head 1 */}
        <g transform="translate(20, 30)">
          <text x="50" y="-8" textAnchor="middle" className="fill-slate-400 text-[9px]">head 1</text>
          <rect x="0" y="0" width="30" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="15" y="25" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₁</text>
          <rect x="35" y="0" width="30" height="40" rx="6" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="50" y="25" textAnchor="middle" className="fill-amber-600 text-[12px] font-medium">K₁</text>
          <rect x="70" y="0" width="30" height="40" rx="6" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="85" y="25" textAnchor="middle" className="fill-emerald-600 text-[12px] font-medium">V₁</text>
        </g>
        
        {/* Head 2 */}
        <g transform="translate(130, 30)">
          <text x="50" y="-8" textAnchor="middle" className="fill-slate-400 text-[9px]">head 2</text>
          <rect x="0" y="0" width="30" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="15" y="25" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₂</text>
          <rect x="35" y="0" width="30" height="40" rx="6" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="50" y="25" textAnchor="middle" className="fill-amber-600 text-[12px] font-medium">K₂</text>
          <rect x="70" y="0" width="30" height="40" rx="6" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="85" y="25" textAnchor="middle" className="fill-emerald-600 text-[12px] font-medium">V₂</text>
        </g>
        
        {/* Head 3 */}
        <g transform="translate(240, 30)">
          <text x="50" y="-8" textAnchor="middle" className="fill-slate-400 text-[9px]">head 3</text>
          <rect x="0" y="0" width="30" height="40" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="15" y="25" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q₃</text>
          <rect x="35" y="0" width="30" height="40" rx="6" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="50" y="25" textAnchor="middle" className="fill-amber-600 text-[12px] font-medium">K₃</text>
          <rect x="70" y="0" width="30" height="40" rx="6" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="85" y="25" textAnchor="middle" className="fill-emerald-600 text-[12px] font-medium">V₃</text>
        </g>
      </svg>
      <Caption>Each head has its own Q, K, and V projections.</Caption>
    </figure>
  );
}

