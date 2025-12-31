import { Caption } from "../caption";

export function DeviceMapDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 420 130" className="w-full max-w-lg mx-auto">
        {/* Timeline header */}
        <g transform="translate(80, 15)">
          <text x="140" y="0" textAnchor="middle" className="fill-slate-400 text-[9px]">time →</text>
        </g>

        {/* GPU labels - aligned with row centers */}
        <g transform="translate(15, 30)">
          <text x="0" y="18" className="fill-sky-600 text-[10px] font-medium">GPU 0</text>
          <text x="0" y="53" className="fill-amber-600 text-[10px] font-medium">GPU 1</text>
          <text x="0" y="88" className="fill-emerald-600 text-[10px] font-medium">GPU 2</text>
        </g>

        {/* Timeline bars */}
        <g transform="translate(70, 30)">
          {/* GPU 0 row */}
          <g transform="translate(0, 0)">
            {/* Active block */}
            <rect x="0" y="0" width="90" height="28" rx="4" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
            <text x="45" y="18" textAnchor="middle" className="fill-sky-700 text-[9px] font-medium">layers 0-7</text>
            {/* Idle blocks */}
            <rect x="95" y="0" width="90" height="28" rx="4" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="4,2"/>
            <text x="140" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[9px]">idle</text>
            <rect x="190" y="0" width="90" height="28" rx="4" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="4,2"/>
            <text x="235" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[9px]">idle</text>
          </g>

          {/* GPU 1 row */}
          <g transform="translate(0, 35)">
            {/* Idle block */}
            <rect x="0" y="0" width="90" height="28" rx="4" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="4,2"/>
            <text x="45" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[9px]">idle</text>
            {/* Active block */}
            <rect x="95" y="0" width="90" height="28" rx="4" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
            <text x="140" y="18" textAnchor="middle" className="fill-amber-700 text-[9px] font-medium">layers 8-15</text>
            {/* Idle block */}
            <rect x="190" y="0" width="90" height="28" rx="4" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="4,2"/>
            <text x="235" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[9px]">idle</text>
          </g>

          {/* GPU 2 row */}
          <g transform="translate(0, 70)">
            {/* Idle blocks */}
            <rect x="0" y="0" width="90" height="28" rx="4" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="4,2"/>
            <text x="45" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[9px]">idle</text>
            <rect x="95" y="0" width="90" height="28" rx="4" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="4,2"/>
            <text x="140" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[9px]">idle</text>
            {/* Active block */}
            <rect x="190" y="0" width="90" height="28" rx="4" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
            <text x="235" y="18" textAnchor="middle" className="fill-emerald-700 text-[9px] font-medium">layers 16-23</text>
          </g>

        </g>

        {/* Output arrow - aligned with GPU 2 row */}
        <g transform="translate(352, 114)">
          <line x1="0" y1="0" x2="18" y2="0" className="stroke-slate-300" strokeWidth="1.5"/>
          <polygon points="26,0 18,-5 18,5" className="fill-slate-300"/>
        </g>

        {/* Output - aligned with GPU 2 row */}
        <g transform="translate(380, 100)">
          <rect x="0" y="0" width="32" height="28" rx="4" className="fill-teal-100 stroke-teal-400" strokeWidth="1.5"/>
          <text x="16" y="18" textAnchor="middle" className="fill-teal-600 text-[10px] font-medium">Y</text>
        </g>
      </svg>
      <Caption>With device_map, GPUs process layers sequentially. Only one GPU is active at a time while others idle.</Caption>
    </figure>
  );
}

