type Point = { x: number; y: number };

export function pointLineGap(radius: number, strokeWidth: number) {
  return radius + strokeWidth / 2;
}

export function buildTrimmedLinePath(
  points: Point[],
  gapAt: (index: number) => number,
): string {
  if (points.length < 2) return "";

  const segments: string[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const gapA = gapAt(i);
    const gapB = gapAt(i + 1);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);

    if (len <= gapA + gapB) continue;

    const ux = dx / len;
    const uy = dy / len;
    const x1 = a.x + ux * gapA;
    const y1 = a.y + uy * gapA;
    const x2 = b.x - ux * gapB;
    const y2 = b.y - uy * gapB;

    segments.push(
      `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    );
  }

  return segments.join(" ");
}
