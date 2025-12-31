import { Caption } from "../caption";

export function FP32Diagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 400 70" className="w-full max-w-lg mx-auto">
        {/* Sign bit */}
        <g transform="translate(20, 10)">
          <rect x="0" y="0" width="30" height="40" rx="4" className="fill-rose-100 stroke-rose-400" strokeWidth="1.5"/>
          <text x="15" y="25" textAnchor="middle" className="fill-rose-600 text-[11px] font-medium">1</text>
          <text x="15" y="52" textAnchor="middle" className="fill-rose-500 text-[9px]">sign</text>
        </g>

        {/* Exponent bits */}
        <g transform="translate(55, 10)">
          <rect x="0" y="0" width="120" height="40" rx="4" className="fill-amber-100 stroke-amber-400" strokeWidth="1.5"/>
          <text x="60" y="25" textAnchor="middle" className="fill-amber-600 text-[11px] font-medium">8</text>
          <text x="60" y="52" textAnchor="middle" className="fill-amber-500 text-[9px]">exponent</text>
        </g>

        {/* Significand bits */}
        <g transform="translate(180, 10)">
          <rect x="0" y="0" width="200" height="40" rx="4" className="fill-sky-100 stroke-sky-400" strokeWidth="1.5"/>
          <text x="100" y="25" textAnchor="middle" className="fill-sky-600 text-[11px] font-medium">23</text>
          <text x="100" y="52" textAnchor="middle" className="fill-sky-500 text-[9px]">significand</text>
        </g>

      </svg>
      <Caption>fp32: 1 sign bit, 8 exponent bits, 23 significand bits.</Caption>
    </figure>
  );
}

