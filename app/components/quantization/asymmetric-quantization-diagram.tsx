import { Caption } from "../caption";

export function AsymmetricQuantizationDiagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 340 240" className="w-full max-w-md mx-auto">
        {/* FP32 number line */}
        <g transform="translate(40, 30)">
          <text x="-25" y="24" textAnchor="middle" className="fill-slate-500 text-[11px] font-medium">fp32</text>
          
          {/* Number line */}
          <line x1="0" y1="20" x2="260" y2="20" className="stroke-violet-300" strokeWidth="2"/>
          
          {/* Min marker */}
          <line x1="10" y1="12" x2="10" y2="28" className="stroke-violet-500" strokeWidth="2"/>
          <text x="10" y="42" textAnchor="middle" className="fill-violet-600 text-[9px]">-3.2</text>
          <text x="10" y="52" textAnchor="middle" className="fill-violet-400 text-[7px]">min</text>
          
          {/* Zero marker - positioned proportionally: 3.2/(3.2+5.8) = 0.356 of the way */}
          <line x1="102" y1="12" x2="102" y2="28" className="stroke-slate-400" strokeWidth="1.5" strokeDasharray="3,2"/>
          <text x="102" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">0</text>
          
          {/* Max marker */}
          <line x1="250" y1="12" x2="250" y2="28" className="stroke-violet-500" strokeWidth="2"/>
          <text x="250" y="42" textAnchor="middle" className="fill-violet-600 text-[9px]">5.8</text>
          <text x="250" y="52" textAnchor="middle" className="fill-violet-400 text-[7px]">max</text>
        </g>

        {/* Mapping arrows from fp32 to int8 */}
        <g transform="translate(40, 75)">
          {/* Min to min arrow */}
          <line x1="10" y1="14" x2="10" y2="32" className="stroke-violet-400" strokeWidth="1.5"/>
          <polygon points="10,38 6,32 14,32" className="fill-violet-400"/>
          
          
          {/* Max to max arrow */}
          <line x1="250" y1="14" x2="250" y2="32" className="stroke-violet-400" strokeWidth="1.5"/>
          <polygon points="250,38 246,32 254,32" className="fill-violet-400"/>
        </g>

        {/* INT8 number line */}
        <g transform="translate(40, 110)">
          <text x="-25" y="24" textAnchor="middle" className="fill-slate-500 text-[11px] font-medium">int8</text>
          
          {/* Number line */}
          <line x1="0" y1="20" x2="260" y2="20" className="stroke-amber-300" strokeWidth="2"/>
          
          {/* Min marker (-128) */}
          <line x1="10" y1="12" x2="10" y2="28" className="stroke-amber-500" strokeWidth="2"/>
          <text x="10" y="42" textAnchor="middle" className="fill-amber-600 text-[9px]">-128</text>
          
          {/* Zero-point marker - positioned at 35 on int8 scale */}
          <rect x="145" y="6" width="36" height="18" rx="3" className="fill-sky-100 stroke-sky-300" strokeWidth="1"/>
          <text x="163" y="19" textAnchor="middle" className="fill-sky-600 text-[8px]">zp=35</text>
          <line x1="163" y1="24" x2="163" y2="28" className="stroke-sky-400" strokeWidth="1.5"/>
          <text x="163" y="42" textAnchor="middle" className="fill-slate-400 text-[7px]">(≈0 in fp32)</text>
          
          {/* Max marker (127) */}
          <line x1="250" y1="12" x2="250" y2="28" className="stroke-amber-500" strokeWidth="2"/>
          <text x="250" y="42" textAnchor="middle" className="fill-amber-600 text-[9px]">127</text>
        </g>

        {/* Scaling factor */}
        <g transform="translate(60, 165)">
          <text x="110" y="12" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[9px] font-medium">scale = (max - min) / 255</text>
          <text x="110" y="23" textAnchor="middle" className="fill-slate-500 dark:fill-slate-500 text-[8px]">s = (5.8 - (-3.2)) / 255 ≈ 0.035</text>
        </g>

        {/* Dequantization formula */}
        <g transform="translate(40, 200)">
          <text x="130" y="12" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[9px] font-medium">dequantize: x = scale × (q - zero_point)</text>
          <text x="130" y="23" textAnchor="middle" className="fill-slate-500 dark:fill-slate-500 text-[8px]">fp16 value = 0.035 × (int8_weight - 35)</text>
        </g>
      </svg>
      <Caption>Asymmetric quantization maps fp32 min/max to int8 range, using scale and zero-point to preserve the original distribution.</Caption>
    </figure>
  );
}

