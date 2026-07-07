export type DonutSegment = { color: string; count: number };

export function DonutChart({ segments, centerLabel }: { segments: DonutSegment[]; centerLabel: string }) {
  const size = 132;
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((a, b) => a + b.count, 0) || 1;

  const rings = segments.reduce<{ off: number; els: React.ReactNode[] }>(
    (acc, s, i) => {
      const len = (s.count / total) * C;
      acc.els.push(
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={16}
          strokeDasharray={`${len} ${C - len}`}
          strokeDashoffset={-acc.off}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      );
      return { off: acc.off + len, els: acc.els };
    },
    { off: 0, els: [] }
  ).els;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-none">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF2F3" strokeWidth={16} />
      {rings}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={26} fontWeight={700} fontFamily="var(--font-display)" fill="#0E1B22">
        {total}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fontSize={11} fill="#94A2A8" fontWeight={600}>
        {centerLabel}
      </text>
    </svg>
  );
}
