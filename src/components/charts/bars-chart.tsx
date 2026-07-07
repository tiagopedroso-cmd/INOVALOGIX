export type BarsDatum = { label: string; entradas: number; saidas: number };

export function BarsChart({ data }: { data: BarsDatum[] }) {
  const W = 720;
  const H = 260;
  const base = H - 34;
  const top = 12;
  const max = Math.max(1, ...data.flatMap((d) => [d.entradas, d.saidas])) * 1.15;
  const gw = W / Math.max(1, data.length);
  const bw = 34;
  const gap = 10;
  const scale = (v: number) => (v / max) * (base - top);

  const gridLines = [0.25, 0.5, 0.75, 1].map((f, i) => {
    const y = base - scale(max * f);
    return (
      <g key={i}>
        <line x1={0} y1={y} x2={W} y2={y} stroke="#EEF2F3" strokeWidth={1} />
        <text x={0} y={y - 4} fontSize={10} fill="#B4C0C4" fontFamily="var(--font-display)">
          {Math.round(max * f / 1000)}k
        </text>
      </g>
    );
  });

  const bars = data.map((d, i) => {
    const cx = i * gw + gw / 2;
    return (
      <g key={i}>
        <rect x={cx - bw - gap / 2} y={base - scale(d.entradas)} width={bw} height={scale(d.entradas)} rx={6} fill="#12B2B2" />
        <rect x={cx + gap / 2} y={base - scale(d.saidas)} width={bw} height={scale(d.saidas)} rx={6} fill="#CBD6D9" />
        <text x={cx} y={base + 20} fontSize={12} textAnchor="middle" fill="#5E6B72" fontWeight={600}>
          {d.label}
        </text>
      </g>
    );
  });

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="mt-4 block">
      {gridLines}
      {bars}
    </svg>
  );
}
