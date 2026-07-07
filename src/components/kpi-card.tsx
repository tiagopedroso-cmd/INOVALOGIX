export function KpiCard({
  label,
  value,
  accent,
  iconBg,
  sub,
}: {
  label: string;
  value: string;
  accent: string;
  iconBg: string;
  sub: string;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-white p-5 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</span>
        <span className="grid h-[34px] w-[34px] place-items-center rounded-[11px]" style={{ background: iconBg }}>
          <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: accent }} />
        </span>
      </div>
      <div className="my-3 font-[family-name:var(--font-display)] text-[28px] font-bold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}
