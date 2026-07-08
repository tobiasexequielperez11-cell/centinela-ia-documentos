import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'warning' | 'danger' | 'success';

const tones: Record<Tone, string> = {
  neutral: 'border-white/10 bg-white/[0.06] text-slate-300',
  accent: 'border-accent/30 bg-accent/[0.10] text-accent-soft',
  warning: 'border-amber-400/30 bg-amber-400/[0.10] text-amber-200',
  danger: 'border-red-400/30 bg-red-400/[0.10] text-red-200',
  success: 'border-emerald-400/30 bg-emerald-400/[0.10] text-emerald-200',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
