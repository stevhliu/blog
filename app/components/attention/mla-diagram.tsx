import { Caption } from "../caption";

export function MLADiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 520 280" className="w-full max-w-xl mx-auto">
        {/* Input hidden state */}
        <g transform="translate(20, 120)">
          <rect x="0" y="0" width="44" height="50" rx="6" className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1.5"/>
          <text x="22" y="30" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[12px] font-medium">h</text>
        </g>

        {/* Arrow from h */}
        <g transform="translate(68, 145)">
          <line x1="0" y1="0" x2="24" y2="0" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>
          <polygon points="24,0 18,-4 18,4" className="fill-slate-300 dark:fill-slate-600"/>
        </g>

        {/* Content stream box */}
        <rect x="95" y="20" width="190" height="120" rx="10" className="fill-violet-50/50 stroke-violet-200 dark:fill-violet-950/30 dark:stroke-violet-700" strokeWidth="1.5" strokeDasharray="5,4"/>
        <text x="190" y="38" textAnchor="middle" className="fill-violet-400 dark:fill-violet-500 text-[10px]">content stream</text>

        {/* Compressed latent cQ */}
        <g transform="translate(110, 55)">
          <rect x="0" y="0" width="32" height="32" rx="5" className="fill-sky-100 stroke-sky-400 dark:fill-sky-900 dark:stroke-sky-500" strokeWidth="1.5"/>
          <text x="16" y="21" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[11px] font-medium">c<tspan baselineShift="super" className="text-[8px]">Q</tspan></text>
        </g>

        {/* Compressed latent cKV */}
        <g transform="translate(110, 95)">
          <rect x="0" y="0" width="32" height="32" rx="5" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="16" y="21" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[11px] font-medium">c<tspan baselineShift="super" className="text-[8px]">KV</tspan></text>
        </g>

        {/* × symbol */}
        <text x="160" y="90" textAnchor="middle" className="fill-slate-400 text-[14px]">×</text>

        {/* W^combined */}
        <g transform="translate(175, 60)">
          <rect x="0" y="0" width="44" height="50" rx="6" className="fill-fuchsia-100 stroke-fuchsia-400 dark:fill-fuchsia-900 dark:stroke-fuchsia-500" strokeWidth="1.5"/>
          <text x="22" y="26" textAnchor="middle" className="fill-fuchsia-600 dark:fill-fuchsia-400 text-[9px] font-medium">W<tspan baselineShift="super" className="text-[7px]">comb</tspan></text>
        </g>

        {/* × symbol */}
        <text x="237" y="90" textAnchor="middle" className="fill-slate-400 text-[14px]">×</text>

        {/* Arrow from content stream */}
        <g transform="translate(253, 85)">
          <line x1="0" y1="0" x2="32" y2="0" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>
          <polygon points="32,0 26,-4 26,4" className="fill-slate-300 dark:fill-slate-600"/>
        </g>

        {/* Position stream box */}
        <rect x="95" y="150" width="190" height="110" rx="10" className="fill-teal-50/50 stroke-teal-200 dark:fill-teal-950/30 dark:stroke-teal-700" strokeWidth="1.5" strokeDasharray="5,4"/>
        <text x="190" y="168" textAnchor="middle" className="fill-teal-400 dark:fill-teal-500 text-[10px]">position stream (RoPE)</text>

        {/* qR */}
        <g transform="translate(110, 185)">
          <rect x="0" y="0" width="32" height="32" rx="5" className="fill-sky-100 stroke-sky-400 dark:fill-sky-900 dark:stroke-sky-500" strokeWidth="1.5"/>
          <text x="16" y="21" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[11px] font-medium">q<tspan baselineShift="super" className="text-[8px]">R</tspan></text>
        </g>

        {/* × symbol */}
        <text x="160" y="206" textAnchor="middle" className="fill-slate-400 text-[14px]">×</text>

        {/* kR */}
        <g transform="translate(175, 185)">
          <rect x="0" y="0" width="32" height="32" rx="5" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="16" y="21" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[11px] font-medium">k<tspan baselineShift="super" className="text-[8px]">R</tspan></text>
        </g>

        {/* R label for position encoding */}
        <g transform="translate(220, 188)">
          <text x="0" y="12" textAnchor="start" className="fill-teal-500 dark:fill-teal-400 text-[10px]">R<tspan baselineShift="sub" className="text-[7px]">t</tspan>,R<tspan baselineShift="sub" className="text-[7px]">j</tspan></text>
        </g>

        {/* Arrow from position stream */}
        <g transform="translate(253, 201)">
          <line x1="0" y1="0" x2="32" y2="0" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>
          <polygon points="32,0 26,-4 26,4" className="fill-slate-300 dark:fill-slate-600"/>
        </g>

        {/* + symbol joining streams */}
        <g transform="translate(305, 115)">
          <circle cx="15" cy="30" r="18" className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="1.5"/>
          <text x="15" y="36" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[18px] font-medium">+</text>
        </g>

        {/* Connecting lines to + */}
        <line x1="287" y1="85" x2="295" y2="130" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>
        <line x1="287" y1="201" x2="295" y2="160" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>

        {/* Arrow from + */}
        <g transform="translate(338, 145)">
          <line x1="0" y1="0" x2="32" y2="0" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5"/>
          <polygon points="32,0 26,-4 26,4" className="fill-slate-300 dark:fill-slate-600"/>
        </g>

        {/* Final attention output */}
        <g transform="translate(380, 100)">
          <rect x="0" y="0" width="80" height="90" rx="8" className="fill-rose-50 stroke-rose-300 dark:fill-rose-950 dark:stroke-rose-600" strokeWidth="1.5"/>
          <text x="40" y="25" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[10px]">attention</text>
          <text x="40" y="40" textAnchor="middle" className="fill-rose-500 dark:fill-rose-400 text-[10px]">output</text>
          {/* Small grid representation */}
          <rect x="15" y="52" width="20" height="20" rx="3" className="fill-rose-200 dark:fill-rose-800"/>
          <rect x="45" y="52" width="20" height="20" rx="3" className="fill-rose-100 dark:fill-rose-900"/>
        </g>

        {/* KV cache indicator */}
        <g transform="translate(95, 95)">
          <rect x="0" y="0" width="55" height="50" rx="5" className="fill-none stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1" strokeDasharray="3,2"/>
          <text x="27" y="62" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[8px]">cached</text>
        </g>

        {/* kR cache indicator */}
        <g transform="translate(170, 182)">
          <rect x="0" y="0" width="45" height="42" rx="5" className="fill-none stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1" strokeDasharray="3,2"/>
          <text x="22" y="54" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[8px]">cached</text>
        </g>
      </svg>
      <Caption>MLA compresses Q and KV into latents. Content flows through W<sup>comb</sup>. Position flows through decoupled RoPE vectors.</Caption>
    </figure>
  );
}
