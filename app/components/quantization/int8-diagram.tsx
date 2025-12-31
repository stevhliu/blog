import { Caption } from "../caption";

export function Int8Diagram() {
  return (
    <figure className="my-8">
      <svg viewBox="0 0 200 70" className="w-full max-w-xs mx-auto">
        {/* Sign bit */}
        <g transform="translate(20, 10)">
          <rect x="0" y="0" width="20" height="40" rx="4" className="fill-rose-100 stroke-rose-400" strokeWidth="1.5"/>
          <text x="10" y="25" textAnchor="middle" className="fill-rose-600 text-[11px] font-medium">1</text>
          <text x="10" y="52" textAnchor="middle" className="fill-rose-500 text-[9px]">sign</text>
        </g>

        {/* Significand bits */}
        <g transform="translate(45, 10)">
          <rect x="0" y="0" width="135" height="40" rx="4" className="fill-emerald-100 stroke-emerald-400" strokeWidth="1.5"/>
          <text x="67" y="25" textAnchor="middle" className="fill-emerald-600 text-[11px] font-medium">7</text>
          <text x="67" y="52" textAnchor="middle" className="fill-emerald-500 text-[9px]">significand</text>
        </g>

      </svg>
      <Caption>int8: 1 sign bit, 7 significand bits.</Caption>
    </figure>
  );
}

