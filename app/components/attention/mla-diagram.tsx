import { Caption } from "../caption";

export function MLADiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 300 130" className="w-full max-w-xs mx-auto">
        {/* Standard KV cache */}
        <g transform="translate(20, 20)">
          <text x="0" y="-6" className="fill-slate-400 dark:fill-slate-500 text-[9px]">standard</text>
          <rect x="0" y="0" width="260" height="40" rx="5" className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="1.5"/>
          
          {/* Multiple KV blocks */}
          <rect x="8" y="6" width="58" height="28" rx="4" className="fill-amber-100 stroke-amber-300 dark:fill-amber-900/60 dark:stroke-amber-600" strokeWidth="1"/>
          <text x="37" y="24" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[10px]">KV</text>
          
          <rect x="70" y="6" width="58" height="28" rx="4" className="fill-amber-100 stroke-amber-300 dark:fill-amber-900/60 dark:stroke-amber-600" strokeWidth="1"/>
          <text x="99" y="24" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[10px]">KV</text>
          
          <rect x="132" y="6" width="58" height="28" rx="4" className="fill-amber-100 stroke-amber-300 dark:fill-amber-900/60 dark:stroke-amber-600" strokeWidth="1"/>
          <text x="161" y="24" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[10px]">KV</text>
          
          <rect x="194" y="6" width="58" height="28" rx="4" className="fill-amber-100 stroke-amber-300 dark:fill-amber-900/60 dark:stroke-amber-600" strokeWidth="1"/>
          <text x="223" y="24" textAnchor="middle" className="fill-amber-500 dark:fill-amber-400 text-[10px]">KV</text>
        </g>

        {/* MLA cache */}
        <g transform="translate(20, 80)">
          <text x="0" y="-6" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-medium">MLA</text>
          <rect x="0" y="0" width="260" height="40" rx="5" className="fill-emerald-50 stroke-emerald-400 dark:fill-emerald-950/50 dark:stroke-emerald-500" strokeWidth="1.5"/>
          
          {/* Fewer, smaller latent blocks */}
          <rect x="8" y="6" width="20" height="28" rx="4" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <rect x="32" y="6" width="20" height="28" rx="4" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <rect x="56" y="6" width="20" height="28" rx="4" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <rect x="80" y="6" width="20" height="28" rx="4" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>

          {/* Empty space */}
          <rect x="108" y="6" width="144" height="28" rx="4" className="fill-none stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" strokeDasharray="4,3"/>
          <text x="180" y="24" textAnchor="middle" className="fill-slate-300 dark:fill-slate-600 text-[10px]">memory saved</text>
        </g>
      </svg>
      <Caption>MLA compresses KV into small latents.</Caption>
    </figure>
  );
}
