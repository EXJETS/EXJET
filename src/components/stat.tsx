export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-[24px] font-semibold tracking-tight tabular-nums">{value}</p>
      {sub && <p className="text-[12px] text-subtle">{sub}</p>}
    </div>
  );
}
