export function AreaChart({ values }: { values: number[] }) {
  const W = 620;
  const H = 170;
  const pad = 6;
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.94;
  const xs = (i: number) => (i / (values.length - 1)) * W;
  const ys = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2 - 8);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-3 block">
      <defs>
        <linearGradient id="ivArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12B2B2" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#12B2B2" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ivArea)" />
      <path d={line} fill="none" stroke="#12B2B2" strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
