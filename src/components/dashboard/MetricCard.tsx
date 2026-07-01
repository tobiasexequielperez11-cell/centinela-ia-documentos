import Link from 'next/link';

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  href?: string;
}

export function MetricCard({ label, value, helper, href }: MetricCardProps) {
  const content = (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm h-full ${href ? 'hover:bg-white/[0.08] transition-colors' : ''}`}>
      <p className="text-sm font-medium text-[#C2CCD9]">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {helper ? <p className="mt-4 text-xs font-semibold text-slate-400">{helper}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full outline-none focus:ring-2 focus:ring-sky-400 rounded-3xl">
        {content}
      </Link>
    );
  }

  return content;
}
