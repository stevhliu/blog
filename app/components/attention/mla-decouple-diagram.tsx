import { Caption } from "../caption";

export function MLADecoupleDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 16 260 196" className="w-full max-w-sm mx-auto">
        {/* ALL LINES FIRST (drawn underneath rectangles) */}
        
        {/* Arrow up from h splitting to latents */}
        <path d="M 130 180 L 130 165 L 70 165 L 70 154" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 130 165 L 190 165 L 190 154" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinejoin="round"/>

        {/* From c^Q to vectors - content goes through W^combined area */}
        <path d="M 70 130 L 70 115 L 40 115 L 40 99" className="fill-none stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 70 115 L 100 115 L 100 99" className="fill-none stroke-rose-400 dark:stroke-rose-500" strokeWidth="1.5" strokeLinejoin="round"/>

        {/* From c^KV to vectors */}
        <path d="M 190 130 L 190 115 L 160 115 L 160 99" className="fill-none stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 190 115 L 220 115 L 220 99" className="fill-none stroke-rose-400 dark:stroke-rose-500" strokeWidth="1.5" strokeLinejoin="round"/>


        {/* From vectors to sum circles - lines stop at circle edge */}
        <path d="M 40 75 L 40 65 L 62 65" className="fill-none stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 100 75 L 100 65 L 78 65" className="fill-none stroke-rose-400 dark:stroke-rose-500" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 160 75 L 160 65 L 182 65" className="fill-none stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 220 75 L 220 65 L 198 65" className="fill-none stroke-rose-400 dark:stroke-rose-500" strokeWidth="1.5" strokeLinejoin="round"/>

        {/* From sum circles to attention */}
        <path d="M 70 57 L 70 38 L 130 38 L 130 30" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 190 57 L 190 38 L 130 38" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinejoin="round"/>

        {/* ALL RECTANGLES AFTER (drawn on top of lines) */}

        {/* Attention box */}
        <g transform="translate(80, 18)">
          <rect x="0" y="0" width="100" height="12" rx="3" className="fill-amber-50 stroke-amber-400 dark:fill-amber-950/50 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="50" y="9" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[8px] font-medium">Attention</text>
        </g>

        {/* Sum circles with + at junction of green/rose lines */}
        <g transform="translate(70, 65)">
          <circle cx="0" cy="0" r="8" className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1.5"/>
          <text x="0" y="3" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[10px] font-bold">+</text>
        </g>
        <g transform="translate(190, 65)">
          <circle cx="0" cy="0" r="8" className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1.5"/>
          <text x="0" y="3" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[10px] font-bold">+</text>
        </g>

        {/* Content vectors (q^C, k^C) */}
        <g transform="translate(25, 75)">
          <rect x="0" y="0" width="30" height="24" rx="4" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="15" y="16" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-medium">q<tspan baselineShift="super" className="text-[6px]">C</tspan></text>
        </g>
        <g transform="translate(145, 75)">
          <rect x="0" y="0" width="30" height="24" rx="4" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1.5"/>
          <text x="15" y="16" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-medium">k<tspan baselineShift="super" className="text-[6px]">C</tspan></text>
        </g>

        {/* Position vectors (q^R, k^R) */}
        <g transform="translate(85, 75)">
          <rect x="0" y="0" width="30" height="24" rx="4" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="15" y="16" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[9px] font-medium">q<tspan baselineShift="super" className="text-[6px]">R</tspan></text>
        </g>
        <g transform="translate(205, 75)">
          <rect x="0" y="0" width="30" height="24" rx="4" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1.5"/>
          <text x="15" y="16" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[9px] font-medium">k<tspan baselineShift="super" className="text-[6px]">R</tspan></text>
          {/* Cache indicator */}
          <rect x="18" y="-8" width="18" height="12" rx="2" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1"/>
          <text x="27" y="0" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[6px]">cache</text>
        </g>

        {/* c^Q latent (left) */}
        <g transform="translate(45, 130)">
          <rect x="0" y="0" width="50" height="24" rx="4" className="fill-sky-100 stroke-sky-400 dark:fill-sky-900 dark:stroke-sky-500" strokeWidth="1.5"/>
          <text x="25" y="16" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[9px] font-medium">c<tspan baselineShift="super" className="text-[6px]">Q</tspan></text>
        </g>

        {/* c^KV latent (right) - with cache indicator */}
        <g transform="translate(165, 130)">
          <rect x="0" y="0" width="50" height="24" rx="4" className="fill-amber-100 stroke-amber-400 dark:fill-amber-900 dark:stroke-amber-500" strokeWidth="1.5"/>
          <text x="25" y="16" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[9px] font-medium">c<tspan baselineShift="super" className="text-[6px]">KV</tspan></text>
          {/* Cache indicator */}
          <rect x="38" y="-8" width="18" height="12" rx="2" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1"/>
          <text x="47" y="0" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[6px]">cache</text>
        </g>

        {/* Input h at bottom */}
        <g transform="translate(105, 180)">
          <rect x="0" y="0" width="50" height="20" rx="4" className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1.5"/>
          <text x="25" y="14" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[9px] font-medium">h</text>
        </g>

        {/* W^combined multiplication shown explicitly between latents */}
        {/* Left × between c^Q and W^combined - centered at (95+105)/2 = 100 */}
        <text x="100" y="146" textAnchor="middle" className="fill-fuchsia-500 dark:fill-fuchsia-400 text-[10px]">×</text>
        
        {/* W^combined box */}
        <g transform="translate(105, 136)">
          <rect x="0" y="0" width="50" height="14" rx="3" className="fill-fuchsia-50 stroke-fuchsia-400 dark:fill-fuchsia-950/50 dark:stroke-fuchsia-500" strokeWidth="1"/>
          <text x="25" y="10" textAnchor="middle" className="fill-fuchsia-600 dark:fill-fuchsia-400 text-[6px] font-medium">W<tspan baselineShift="super" className="text-[4px]">combined</tspan></text>
        </g>
        
        {/* Right × between W^combined and c^KV - centered at (155+165)/2 = 160 */}
        <text x="160" y="146" textAnchor="middle" className="fill-fuchsia-500 dark:fill-fuchsia-400 text-[10px]">×</text>

        {/* RoPE labels */}
        <text x="105" y="112" textAnchor="start" className="fill-rose-400 dark:fill-rose-500 text-[6px]">RoPE</text>
        <text x="225" y="112" textAnchor="start" className="fill-rose-400 dark:fill-rose-500 text-[6px]">RoPE</text>

        {/* Stream labels as legend - bottom left */}
        <g transform="translate(5, 190)">
          <rect x="0" y="0" width="8" height="8" rx="1" className="fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900 dark:stroke-emerald-500" strokeWidth="1"/>
          <text x="12" y="7" className="fill-emerald-600 dark:fill-emerald-400 text-[6px]">content</text>
          <rect x="45" y="0" width="8" height="8" rx="1" className="fill-rose-100 stroke-rose-400 dark:fill-rose-900 dark:stroke-rose-500" strokeWidth="1"/>
          <text x="57" y="7" className="fill-rose-500 dark:fill-rose-400 text-[6px]">position</text>
        </g>
      </svg>
      <Caption>Content and position are decoupled; c<sup>KV</sup> and k<sup>R</sup> are cached.</Caption>
    </figure>
  );
}
