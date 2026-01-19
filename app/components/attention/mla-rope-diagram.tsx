import { Caption } from "../caption";

export function MLARoPEDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 250 145" className="w-full max-w-md mx-auto">
        {/* With RoPE - R blocks combination */}
        <g transform="translate(110, 28)">
          <text x="-8" y="16" textAnchor="end" className="fill-rose-500 dark:fill-rose-400 text-[8px] font-medium">with RoPE</text>
          
          {/* W^UQ */}
          <rect x="0" y="0" width="32" height="24" rx="4" className="fill-fuchsia-100 stroke-fuchsia-400 dark:fill-fuchsia-900 dark:stroke-fuchsia-500" strokeWidth="1.5"/>
          <text x="16" y="16" textAnchor="middle" className="fill-fuchsia-600 dark:fill-fuchsia-400 text-[7px] font-medium">W<tspan baselineShift="super" className="text-[5px]">UQ</tspan></text>
          
          {/* Multiply symbol */}
          <text x="39" y="16" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[10px]">×</text>
          
          {/* R in the middle */}
          <rect x="46" y="-4" width="40" height="32" rx="4" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="2"/>
          <text x="66" y="16" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[8px] font-medium">R<tspan baselineShift="sub" className="text-[5px]">t</tspan><tspan baselineShift="super" className="text-[5px]">T</tspan>R<tspan baselineShift="sub" className="text-[5px]">j</tspan></text>
          
          {/* Multiply symbol */}
          <text x="93" y="16" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[10px]">×</text>
          
          {/* W^UK */}
          <rect x="100" y="0" width="32" height="24" rx="4" className="fill-fuchsia-100 stroke-fuchsia-400 dark:fill-fuchsia-900 dark:stroke-fuchsia-500" strokeWidth="1.5"/>
          <text x="116" y="16" textAnchor="middle" className="fill-fuchsia-600 dark:fill-fuchsia-400 text-[7px] font-medium">W<tspan baselineShift="super" className="text-[5px]">UK</tspan></text>
          
        </g>

        {/* R changes per position - rotation dials */}
        <g transform="translate(110, 80)">
          <text x="-8" y="22" textAnchor="end" className="fill-slate-500 dark:fill-slate-400 text-[8px]">R<tspan baselineShift="sub" className="text-[5px]">t</tspan><tspan baselineShift="super" className="text-[5px]">T</tspan>R<tspan baselineShift="sub" className="text-[5px]">j</tspan></text>
          <text x="-8" y="32" textAnchor="end" className="fill-slate-500 dark:fill-slate-400 text-[8px]">changes per position pair</text>
          
          {/* Position (0,1) - small rotation - aligned with W^UQ */}
          <g transform="translate(16, 28)">
            <circle cx="0" cy="0" r="16" className="fill-rose-50 stroke-rose-300 dark:fill-rose-950/50 dark:stroke-rose-500" strokeWidth="1"/>
            <line x1="0" y1="0" x2="10" y2="-12" className="stroke-rose-500 dark:stroke-rose-400" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="0" cy="0" r="2" className="fill-rose-400 dark:fill-rose-500"/>
            <text x="0" y="28" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[7px]">t=0, j=1</text>
          </g>
          
          {/* Position (0,2) - larger rotation - aligned with R block */}
          <g transform="translate(66, 28)">
            <circle cx="0" cy="0" r="16" className="fill-rose-50 stroke-rose-300 dark:fill-rose-950/50 dark:stroke-rose-500" strokeWidth="1"/>
            <line x1="0" y1="0" x2="14" y2="-6" className="stroke-rose-500 dark:stroke-rose-400" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="0" cy="0" r="2" className="fill-rose-400 dark:fill-rose-500"/>
            <text x="0" y="28" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[7px]">t=0, j=2</text>
          </g>
          
          {/* Position (1,2) - same as (0,1) - aligned with W^UK */}
          <g transform="translate(116, 28)">
            <circle cx="0" cy="0" r="16" className="fill-rose-50 stroke-rose-300 dark:fill-rose-950/50 dark:stroke-rose-500" strokeWidth="1"/>
            <line x1="0" y1="0" x2="10" y2="-12" className="stroke-rose-500 dark:stroke-rose-400" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="0" cy="0" r="2" className="fill-rose-400 dark:fill-rose-500"/>
            <text x="0" y="28" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[7px]">t=1, j=2</text>
          </g>
          
        </g>
      </svg>
      <Caption>R<sub>t</sub><sup>T</sup>R<sub>j</sub> sits between W<sup>UQ</sup> and W<sup>UK</sup> and changes per token pair.</Caption>
    </figure>
  );
}
