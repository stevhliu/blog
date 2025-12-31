import { Caption } from "../caption";

export function BMIDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 380 120" className="w-full max-w-md mx-auto">
        {/* Shards */}
        <g transform="translate(20, 28)">
          <text x="40" y="-13" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">shards</text>
          
          <g transform="translate(0, 5)">
            <rect x="0" y="0" width="35" height="28" rx="3" className="fill-rose-100 stroke-rose-400" strokeWidth="1.5"/>
            <text x="17" y="12" textAnchor="middle" className="fill-rose-600 text-[7px] font-medium">shard 1</text>
            <text x="17" y="22" textAnchor="middle" className="fill-rose-400 text-[5px]">weights</text>
          </g>
          
          <g transform="translate(0, 37)">
            <rect x="0" y="0" width="35" height="28" rx="3" className="fill-rose-100 stroke-rose-400" strokeWidth="1.5"/>
            <text x="17" y="12" textAnchor="middle" className="fill-rose-600 text-[7px] font-medium">shard 2</text>
            <text x="17" y="22" textAnchor="middle" className="fill-rose-400 text-[5px]">weights</text>
          </g>
          
          <g transform="translate(42, 5)">
            <rect x="0" y="0" width="35" height="28" rx="3" className="fill-rose-100 stroke-rose-400" strokeWidth="1.5"/>
            <text x="17" y="12" textAnchor="middle" className="fill-rose-600 text-[7px] font-medium">shard 3</text>
            <text x="17" y="22" textAnchor="middle" className="fill-rose-400 text-[5px]">weights</text>
          </g>
          
          <g transform="translate(42, 37)">
            <rect x="0" y="0" width="35" height="28" rx="3" className="fill-rose-100 stroke-rose-400" strokeWidth="1.5"/>
            <text x="17" y="12" textAnchor="middle" className="fill-rose-600 text-[7px] font-medium">shard n</text>
            <text x="17" y="22" textAnchor="middle" className="fill-rose-400 text-[5px]">weights</text>
          </g>
        </g>
        
        {/* Arrow */}
        <g transform="translate(105, 60)">
          <line x1="0" y1="0" x2="25" y2="0" className="stroke-rose-400" strokeWidth="1.5"/>
          <polygon points="30,0 24,-4 24,4" className="fill-rose-400"/>
          <text x="15" y="-8" textAnchor="middle" className="fill-rose-500 text-[6px]">load</text>
        </g>
        
        {/* Empty model on meta device */}
        <g transform="translate(150, 15)">
          <text x="95" y="0" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">empty model (meta device)</text>
          
          <rect x="0" y="10" width="190" height="80" rx="6" className="fill-violet-50 stroke-violet-300 dark:fill-violet-950 dark:stroke-violet-500" strokeWidth="1.5" strokeDasharray="4,2"/>
          
          {/* Slots being filled */}
          <g transform="translate(15, 25)">
            {/* Row 1 */}
            <rect x="0" y="0" width="35" height="22" rx="2" className="fill-rose-200 stroke-rose-400" strokeWidth="1"/>
            <text x="17" y="14" textAnchor="middle" className="fill-rose-600 text-[6px]">filled</text>
            
            <rect x="40" y="0" width="35" height="22" rx="2" className="fill-rose-200 stroke-rose-400" strokeWidth="1"/>
            <text x="57" y="14" textAnchor="middle" className="fill-rose-600 text-[6px]">filled</text>
            
            <rect x="80" y="0" width="35" height="22" rx="2" className="fill-white stroke-violet-300 dark:fill-slate-800 dark:stroke-violet-500" strokeWidth="1" strokeDasharray="2,1"/>
            <text x="97" y="14" textAnchor="middle" className="fill-violet-400 text-[6px]">empty</text>
            
            <rect x="120" y="0" width="35" height="22" rx="2" className="fill-white stroke-violet-300 dark:fill-slate-800 dark:stroke-violet-500" strokeWidth="1" strokeDasharray="2,1"/>
            <text x="137" y="14" textAnchor="middle" className="fill-violet-400 text-[6px]">empty</text>
            
            {/* Row 2 */}
            <rect x="0" y="28" width="35" height="22" rx="2" className="fill-rose-200 stroke-rose-400" strokeWidth="1"/>
            <text x="17" y="42" textAnchor="middle" className="fill-rose-600 text-[6px]">filled</text>
            
            <rect x="40" y="28" width="35" height="22" rx="2" className="fill-white stroke-violet-300 dark:fill-slate-800 dark:stroke-violet-500" strokeWidth="1" strokeDasharray="2,1"/>
            <text x="57" y="42" textAnchor="middle" className="fill-violet-400 text-[6px]">empty</text>
            
            <rect x="80" y="28" width="35" height="22" rx="2" className="fill-white stroke-violet-300 dark:fill-slate-800 dark:stroke-violet-500" strokeWidth="1" strokeDasharray="2,1"/>
            <text x="97" y="42" textAnchor="middle" className="fill-violet-400 text-[6px]">empty</text>
            
            <rect x="120" y="28" width="35" height="22" rx="2" className="fill-white stroke-violet-300 dark:fill-slate-800 dark:stroke-violet-500" strokeWidth="1" strokeDasharray="2,1"/>
            <text x="137" y="42" textAnchor="middle" className="fill-violet-400 text-[6px]">empty</text>
          </g>
        </g>
        
        {/* Bottom note */}
        <text x="190" y="118" textAnchor="middle" className="fill-slate-400 text-[7px]">shards loaded one at a time, discarded after use</text>
      </svg>
      <Caption>Shards load weights into the empty model on the meta device. Each shard is discarded after its weights are placed.</Caption>
    </figure>
  );
}
