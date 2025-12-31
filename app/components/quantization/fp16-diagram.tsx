import { Caption } from "../caption";

export function FP16Diagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 280 70" className="w-full max-w-md mx-auto">
        {/* Sign bit */}
        <g transform="translate(20, 10)">
          <rect x="0" y="0" width="20" height="40" rx="4" className="fill-rose-100 stroke-rose-400" strokeWidth="1.5"/>
          <text x="10" y="25" textAnchor="middle" className="fill-rose-600 text-[11px] font-medium">1</text>
          <text x="10" y="52" textAnchor="middle" className="fill-rose-500 text-[9px]">sign</text>
        </g>

        {/* Exponent bits */}
        <g transform="translate(45, 10)">
          <rect x="0" y="0" width="70" height="40" rx="4" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="35" y="25" textAnchor="middle" className="fill-amber-600 text-[11px] font-medium">5</text>
          <text x="35" y="52" textAnchor="middle" className="fill-amber-500 text-[9px]">exponent</text>
        </g>

        {/* Significand bits */}
        <g transform="translate(120, 10)">
          <rect x="0" y="0" width="140" height="40" rx="4" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="70" y="25" textAnchor="middle" className="fill-sky-600 text-[11px] font-medium">10</text>
          <text x="70" y="52" textAnchor="middle" className="fill-sky-500 text-[9px]">significand</text>
        </g>

      </svg>
      <Caption>fp16: 1 sign bit, 5 exponent bits, 10 significand bits.</Caption>
    </figure>
  );
}

