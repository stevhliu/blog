import { Caption } from "../caption";

export function FA3WGMMADiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 400 130" className="w-full max-w-lg mx-auto">
        {/* Loop body - showing overlap */}
        <g transform="translate(20, 10)">
          {/* Timeline labels */}
          <text x="82" y="8" textAnchor="middle" className="fill-slate-400 text-[6px]">step 1</text>
          <text x="160" y="8" textAnchor="middle" className="fill-slate-400 text-[6px]">step 2</text>
          <text x="238" y="8" textAnchor="middle" className="fill-slate-400 text-[6px]">step 3</text>
          <text x="317" y="8" textAnchor="middle" className="fill-slate-400 text-[6px]">step 4</text>
          
          {/* WGMMA pipeline row */}
          <g transform="translate(0, 15)">
            <text x="0" y="20" className="fill-violet-600 text-[7px] font-medium">WGMMA</text>
            
            {/* S_next = async_wgmma(Q, K_j) */}
            <rect x="42" y="0" width="80" height="32" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="82" y="13" textAnchor="middle" className="fill-violet-700 text-[7px]">S_next = Q @ Kⱼ</text>
            <text x="82" y="25" textAnchor="middle" className="fill-violet-500 text-[6px]">async (no block)</text>
            
            
            {/* O = async_wgmma(...) */}
            <rect x="198" y="0" width="80" height="32" rx="3" className="fill-violet-200 stroke-violet-400" strokeWidth="1"/>
            <text x="238" y="13" textAnchor="middle" className="fill-violet-700 text-[7px]">O += P @ Vⱼ₋₁</text>
            <text x="238" y="25" textAnchor="middle" className="fill-violet-500 text-[6px]">async accumulate</text>
            
            {/* Wait */}
            <rect x="282" y="0" width="70" height="32" rx="3" className="fill-slate-200 stroke-slate-400" strokeWidth="1"/>
            <text x="317" y="13" textAnchor="middle" className="fill-slate-600 text-[7px]">wgmma_wait</text>
            <text x="317" y="25" textAnchor="middle" className="fill-slate-500 text-[6px]">sync point</text>
          </g>
          
          {/* Overlap bracket */}
          <g transform="translate(122, 49)">
            <line x1="0" y1="0" x2="0" y2="8" className="stroke-emerald-400" strokeWidth="1.5"/>
            <line x1="0" y1="8" x2="76" y2="8" className="stroke-emerald-400" strokeWidth="1.5"/>
            <line x1="76" y1="0" x2="76" y2="8" className="stroke-emerald-400" strokeWidth="1.5"/>
            <text x="38" y="18" textAnchor="middle" className="fill-emerald-600 text-[6px]">overlap</text>
          </g>
          
          {/* Softmax pipeline row */}
          <g transform="translate(0, 74)">
            <text x="0" y="20" className="fill-amber-600 text-[7px] font-medium">softmax</text>
            
            {/* Idle during S_next issue */}
            <rect x="42" y="0" width="80" height="32" rx="3" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="82" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[6px]">(S_next issuing)</text>
            
            {/* Softmax on S_curr */}
            <rect x="124" y="0" width="72" height="32" rx="3" className="fill-amber-200 stroke-amber-400" strokeWidth="1"/>
            <text x="160" y="11" textAnchor="middle" className="fill-amber-700 text-[6px]">m = max(m, rowmax(S))</text>
            <text x="160" y="21" textAnchor="middle" className="fill-amber-700 text-[6px]">P = exp(S - m)</text>
            
            {/* Idle during O and wait */}
            <rect x="198" y="0" width="154" height="32" rx="3" className="fill-slate-50 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-500" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="275" y="18" textAnchor="middle" className="fill-slate-300 dark:fill-slate-500 text-[6px]">(O accumulating + wait)</text>
          </g>
          
        </g>
      </svg>
      <Caption>WGMMA issues async matmuls, allowing softmax to run in parallel on the previous block&apos;s scores.</Caption>
    </figure>
  );
}
