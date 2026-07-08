import type { ReactNode } from 'react';

type BannerVariant = 'warning' | 'success' | 'info';

const styles: Record<BannerVariant, string> = {
  warning: 'border-amber-400/25 bg-amber-400/[0.06]',
  success: 'border-emerald-400/25 bg-emerald-400/[0.06]',
  info: 'border-white/10 bg-white/[0.04]',
};

export function Banner({
  variant = 'info',
  title,
  description,
  action,
}: {
  variant?: BannerVariant;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${styles[variant]}`}>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {description ? <p className="mt-0.5 text-sm text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
