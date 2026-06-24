interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
}

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <p className="text-sm font-medium text-[#C2CCD9]">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {helper ? <p className="mt-4 text-xs font-semibold text-slate-400">{helper}</p> : null}
    </div>
  );
}
