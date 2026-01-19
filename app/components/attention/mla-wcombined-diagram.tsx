import { Caption } from "../caption";

export function MLAAbsorbDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 340 140" className="w-full max-w-lg mx-auto">
        {/* Usual approach */}
        <g transform="translate(80, 25)">
          <text x="-8" y="13" textAnchor="end" className="fill-slate-400 dark:fill-slate-500 text-[8px]">inference</text>
          <text x="-8" y="22" textAnchor="end" className="fill-slate-400 dark:fill-slate-500 text-[8px]">(expands)</text>
          
          {/* First group: c^Q × W^UQ */}
          <g>
            <rect x="0" y="-4" width="72" height="34" rx="5" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800/50 dark:stroke-slate-700" strokeWidth="1"/>
            
            {/* c^Q */}
            <rect x="6" y="2" width="24" height="22" rx="4" className="fill-sky-100 stroke-sky-400 dark:fill-sky-900 dark:stroke-sky-500" strokeWidth="1.5"/>
            <text x="18" y="17" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[9px] font-medium">c<tspan baselineShift="super" className="text-[6px]">Q</tspan></text>
            
            {/* × */}
            <text x="38" y="17" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[10px]">×</text>
            
            {/* W^UQ */}
            <rect x="46" y="2" width="20" height="22" rx="4" className="fill-fuchsia-100 stroke-fuchsia-400 dark:fill-fuchsia-900 dark:stroke-fuchsia-500" strokeWidth="1.5"/>
            <text x="56" y="17" textAnchor="middle" className="fill-fuchsia-600 dark:fill-fuchsia-400 text-[7px] font-medium">W<tspan baselineShift="super" className="text-[5px]">UQ</tspan></text>
          </g>
          
          {/* Arrow */}
          <line x1="76" y1="13" x2="82" y2="13" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>
          <polygon points="88,13 82,10 82,16" className="fill-slate-300 dark:fill-slate-600"/>
          
          {/* Q expanded */}
          <rect x="90" y="-2" width="32" height="30" rx="4" className="fill-sky-50 stroke-sky-300 dark:fill-sky-950/50 dark:stroke-sky-600" strokeWidth="1.5"/>
          <text x="106" y="17" textAnchor="middle" className="fill-sky-500 dark:fill-sky-400 text-[11px] font-medium">Q</text>

          {/* Second group: c^KV × W^UK */}
          <g transform="translate(136, 0)">
            <rect x="0" y="-4" width="72" height="34" rx="5" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800/50 dark:stroke-slate-700" strokeWidth="1"/>
            
            {/* c^KV */}
            <rect x="6" y="2" width="24" height="22" rx="4" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
            <text x="18" y="17" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[9px] font-medium">c<tspan baselineShift="super" className="text-[6px]">KV</tspan></text>
            
            {/* × */}
            <text x="38" y="17" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[10px]">×</text>
            
            {/* W^UK */}
            <rect x="46" y="2" width="20" height="22" rx="4" className="fill-fuchsia-100 stroke-fuchsia-400 dark:fill-fuchsia-900 dark:stroke-fuchsia-500" strokeWidth="1.5"/>
            <text x="56" y="17" textAnchor="middle" className="fill-fuchsia-600 dark:fill-fuchsia-400 text-[7px] font-medium">W<tspan baselineShift="super" className="text-[5px]">UK</tspan></text>
          </g>
          
          {/* Arrow */}
          <line x1="212" y1="13" x2="218" y2="13" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>
          <polygon points="224,13 218,10 218,16" className="fill-slate-300 dark:fill-slate-600"/>
          
          {/* K expanded */}
          <rect x="226" y="-2" width="32" height="30" rx="4" className="fill-amber-50 stroke-amber-300 dark:fill-amber-950/50 dark:stroke-amber-600" strokeWidth="1.5"/>
          <text x="242" y="17" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[11px] font-medium">K</text>

        </g>

        {/* MLA approach */}
        <g transform="translate(80, 75)">
          <text x="-8" y="8" textAnchor="end" className="fill-emerald-600 dark:fill-emerald-400 text-[8px] font-medium">MLA</text>
          <text x="-8" y="17" textAnchor="end" className="fill-emerald-600 dark:fill-emerald-400 text-[8px] font-medium">(stays small)</text>
          
          {/* c^Q */}
          <rect x="0" y="0" width="28" height="26" rx="4" className="fill-sky-100 stroke-sky-400 dark:fill-sky-900 dark:stroke-sky-500" strokeWidth="1.5"/>
          <text x="14" y="17" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[10px] font-medium">c<tspan baselineShift="super" className="text-[7px]">Q</tspan></text>
          
          {/* × */}
          <text x="38" y="18" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[11px]">×</text>
          
          {/* W^combined with W^UQ and W^UK inside */}
          <rect x="48" y="-4" width="92" height="34" rx="5" className="fill-fuchsia-100 stroke-fuchsia-400 dark:fill-fuchsia-900 dark:stroke-fuchsia-500" strokeWidth="1.5"/>
          
          {/* W^UQ ghost inside */}
          <rect x="54" y="2" width="36" height="22" rx="3" className="fill-fuchsia-50/50 stroke-fuchsia-300/50 dark:fill-fuchsia-950/30 dark:stroke-fuchsia-600/50" strokeWidth="1" strokeDasharray="2,2"/>
          <text x="72" y="17" textAnchor="middle" className="fill-fuchsia-400 dark:fill-fuchsia-500 text-[8px]">W<tspan baselineShift="super" className="text-[6px]">UQ</tspan></text>
          
          {/* W^UK ghost inside */}
          <rect x="98" y="2" width="36" height="22" rx="3" className="fill-fuchsia-50/50 stroke-fuchsia-300/50 dark:fill-fuchsia-950/30 dark:stroke-fuchsia-600/50" strokeWidth="1" strokeDasharray="2,2"/>
          <text x="116" y="17" textAnchor="middle" className="fill-fuchsia-400 dark:fill-fuchsia-500 text-[8px]">W<tspan baselineShift="super" className="text-[6px]">UK</tspan></text>
          
          {/* × */}
          <text x="150" y="18" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[11px]">×</text>
          
          {/* c^KV */}
          <rect x="160" y="0" width="28" height="26" rx="4" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="174" y="17" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[10px] font-medium">c<tspan baselineShift="super" className="text-[7px]">KV</tspan></text>

          
          {/* W^combined label below */}
          <text x="94" y="44" textAnchor="middle" className="fill-fuchsia-500 dark:fill-fuchsia-400 text-[9px] font-medium">W<tspan baselineShift="super" className="text-[7px]">combined</tspan></text>
          <text x="94" y="54" textAnchor="middle" className="fill-fuchsia-400 dark:fill-fuchsia-500 text-[7px]">(precomputed)</text>
        </g>
      </svg>
      <Caption>W<sup>combined</sup> absorbs W<sup>UQ</sup> and W<sup>UK</sup>.</Caption>
    </figure>
  );
}
