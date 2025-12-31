import { Caption } from "../caption";

export function CausalDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 420 110" className="w-full max-w-md mx-auto">
        {/* Single head with Q, K, V */}
        <g transform="translate(20, 20)">
          <text x="85" y="-4" textAnchor="middle" className="fill-slate-400 text-[11px]">single head</text>
          <rect x="0" y="10" width="50" height="45" rx="6" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="25" y="38" textAnchor="middle" className="fill-sky-600 text-[12px] font-medium">Q</text>
          <rect x="60" y="10" width="50" height="45" rx="6" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="85" y="38" textAnchor="middle" className="fill-amber-600 text-[12px] font-medium">K</text>
          <rect x="120" y="10" width="50" height="45" rx="6" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="145" y="38" textAnchor="middle" className="fill-emerald-600 text-[12px] font-medium">V</text>
        </g>
        
        {/* Causal mask visualization */}
        <g transform="translate(230, 16)">
          <text x="85" y="0" textAnchor="middle" className="fill-slate-400 text-[11px]">causal mask</text>
          <rect x="0" y="10" width="170" height="74" rx="8" className="fill-slate-50 stroke-slate-300" strokeWidth="1.5"/>
          
          {/* Mask grid - showing triangular pattern */}
          <rect x="10" y="18" width="22" height="18" rx="2" className="fill-emerald-200"/>
          <rect x="36" y="18" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="62" y="18" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="88" y="18" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="114" y="18" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="140" y="18" width="22" height="18" rx="2" className="fill-slate-200"/>
          
          <rect x="10" y="39" width="22" height="18" rx="2" className="fill-emerald-200"/>
          <rect x="36" y="39" width="22" height="18" rx="2" className="fill-emerald-200"/>
          <rect x="62" y="39" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="88" y="39" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="114" y="39" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="140" y="39" width="22" height="18" rx="2" className="fill-slate-200"/>
          
          <rect x="10" y="60" width="22" height="18" rx="2" className="fill-emerald-200"/>
          <rect x="36" y="60" width="22" height="18" rx="2" className="fill-emerald-200"/>
          <rect x="62" y="60" width="22" height="18" rx="2" className="fill-emerald-200"/>
          <rect x="88" y="60" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="114" y="60" width="22" height="18" rx="2" className="fill-slate-200"/>
          <rect x="140" y="60" width="22" height="18" rx="2" className="fill-slate-200"/>
        </g>
      </svg>
      <Caption>Q, K, V per head. Future positions masked (gray) so tokens only attend to past.</Caption>
    </figure>
  );
}

